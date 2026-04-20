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

export default function BreachPage() {
  const { userId, isLoaded } = useAuth()
  const [activeBreach, setActiveBreach] = useState<any>(null)
  const [pastBreaches, setPastBreaches] = useState<any[]>([])
  const [isReporting, setIsReporting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [companyId, setCompanyId] = useState('')

  const [form, setForm] = useState({
    breachType: '',
    detectedAt: '',
    affectedCount: '',
    description: ''
  })
  const [dataCompromised, setDataCompromised] = useState<string[]>([])

  useEffect(() => {
    async function init() {
      if (!isLoaded || !userId) return
      // Fetch company to get its ID
      const { data: companyData } = await (supabase.from('companies') as any)
        .select('id')
        .eq('clerk_user_id', userId)
        .single()
      if (companyData) {
        setCompanyId(companyData.id)
      }

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

  // ... rest of the component remains unchanged ...
  // (Only the foreign key reference is now handled via companyId)