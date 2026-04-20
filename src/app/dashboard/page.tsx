'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthGuard } from '@/components/AuthGuard'
import { supabase } from '@/lib/supabase'
import { ComplianceGauge } from '@/components/ComplianceGauge'
import { CountdownTimer } from '@/components/CountdownTimer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { FileText, Cookie, AlertTriangle, Download, ArrowRight, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@clerk/nextjs'

export default function DashboardPage() {
  const router = useRouter()
  const { userId } = useAuth()
  const [loading, setLoading] = useState(true)
  const [company, setCompany] = useState<any>(null)
  const [tasks, setTasks] = useState<any[]>([])
  const hasFetched = useRef(false)

  const loadDashboard = useCallback(async () => {
    if (hasFetched.current) return
    if (!userId) return
    hasFetched.current = true

    const { data: comp, error: compError } = await supabase
      .from('companies')
      .select('*')
      .eq('clerk_user_id', userId)
      .single()

    if (compError) {
      console.error('Company fetch error:', compError)
      router.replace('/onboarding')
      return
    }

    setCompany(comp)

    const { data: taskData, error: taskError } = await supabase
      .from('compliance_tasks')
      .select('id,task_name,category,priority,status,deadline,estimated_time')
      .eq('company_clerk_user_id', userId)
      .order('priority', { ascending: true })

    if (taskError) {
      console.error('Tasks fetch error:', taskError)
    } else if (taskData) {
      setTasks(taskData)
    }

    setLoading(false)
  }, [userId, router])

  useEffect(() => {
    if (userId) loadDashboard()
  }, [userId, loadDashboard])

  async function markTaskDone(taskId: string) {
    const updated = tasks.map(t => (t.id === taskId ? { ...t, status: 'completed' } : t))
    setTasks(updated)

    const { error } = await supabase
      .from('compliance_tasks')
      .update({ status: 'completed' })
      .eq('id', taskId)

    if (error) console.error('Error updating task status:', error)

    if (company) {
      const total = updated.length
      const done = updated.filter(t => t.status === 'completed').length
      const newScore = Math.round((done / total) * 100)

      const { error: updErr } = await supabase
        .from('companies')
        .update({ compliance_score: newScore })
        .eq('clerk_user_id', userId)

      if (updErr) console.error('Score update error:', updErr)
      setCompany({ ...company, compliance_score: newScore })
    }
  }

  const getCategoryProgress = useCallback(
    (category: string) => {
      const cat = tasks.filter(t => t.category === category)
      if (!cat.length) return 0
      const done = cat.filter(t => t.status === 'completed').length
      return Math.round((done / cat.length) * 100)
    },
    [tasks]
  )

  const criticalTasks = tasks.filter(t => t.priority === 'critical' && t.status !== 'completed')
  const highTasks = tasks.filter(t => t.priority === 'high' && t.status !== 'completed')

  return (
    <AuthGuard>
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-24 w-full">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Company Dashboard</h1>
          {company && <p className="text-gray-500">{company.name}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="flex flex-col items-center justify-center p-6 shadow-sm border-t-4 border-t-[#1a237e]">
            <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wider">
              Compliance Score
            </h3>
            {loading ? (
              <div className="w-40 h-40 rounded-full bg-gray-100 animate-pulse" />
            ) : (
              <ComplianceGauge score={company?.compliance_score ?? 0} />
            )}
          </Card>
          <CountdownTimer targetDate={new Date('2026-11-13')} label="Consent Manager Deadline" urgencyDays={180} />
          <CountdownTimer targetDate={new Date('2027-05-13')} label="Full Enforcement Deadline" urgencyDays={360} />
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-bold">Tasks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {criticalTasks.map(task => (
              <Card key={task.id} className="border-red-200">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold">{task.task_name}</h3>
                      <p className="text-sm text-gray-500">Critical</p>
                    </div>
                    <Button size="sm" onClick={() => markTaskDone(task.id)}>Mark Done</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {highTasks.map(task => (
              <Card key={task.id} className="border-amber-200">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold">{task.task_name}</h3>
                      <p className="text-sm text-gray-500">High Priority</p>
                    </div>
                    <Button size="sm" onClick={() => markTaskDone(task.id)}>Mark Done</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}