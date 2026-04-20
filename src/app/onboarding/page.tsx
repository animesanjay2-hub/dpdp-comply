'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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

interface CompanyForm {
  name: string
  industry: string
  employee_count: string
  funding_stage: string
  website: string
  gstin: string
  founder_name: string
  email: string
  phone: string
  grievance_officer_name: string
  grievance_officer_email: string
  is_indian: boolean
}

interface ComplianceState {
  privacyPolicy: boolean
  consent: boolean
  breachPlan: boolean
  grievanceOfficer: boolean
  processorContracts: boolean
  ageVerification: boolean
}

const DATA_TYPES = [
  { id: 'name', label: 'Full Name', type: 'regular' },
  { id: 'email', label: 'Email Address', type: 'regular' },
  { id: 'phone', label: 'Phone Number', type: 'regular' },
  { id: 'address', label: 'Physical Address', type: 'regular' },
  { id: 'dob', label: 'Date of Birth', type: 'regular' },
  { id: 'gender', label: 'Gender', type: 'regular' },
  { id: 'aadhaar', label: 'Aadhaar Number', type: 'sensitive' },
  { id: 'pan', label: 'PAN Number', type: 'sensitive' },
  { id: 'bank', label: 'Bank Account Details', type: 'sensitive' },
  { id: 'credit', label: 'Credit Card Data', type: 'sensitive' },
  { id: 'location', label: 'Location/GPS Data', type: 'regular' },
  { id: 'device', label: 'Device Information', type: 'regular' },
  { id: 'browsing', label: 'Browsing History', type: 'regular' },
  { id: 'purchase', label: 'Purchase History', type: 'regular' },
  { id: 'health', label: 'Health/Medical Data', type: 'sensitive' },
  { id: 'biometric', label: 'Biometric Data', type: 'sensitive' },
  { id: 'children', label: "Children's Data", type: 'children' },
  { id: 'religious', label: 'Religious/Political Views', type: 'sensitive' },
  { id: 'caste', label: 'Caste Information', type: 'sensitive' },
  { id: 'sexual', label: 'Sexual Orientation', type: 'sensitive' }
]

export default function OnboardingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [authChecking, setAuthChecking] = useState(true)

  // Form State
  const [company, setCompany] = useState<CompanyForm>({
    name: '', industry: '', employee_count: '', funding_stage: '', website: '', gstin: '',
    founder_name: '', email: '', phone: '', grievance_officer_name: '', grievance_officer_email: '', is_indian: true
  })
  const [dataCollected, setDataCollected] = useState<string[]>([])
  const [compliance, setCompliance] = useState<ComplianceState>({
    privacyPolicy: false, consent: false, breachPlan: false,
    grievanceOfficer: false, processorContracts: false, ageVerification: false
  })

  // Auth guard — redirect to login if not authenticated
  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setAuthChecking(false)
    }
    checkAuth()
  }, [router])

  const updateCompany = (key: keyof CompanyForm, value: string | boolean) => setCompany({ ...company, [key]: value })
  const toggleData = (id: string) => {
    setDataCollected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const hasSensitive = dataCollected.some(id => DATA_TYPES.find(d => d.id === id)?.type === 'sensitive' || DATA_TYPES.find(d => d.id === id)?.type === 'children')

  // Step 1 validation
  function handleNext() {
    if (step === 1 && !company.name.trim()) {
      toast({ title: "Company name required", description: "Please enter your company name before continuing.", variant: "destructive" })
      return
    }
    setStep(s => s + 1)
  }

  async function handleComplete() {
    setLoading(true)
    try {
      const { data: userData, error: authError } = await supabase.auth.getUser()
      if (authError) throw new Error("Please log in first")

      const user = userData.user
      if (!user) throw new Error("No user found")

      // Calculate initial score
      let score = 0
      if (compliance.privacyPolicy) score += 10
      if (compliance.consent) score += 15
      if (compliance.breachPlan) score += 15
      if (compliance.grievanceOfficer) score += 10
      if (compliance.processorContracts) score += 10
      if (compliance.ageVerification) score += 5
      if (company.is_indian) score += 5

      // 1. Save Company (upsert to handle re-onboarding)
      const { error: compError } = await (supabase
        .from('companies') as any)
        .upsert({
          id: user.id,
          name: company.name,
          gstin: company.gstin,
          website: company.website,
          founder_name: company.founder_name,
          email: user.email ?? '',
          phone: company.phone,
          employee_count: parseInt(company.employee_count) || null,
          funding_stage: company.funding_stage,
          industry: company.industry,
          compliance_score: score,
          grievance_officer_name: company.grievance_officer_name,
          grievance_officer_email: company.grievance_officer_email,
          onboarding_complete: true
        })
        .select()
        .single()

      if (compError) throw compError

      // 2. Save Data Inventory (only selected data types)
      if (dataCollected.length > 0) {
        const inventoryItems = dataCollected.map(id => {
          const dt = DATA_TYPES.find(d => d.id === id)
          return {
            company_id: user.id,
            data_category: dt?.label ?? '',
            data_type: dt?.type ?? 'regular',
            third_party_shared: false
          }
        })
        // Delete existing inventory items for this company first to avoid duplicates
        await (supabase.from('data_inventory_items') as any).delete().eq('company_id', user.id)
        await (supabase.from('data_inventory_items') as any).insert(inventoryItems)
      }

      // 3. Save Seed Tasks — only insert if no tasks exist yet (avoid duplicates on re-onboarding)
      const { data: existingTasks } = await (supabase
        .from('compliance_tasks') as any)
        .select('id')
        .eq('company_id', user.id)
        .limit(1)

      if (!existingTasks || existingTasks.length === 0) {
        const tasksToInsert = seedTasks.map(t => ({
          company_id: user.id,
          ...t
        }))
        await (supabase.from('compliance_tasks') as any).insert(tasksToInsert)
      }

      toast({ title: "Setup Complete!", description: "Your compliance dashboard is ready." })
      router.push('/dashboard')
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An unknown error occurred"
      toast({ title: "Error", description: message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500 animate-pulse">Checking authentication...</div>
      </div>
    )
  }

  const estimatedScore =
    (compliance.privacyPolicy ? 10 : 0) +
    (compliance.consent ? 15 : 0) +
    (compliance.breachPlan ? 15 : 0) +
    (compliance.grievanceOfficer ? 10 : 0) +
    (compliance.processorContracts ? 10 : 0) +
    (compliance.ageVerification ? 5 : 0) +
    (company.is_indian ? 5 : 0)

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl shadow-lg border-t-4 border-t-[#00897b]">
        <CardHeader className="bg-white border-b sticky top-0 z-10 p-6">
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="text-2xl font-bold">DPDP Compliance Setup</CardTitle>
            <span className="text-sm font-medium text-gray-500">Step {step} of 5</span>
          </div>
          <Progress value={(step / 5) * 100} className="h-2" />
        </CardHeader>

        <CardContent className="p-6 md:p-8 min-h-[400px]">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in">
              <h3 className="text-xl font-semibold">Company Basics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label>Company Name <span className="text-red-500">*</span></Label>
                  <Input
                    value={company.name}
                    onChange={e => updateCompany('name', e.target.value)}
                    placeholder="Acme Corp"
                    className={!company.name.trim() ? 'border-gray-200' : 'border-green-400'}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Industry</Label>
                  <Select onValueChange={v => updateCompany('industry', v)}>
                    <SelectTrigger><SelectValue placeholder="Select Industry" /></SelectTrigger>
                    <SelectContent>
                      {['SaaS', 'EdTech', 'FinTech', 'HealthTech', 'D2C/eCommerce', 'AgriTech', 'HRTech', 'LegalTech', 'Gaming', 'Other'].map(i => (
                        <SelectItem key={i} value={i}>{i}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Employees</Label>
                  <Select onValueChange={v => updateCompany('employee_count', v)}>
                    <SelectTrigger><SelectValue placeholder="Team Size" /></SelectTrigger>
                    <SelectContent>
                      {['1-10', '11-50', '51-200', '201-500', '500+'].map(i => (
                        <SelectItem key={i} value={i}>{i}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Funding Stage</Label>
                  <Select onValueChange={v => updateCompany('funding_stage', v)}>
                    <SelectTrigger><SelectValue placeholder="Select Stage" /></SelectTrigger>
                    <SelectContent>
                      {['Bootstrapped', 'Pre-seed', 'Seed', 'Series A', 'Series B+', 'Public'].map(i => (
                        <SelectItem key={i} value={i}>{i}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Website</Label>
                  <Input value={company.website} onChange={e => updateCompany('website', e.target.value)} placeholder="https://example.com" />
                </div>
                <div className="space-y-2">
                  <Label>GSTIN (Optional)</Label>
                  <Input value={company.gstin} onChange={e => updateCompany('gstin', e.target.value)} placeholder="22AAAAA0000A1Z5" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in text-left">
              <div>
                <h3 className="text-xl font-semibold mb-2">What personal data does your company collect?</h3>
                <p className="text-gray-500 text-sm">Check all that apply — be honest, this is private</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto p-1">
                {DATA_TYPES.map(data => (
                  <div key={data.id} className="flex flex-row items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <Checkbox
                      id={data.id}
                      checked={dataCollected.includes(data.id)}
                      onCheckedChange={() => toggleData(data.id)}
                    />
                    <div className="space-y-1 leading-none">
                      <Label htmlFor={data.id} className="font-medium cursor-pointer">{data.label}</Label>
                      {(data.type === 'sensitive' || data.type === 'children') && (
                        <p className="text-xs text-amber-600">Sensitive — extra consent required</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {hasSensitive && (
                <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-md text-sm mt-4">
                  ⚠️ This includes Sensitive Personal Data under DPDP — requires explicit consent and extra protection.
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in">
              <h3 className="text-xl font-semibold mb-4">What do you currently have in place?</h3>
              <div className="space-y-4">
                {[
                  { id: 'privacyPolicy', label: 'Do you have a Privacy Policy on your website?' },
                  { id: 'consent', label: 'Do you collect consent before collecting data?' },
                  { id: 'breachPlan', label: 'Do you have a process for data breach response?' },
                  { id: 'grievanceOfficer', label: 'Have you named a Grievance Officer?' },
                  { id: 'processorContracts', label: 'Do you have contracts with all data processors?' },
                  { id: 'ageVerification', label: 'Do you have age verification for under-18 users?' }
                ].map(q => (
                  <div key={q.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <Label className="text-base font-normal">{q.label}</Label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" checked={compliance[q.id as keyof ComplianceState]} onChange={() => setCompliance({...compliance, [q.id]: true})} />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" checked={!compliance[q.id as keyof ComplianceState]} onChange={() => setCompliance({...compliance, [q.id]: false})} />
                        <span>No</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in fade-in">
              <h3 className="text-xl font-semibold">Your Team</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Founder/CEO Name</Label>
                  <Input value={company.founder_name} onChange={e => updateCompany('founder_name', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Contact Phone</Label>
                  <Input value={company.phone} onChange={e => updateCompany('phone', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Grievance Officer Name</Label>
                  <Input value={company.grievance_officer_name} onChange={e => updateCompany('grievance_officer_name', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Grievance Officer Email</Label>
                  <Input type="email" value={company.grievance_officer_email} onChange={e => updateCompany('grievance_officer_email', e.target.value)} />
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-6">
                <Checkbox id="is_indian" checked={company.is_indian} onCheckedChange={(c) => updateCompany('is_indian', !!c)} />
                <Label htmlFor="is_indian">My company is incorporated in India</Label>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-8 animate-in fade-in text-center py-8">
              <div className="max-w-md mx-auto">
                <h3 className="text-3xl font-bold mb-2">All set!</h3>
                <p className="text-gray-500 mb-8">We&apos;ve generated your custom compliance roadmap.</p>
                <div className="p-8 bg-blue-50 text-blue-900 rounded-2xl border border-blue-100 mb-8">
                  <p className="text-sm font-medium uppercase tracking-wider mb-2">Initial Score Est.</p>
                  <p className="text-6xl font-black">{estimatedScore} <span className="text-2xl text-blue-300">/ 100</span></p>
                  <p className="text-sm text-blue-700 mt-4">
                    {estimatedScore >= 50 ? '✅ Good start! Complete tasks to reach 100.' : '⚠️ Several key items to set up — your priority list is ready.'}
                  </p>
                </div>
                <p className="text-lg font-medium text-gray-800">Your full compliance action plan is ready.</p>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="bg-gray-50 px-6 py-4 border-t flex justify-between rounded-b-xl">
          {step > 1 ? (
            <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={loading}>Back</Button>
          ) : <div />}

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
  )
}