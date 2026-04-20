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
            employee_count: parseInt(company.employee_count) || null,
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
            <div className="space-y-4">
              {step === 1 && (
                <div>
                  <h3 className="font-bold mb-4">Company Information</h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Company Name</Label>
                      <Input value={company.name} onChange={e => setCompany({...company, name: e.target.value})} />
                    </div>
                    <div>
                      <Label>Industry</Label>
                      <Select onValueChange={v => setCompany({...company, industry: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
              {step === 2 && (
                <div>
                  <h3 className="font-bold mb-4">Compliance Checklist</h3>
                  <div className="space-y-4">
                    {Object.entries(compliance).map(([key, value]) => (
                      <div key={key} className="flex items-center space-x-2">
                        <Checkbox id={key} checked={value} onCheckedChange={v => setCompliance({...compliance, [key]: v as boolean})} />
                        <Label htmlFor={key}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {step === 3 && (
                <div>
                  <h3 className="font-bold mb-4">Data Collection</h3>
                  <div className="space-y-4">
                    {DATA_TYPES.map(dt => (
                      <div key={dt.id} className="flex items-center space-x-2">
                        <Checkbox id={dt.id} checked={dataCollected.includes(dt.id)} onCheckedChange={v => {
                          if (v) setDataCollected([...dataCollected, dt.id])
                          else setDataCollected(dataCollected.filter(id => id !== dt.id))
                        }} />
                        <Label htmlFor={dt.id}>{dt.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {step === 4 && (
                <div>
                  <h3 className="font-bold mb-4">Grievance Officer</h3>
                  <div className="space-y-4">
                    <div>
                      <Label>Officer Name</Label>
                      <Input value={company.grievance_officer_name} onChange={e => setCompany({...company, grievance_officer_name: e.target.value})} />
                    </div>
                    <div>
                      <Label>Officer Email</Label>
                      <Input value={company.grievance_officer_email} onChange={e => setCompany({...company, grievance_officer_email: e.target.value})} />
                    </div>
                  </div>
                </div>
              )}
              {step === 5 && (
                <div>
                  <h3 className="font-bold mb-4">Review & Complete</h3>
                  <div className="space-y-4">
                    <p>Company: {company.name}</p>
                    <p>Industry: {company.industry}</p>
                    <p>Compliance Score: {Object.values(compliance).filter(v => v).length * 10}/100</p>
                  </div>
                </div>
              )}
            </div>
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