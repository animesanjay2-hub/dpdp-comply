'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { supabase } from '@/lib/supabase'
import { ComplianceGauge } from '@/components/ComplianceGauge'
import { CountdownTimer } from '@/components/CountdownTimer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { FileText, Cookie, AlertTriangle, Download, ArrowRight, CheckCircle2 } from 'lucide-react'

// Module-level cache — survives route changes, cleared on full reload
let cachedCompany: any = null
let cachedTasks: any[] | null = null

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
      <div className="h-2 bg-gray-200 rounded w-full mb-2" />
      <div className="h-2 bg-gray-200 rounded w-3/4" />
    </div>
  )
}

const CAT_CARDS = [
  { title: 'Consent Management', category: 'consent' },
  { title: 'Privacy Notice', category: 'privacy_notice' },
  { title: 'Data Audit', category: 'data_audit' },
  { title: 'Breach Protocol', category: 'breach_protocol' },
  { title: 'Vendor Contracts', category: 'vendor_contracts' },
  { title: "Children's Data", category: 'children_data' }
]

const DEADLINE_1 = new Date('2026-11-13')
const DEADLINE_2 = new Date('2027-05-13')

export default function DashboardPage() {
  const router = useRouter()
  const { userId, isLoaded } = useAuth()
  const [loading, setLoading] = useState(!cachedCompany)
  const [company, setCompany] = useState<any>(cachedCompany)
  const [tasks, setTasks] = useState<any[]>(cachedTasks ?? [])
  const hasFetched = useRef(!!cachedCompany)

  const loadDashboard = useCallback(async () => {
    if (hasFetched.current) return
    if (!userId) return
    hasFetched.current = true

    const { data: comp } = await supabase
      .from('companies')
      .select('*')
      .eq('clerk_user_id', userId)
      .single()

    if (!comp) { router.push('/onboarding'); return }

    cachedCompany = comp
    setCompany(comp)

    const { data: taskData } = await (supabase
      .from('compliance_tasks') as any)
      .select('id,task_name,category,priority,status,deadline,estimated_time')
      .eq('company_clerk_user_id', userId)
      .order('priority', { ascending: true })

    if (taskData) {
      cachedTasks = taskData
      setTasks(taskData)
    }

    setLoading(false)
  }, [userId, router])

  useEffect(() => {
    if (isLoaded && userId) {
      loadDashboard()
    }
  }, [isLoaded, userId, loadDashboard])

  async function markTaskDone(taskId: string) {
    const updated = tasks.map(t => t.id === taskId ? { ...t, status: 'completed' } : t)
    setTasks(updated)
    cachedTasks = updated

    // Update task status in DB
    await (supabase.from('compliance_tasks') as any).update({ status: 'completed' }).eq('id', taskId)

    // Recalculate and persist compliance score
    const totalTasks = updated.length
    if (totalTasks > 0 && company) {
      const doneTasks = updated.filter(t => t.status === 'completed').length
      const newScore = Math.round((doneTasks / totalTasks) * 100)
      const updatedCompany = { ...company, compliance_score: newScore }
      setCompany(updatedCompany)
      cachedCompany = updatedCompany
      await (supabase.from('companies') as any).update({ compliance_score: newScore }).eq('clerk_user_id', userId)
    }
  }

  const getCategoryProgress = useCallback((category: string) => {
    const cat = tasks.filter(t => t.category === category)
    if (!cat.length) return 0
    return Math.round((cat.filter(t => t.status === 'completed').length / cat.length) * 100)
  }, [tasks])

  const criticalTasks = tasks.filter(t => t.priority === 'critical' && t.status !== 'completed')
  const highTasks = tasks.filter(t => t.priority === 'high' && t.status !== 'completed')

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-24 w-full">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Company Dashboard</h1>
        {company && <p className="text-gray-500">{company.name}</p>}
      </div>

      {/* Top Row: Score & Timers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex flex-col items-center justify-center p-6 shadow-sm border-t-4 border-t-[#1a237e]">
          <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">Compliance Score</h3>
          {loading
            ? <div className="w-40 h-40 rounded-full bg-gray-100 animate-pulse" />
            : <ComplianceGauge score={company?.compliance_score ?? 0} />
          }
        </Card>
        <CountdownTimer targetDate={DEADLINE_1} label="Consent Manager Deadline" urgencyDays={180} />
        <CountdownTimer targetDate={DEADLINE_2} label="Full Enforcement Deadline" urgencyDays={360} />
      </div>

      {/* Categories Grid */}
      <div>
        <h2 className="text-xl font-bold mb-4">Compliance Status</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading
            ? Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)
            : CAT_CARDS.map(cat => {
                const p = getCategoryProgress(cat.category)
                const dot = p === 100 ? 'bg-green-500' : p > 0 ? 'bg-yellow-500' : 'bg-red-500'
                return (
                  <Card key={cat.category} className="shadow-sm">
                    <CardContent className="p-5">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${dot}`} />
                          <span className="font-semibold text-gray-800">{cat.title}</span>
                        </div>
                        <span className="text-sm font-bold">{p}%</span>
                      </div>
                      <Progress value={p} className="h-2 mb-3" />
                      {p < 100 && (
                        <Link href="#tasks" className="text-xs text-blue-600 font-medium hover:underline flex items-center">
                          Fix Now <ArrowRight size={12} className="ml-1" />
                        </Link>
                      )}
                    </CardContent>
                  </Card>
                )
              })
          }
        </div>
      </div>

      {/* Tasks Section */}
      {!loading && (
        <div id="tasks" className="space-y-8">
          {criticalTasks.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-600">
                <AlertTriangle /> Needs Your Attention
              </h2>
              <div className="space-y-3">
                {criticalTasks.map(t => (
                  <Card key={t.id} className="border-l-4 border-l-red-500 shadow-sm">
                    <CardContent className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="destructive">CRITICAL</Badge>
                          <span className="font-semibold">{t.task_name}</span>
                        </div>
                        <p className="text-sm text-gray-500">
                          Due: {t.deadline ? new Date(t.deadline).toLocaleDateString() : 'N/A'} • Est: {t.estimated_time}
                        </p>
                      </div>
                      <Button onClick={() => markTaskDone(t.id)} variant="outline" className="text-green-600 border-green-200 bg-green-50 hover:bg-green-100">
                        <CheckCircle2 size={16} className="mr-2" /> Mark Done
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {highTasks.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-4">High Priority Tasks</h2>
              <div className="space-y-3">
                {highTasks.map(t => (
                  <Card key={t.id} className="border-l-4 border-l-yellow-500 shadow-sm">
                    <CardContent className="p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-yellow-500 hover:bg-yellow-600">HIGH</Badge>
                        <span className="font-semibold">{t.task_name}</span>
                      </div>
                      <Button onClick={() => markTaskDone(t.id)} variant="ghost" className="text-gray-500">
                        Done ✓
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/documents">
            <Button variant="outline" className="w-full h-16 justify-start text-left font-semibold">
              <FileText className="mr-3 text-blue-600" /> Generate Privacy Notice
            </Button>
          </Link>
          <Link href="/consent">
            <Button variant="outline" className="w-full h-16 justify-start text-left font-semibold">
              <Cookie className="mr-3 text-amber-600" /> Set Up Consent Banner
            </Button>
          </Link>
          <Link href="/breach">
            <Button variant="outline" className="w-full h-16 justify-start text-left font-semibold">
              <AlertTriangle className="mr-3 text-red-600" /> Report a Breach
            </Button>
          </Link>
          <Link href="/documents?type=vc_report">
            <Button variant="outline" className="w-full h-16 justify-start text-left font-semibold border-teal-200 bg-teal-50 hover:bg-teal-100">
              <Download className="mr-3 text-teal-600" /> Download VC Report
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
