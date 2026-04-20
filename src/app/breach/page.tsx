'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@clerk/nextjs'
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
import { AlertTriangle, Clock, Activity, FileText, Send, CheckCircle2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog' // Add missing imports

export default function BreachPage() {
  const { userId, isLoaded } = useAuth()
  const [activeBreach, setActiveBreach] = useState<any>(null)
  const [pastBreaches, setPastBreaches] = useState<any[]>([])
  const [isReporting, setIsReporting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [companyId, setCompanyId] = useState('')

  // Add dpbNotified to form state
  const [form, setForm] = useState({
    breachType: '',
    detectedAt: '',
    affectedCount: '',
    description: '',
    dpbNotified: false, // Add this field
  })

  useEffect(() => {
    async function init() {
      if (!isLoaded || !userId) return

      // Fetch company to get its ID (if needed elsewhere)
      const { data: companyData } = await (supabase.from('companies') as any)
        .select('id')
        .eq('clerk_user_id', userId)
        .single()
      if (companyData) {
        setCompanyId(companyData.id)
      }

      // Load breach incidents for this user
      const { data } = await (supabase.from('breach_incidents') as any)
        .select('*')
        .eq('company_clerk_user_id', userId)
        .order('detected_at', { ascending: false })

      if (data && data.length > 0) {
        setPastBreaches(data as any[])
        const active = (data as any[]).find(b => b.status !== 'resolved')
        if (active) setActiveBreach(active)
      }

      setLoading(false)
    }

    init()
  }, [isLoaded, userId])

  // Placeholder for reporting logic – can be expanded later
  const handleReport = async () => {
    // Implementation would go here
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-[#1a237e] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-24">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2"><AlertTriangle className="text-[#1a237e]" /> Breach Response</h1>
          <p className="text-gray-500">Track and manage data breach incidents</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsOpen(true)}>
            Report New Breach
          </Button>
        </div>
      </div>

      {/* Active breach timer */}
      {activeBreach && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="text-[#1a237e]" />
              Active Breach – {activeBreach.breach_type || 'Unknown Type'}
            </CardTitle>
            <CardDescription>
              Detected at: {new Date(activeBreach.detected_at).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BreachTimer detectedAt={new Date(activeBreach.detected_at)} />
            <div className="mt-4 flex gap-2">
              <Badge variant="outline">Status: {activeBreach.status}</Badge>
              <Badge variant="outline">Affected Users: {activeBreach.affected_users_count ?? 'N/A'}</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Past breaches list */}
      {pastBreaches.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Past Breaches</h2>
          {pastBreaches.map(breach => (
            <Card key={breach.id} className="border-gray-200">
              <CardHeader>
                <CardTitle>{breach.breach_type || 'Unnamed Breach'}</CardTitle>
                <CardDescription>
                  Detected: {new Date(breach.detected_at).toLocaleString()} — Status: {breach.status}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>{breach.incident_report?.slice(0, 150)}{breach.incident_report?.length > 150 && '...'}</p>
                <Link href="#" className="text-[#1a237e] hover:underline">
                  View Details
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Report new breach dialog (simplified) */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="secondary">Report New Breach</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Report Data Breach</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="breachType">Breach Type</Label>
              <Select
                value={form.breachType}
                onValueChange={val => setForm({ ...form, breachType: val })}
              >
                <SelectTrigger id="breachType">
                  <SelectValue placeholder="Select breach type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unauthorized_access">Unauthorized Access</SelectItem>
                  <SelectItem value="data_leak">Data Leak</SelectItem>
                  <SelectItem value="loss_of_device">Loss of Device</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="detectedAt">Detected At</Label>
              <Input
                id="detectedAt"
                type="datetime-local"
                value={form.detectedAt}
                onChange={e => setForm({ ...form, detectedAt: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="affectedCount">Affected Users</Label>
              <Input
                id="affectedCount"
                type="number"
                min="0"
                value={form.affectedCount}
                onChange={e => setForm({ ...form, affectedCount: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={4}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="dpbNotified"
                checked={form.dpbNotified}
                onCheckedChange={checked => setForm({ ...form, dpbNotified: !!checked })}
              />
              <Label htmlFor="dpbNotified">DPB Notified</Label>
            </div>

            <Button              className="w-full"
              onClick={handleReport}
              disabled={isReporting}
            >
              {isReporting ? 'Reporting...' : 'Submit Breach Report'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}