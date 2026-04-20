'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { BreachTimer } from '@/components/BreachTimer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { AlertTriangle, Clock, Activity, FileText, Send, CheckCircle2, Shield } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function BreachPage() {
  const [activeBreach, setActiveBreach] = useState<any>(null)
  const [pastBreaches, setPastBreaches] = useState<any[]>([])
  const [isReporting, setIsReporting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [companyId, setCompanyId] = useState('')
  const { toast } = useToast()

  // Form State
  const [form, setForm] = useState({
    breachType: '', detectedAt: '', affectedCount: '', description: ''
  })
  const [dataCompromised, setDataCompromised] = useState<string[]>([])

  useEffect(() => {
    async function init() {
      const { data: user } = await supabase.auth.getUser()
      if (user.user) {
        setCompanyId(user.user.id)
        const { data } = await (supabase.from('breach_incidents') as any).select('*').eq('company_id', user.user.id).order('detected_at', { ascending: false })
        if (data && data.length > 0) {
          setPastBreaches(data as any[])
          const active = (data as any[]).find(b => b.status !== 'resolved')
          if (active) setActiveBreach(active)
        }
      }
      setLoading(false)
    }
    init()
  }, [])

  const toggleData = (id: string) => setDataCompromised(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    
    const newBreach = {
      company_id: companyId,
      detected_at: new Date(form.detectedAt).toISOString(),
      breach_type: form.breachType,
      affected_users_count: parseInt(form.affectedCount) || 0,
      data_categories_affected: dataCompromised,
      incident_report: form.description,
      status: 'detected'
    }

    const { data, error } = await (supabase.from('breach_incidents') as any).insert([newBreach]).select()
    
    setLoading(false)
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } else if (data) {
      setActiveBreach(data[0])
      setPastBreaches([data[0], ...pastBreaches])
      setIsReporting(false)
      toast({ title: "Breach Logged", description: "Timer started. Immediate action required.", variant: "destructive" })
    }
  }

  async function resolveBreach() {
    const { error } = await (supabase.from('breach_incidents') as any).update({ status: 'resolved' }).eq('id', activeBreach.id)
    if (!error) {
      setActiveBreach(null)
      setPastBreaches(pastBreaches.map(b => b.id === activeBreach.id ? {...b, status: 'resolved'} : b))
      toast({ title: "Resolved", description: "Breach incident closed." })
    }
  }

  if (loading) return <div className="p-8">Loading...</div>

  // STATE 2: Active Breach
  if (activeBreach) {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-24">
        <div className="flex items-center gap-2 mb-8 text-red-600">
          <AlertTriangle size={32} />
          <h1 className="text-3xl font-bold">🚨 ACTIVE BREACH — DPB NOTIFICATION REQUIRED</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <BreachTimer detectedAt={new Date(activeBreach.detected_at)} />
            
            <Card className="border-red-200 bg-red-50/30">
              <CardHeader><CardTitle className="text-red-900">Incident Details</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <p><strong>Type:</strong> {activeBreach.breach_type}</p>
                <p><strong>Detected:</strong> {new Date(activeBreach.detected_at).toLocaleString()}</p>
                <p><strong>Users Affected:</strong> {activeBreach.affected_users_count}</p>
                <p><strong>Data:</strong> {activeBreach.data_categories_affected?.join(', ')}</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Immediate Checklist</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Breach detected and logged ✅", done: true },
                  { label: "Internal team notified", done: false },
                  { label: "DPB notification sent (DO THIS FIRST)", done: false, critical: true },
                  { label: "Affected users notified", done: false },
                  { label: "Root cause identified", done: false },
                  { label: "Remediation complete", done: false }
                ].map((item, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Checkbox checked={item.done} disabled={item.done} />
                    <span className={`${item.done ? 'text-gray-400 line-through' : item.critical ? 'font-bold text-red-600' : 'text-gray-700'}`}>{item.label}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-3">
               <Button className="w-full text-left justify-start" size="lg" variant="outline"><FileText className="mr-2" /> Generate DPB Notification Letter</Button>
               <Button className="w-full text-left justify-start" size="lg" variant="outline"><Send className="mr-2" /> Send User Notifications</Button>
               <Button className="w-full text-left justify-start bg-green-600 hover:bg-green-700 text-white mt-4" size="lg" onClick={resolveBreach}><CheckCircle2 className="mr-2" /> Mark as Resolved</Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // STATE 1: No Active Breach
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-24">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="text-[#1a237e]" size={36} />
          <div>
            <h1 className="text-3xl font-bold">Breach Response Centre</h1>
            <p className="text-gray-500">If a breach occurs, start here immediately to comply with the 72-hour rule.</p>
          </div>
        </div>
      </div>

      {!isReporting ? (
        <div className="space-y-8">
          <Card className="border-red-200">
             <CardContent className="p-8 text-center bg-red-50 rounded-xl space-y-6">
                <AlertTriangle size={64} className="mx-auto text-red-500" />
                <div>
                   <h2 className="text-2xl font-bold text-red-900 mb-2">Have you detected a Data Breach?</h2>
                   <p className="text-red-700 max-w-2xl mx-auto">Under DPDP Act 2023, you must notify the Data Protection Board (DPB) within 72 hours of detecting a personal data breach. Failure to do so can result in up to ₹200 crore penalty.</p>
                </div>
                <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white text-lg h-14 px-8" onClick={() => setIsReporting(true)}>
                  🚨 REPORT A BREACH NOW
                </Button>
             </CardContent>
          </Card>

          <h3 className="text-xl font-bold mt-12">Past Incidents</h3>
          {pastBreaches.length === 0 ? (
            <p className="text-gray-500">No breaches reported. Keep it up!</p>
          ) : (
            <div className="space-y-4">
              {pastBreaches.map(b => (
                <Card key={b.id}>
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <div className="font-bold flex items-center gap-2">
                        {b.breach_type} {b.status==='resolved' ? <Badge className="bg-green-500">Resolved</Badge> : <Badge className="bg-red-500">Active</Badge>}
                      </div>
                      <div className="text-sm text-gray-500">{new Date(b.detected_at).toLocaleDateString()}</div>
                    </div>
                    <Button variant="ghost">View Report</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Report a Data Breach</CardTitle>
            <CardDescription>Fill this out accurately. The timer will start immediately.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Breach Type</Label>
                  <Select onValueChange={v => setForm({...form, breachType: v})} required>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      {['Unauthorized Access', 'Data Leak', 'System Intrusion', 'Ransomware', 'Employee Error', 'Other'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Date & Time Detected</Label>
                  <Input type="datetime-local" value={form.detectedAt} onChange={e => setForm({...form, detectedAt: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>Estimated Users Affected</Label>
                  <Input type="number" value={form.affectedCount} onChange={e => setForm({...form, affectedCount: e.target.value})} required />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>What data was compromised?</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['Name', 'Email', 'Phone', 'Address', 'Passwords', 'Financial', 'Health', 'Other'].map(d => (
                    <div key={d} className="flex items-center space-x-2">
                      <Checkbox id={d} onCheckedChange={() => toggleData(d)} />
                      <label htmlFor={d} className="text-sm cursor-pointer">{d}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Brief Description</Label>
                <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={4} required placeholder="Briefly describe how it happened and current status." />
              </div>

              <div className="flex gap-4">
                 <Button type="button" variant="outline" onClick={() => setIsReporting(false)}>Cancel</Button>
                 <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white" disabled={loading}>Log Breach & Start Timer</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
