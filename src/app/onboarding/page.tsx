'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, useUser } from '@clerk/nextjs'
import { supabase } from '@/lib/supabase'
import { seedTasks } from '@/lib/seedTasks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { AuthGuard } from '@/components/AuthGuard'

interface ComplianceState {
  privacyPolicy: boolean
  consent: boolean
  breachPlan: boolean
  grievanceOfficer: boolean
  processorContracts: boolean
  ageVerification: boolean
}
interface CompanyState {
  name: string
  gstin?: string
  website?: string
  founder_name?: string
  phone?: string
  employee_count?: string
  funding_stage?: string
  industry?: string
  is_indian?: boolean
  grievance_officer_name?: string
  grievance_officer_email?: string
}
interface DataType {
  id: string
  label: string
  type: 'regular' | 'sensitive' | 'children'
}
const DATA_TYPES: DataType[] = [
  { id: 'email', label: 'Email', type: 'regular' },
  { id: 'phone', label: 'Phone', type: 'regular' },
  { id: 'address', label: 'Address', type: 'regular' },
  { id: 'financial', label: 'Financial', type: 'sensitive' },
  { id: 'health', label: 'Health', type: 'sensitive' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { userId } = useAuth()
  const { user } = useUser()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [compliance, setCompliance] = useState<ComplianceState>({
    privacyPolicy: false,
    consent: false,
    breachPlan: false,
    grievanceOfficer: false,
    processorContracts: false,
    ageVerification: false,
  })

  const [company, setCompany] = useState<CompanyState>({
    name: '',
    gstin: '',
    website: '',
    founder_name: '',
    phone: '',
    employee_count: '',
    funding_stage: '',
    industry: '',
    is_indian: false,
    grievance_officer_name: '',
    grievance_officer_email: '',
  })

  const [dataCollected, setDataCollected] = useState<string[]>([])

  const handleNext = () => {
    if (step < 5) setStep(step + 1)
  }

  async function handleComplete() {
    if (!userId) {
      toast({ title: 'Error', description: 'You must be logged in.', variant: 'destructive' })
      return
    }
    setLoading(true)

    try {
      let score = 0
      if (compliance.privacyPolicy) score += 10
      if (compliance.consent) score += 15
      if (compliance.breachPlan) score += 15
      if (compliance.grievanceOfficer) score += 10
      if (compliance.processorContracts) score += 10
      if (compliance.ageVerification) score += 5
      if (company.is_indian) score += 5

      const userEmail = user?.primaryEmailAddress?.emailAddress ?? ''
      const { error: compError } = await supabase
        .from('companies')
        .upsert(
          {
            clerk_user_id: userId,
            name: company.name,
            gstin: company.gstin,
            website: company.website,
            founder_name: company.founder_name,
            email: userEmail,
            phone: company.phone,
            employee_count: parseInt(company.employee_count ?? '') || null,
            funding_stage: company.funding_stage,
            industry: company.industry,
            compliance_score: score,
            grievance_officer_name: company.grievance_officer_name,
            grievance_officer_email: company.grievance_officer_email,
            onboarding_complete: true,
          },
          { onConflict: 'clerk_user_id' }
        )
      if (compError) throw compError

      if (dataCollected.length > 0) {
        const inventoryItems = dataCollected.map(id => {
          const dt = DATA_TYPES.find(d => d.id === id)
          return {
            company_clerk_user_id: userId,
            data_category: dt?.label ?? '',
            data_type: dt?.type ?? 'regular',
            third_party_shared: false,
          }
        })
        await supabase
          .from('data_inventory_items')
          .delete()
          .eq('company_clerk_user_id', userId)
        const { error: invError } = await supabase
          .from('data_inventory_items')
          .insert(inventoryItems)
        if (invError) throw invError
      }

      const { data: existing } = await supabase
        .from('compliance_tasks')
        .select('id')
        .eq('company_clerk_user_id', userId)
        .limit(1)

      if (!existing || existing.length === 0) {
        const tasksToInsert = seedTasks.map(t => ({
          company_clerk_user_id: userId,
          ...t,
        }))
        const { error: tasksError } = await supabase
          .from('compliance_tasks')
          .insert(tasksToInsert)
        if (tasksError) throw tasksError
      }

      toast({ title: 'Setup Complete!', description: 'Your compliance dashboard is ready.' })
      router.push('/dashboard')
    } catch (err: any) {
      console.error('Onboarding error:', err)
      toast({ title: 'Error', description: err.message ?? 'Unexpected error', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-3xl shadow-lg border-t-4 border-t-[#00897b]">
          <CardHeader>
            <CardTitle>Onboarding</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={(step / 5) * 100} className="mb-6" />
            {/* UI for each step omitted for brevity – keep existing markup */}
          </CardContent>
          <CardFooter className="bg-gray-50 px-6 py-4 border-t flex justify-between rounded-b-xl">
            {step > 1 ? (
              <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={loading}>
                Back
              </Button>
            ) : (
              <div />
            )}
            {step < 5 ? (
              <Button onClick={handleNext} className="bg-[#1a237e] hover:bg-[#121958]">
                Next Step →
              </Button>
            ) : (
              <Button onClick={handleComplete} disabled={loading} className="bg-teal-600 hover:bg-teal-700 w-full sm:w-auto">
                {loading ? 'Creating Dashboard...' : 'See My Dashboard →'}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </AuthGuard>
  )
}