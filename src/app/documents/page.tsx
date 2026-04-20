'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@clerk/nextjs'
import { supabase } from '@/lib/supabase'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Cookie, AlertTriangle, Handshake, BarChart, Download, Copy, Save, CheckCircle2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { jsPDF } from 'jspdf'

function DocumentsContent() {
  const searchParams = useSearchParams()
  const { userId, isLoaded } = useAuth()
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [previewContent, setPreviewContent] = useState('')
  const [activeDocType, setActiveDocType] = useState('')
  const [companyData, setCompanyData] = useState<any>(null)
  const { toast } = useToast()

  useEffect(() => {
    async function load() {
      if (!isLoaded || !userId) return
      const { data } = await (supabase.from('companies') as any)
        .select('*')
        .eq('id', userId)
        .single()
      if (data) {
        setCompanyData(data)
        
        // Check for auto-generate param
        const type = searchParams.get('type')
        if (type) {
          setTimeout(() => generateDoc(type, data), 500)
        }
      }
    }
    load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, userId, searchParams])

  async function generateDoc(type: string, dataOverride?: any) {
    const currentData = dataOverride || companyData
    if (!currentData) {
      toast({ title: "Not ready", description: "Company profile not loaded yet.", variant: "destructive" })
      return
    }
    setGenerating(true)
    setActiveDocType(type)
    setPreviewContent('')
    setSaved(false)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          companyData: {
            ...currentData,
            grievanceOfficerName: currentData.grievance_officer_name,
            grievanceOfficerEmail: currentData.grievance_officer_email,
            fundingStage: currentData.funding_stage,
            complianceScore: currentData.compliance_score,
          }
        })
      })

      const result = await res.json()
      if (result.success) {
        setPreviewContent(result.content)
      } else {
        throw new Error(result.error)
      }
    } catch (err: any) {
      toast({ title: "Generation failed", description: err.message, variant: "destructive" })
    } finally {
      setGenerating(false)
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(previewContent)
    toast({ title: "Copied to clipboard" })
  }

  function handleDownload() {
    const doc = new jsPDF()
    const textLines = doc.splitTextToSize(previewContent, 180)
    let y = 20
    doc.setFontSize(16)
    doc.text(docs.find(d => d.type === activeDocType)?.title || 'Document', 15, y)
    y += 10
    doc.setFontSize(10)
    for (let i = 0; i < textLines.length; i++) {
      if (y > 280) { y = 20; doc.addPage() }
      doc.text(textLines[i], 15, y)
      y += 7
    }
    doc.save(`${activeDocType}.pdf`)
  }

  async function handleSave() {
    if (!previewContent || !companyData) return
    setSaving(true)
    try {
      const { error } = await (supabase.from('generated_documents') as any).insert([{
        company_id: companyData.id,
        doc_type: activeDocType,
        content: previewContent,
        language: 'en',
        version: 1
      }])
      if (error) throw error
      setSaved(true)
      toast({ title: "Document saved!", description: "Saved to your documents library." })
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const docs = [
    { type: 'privacy_notice', icon: FileText, title: 'Privacy Notice', desc: 'Plain-language DPDP-compliant privacy notice for your website' },
    { type: 'consent_policy', icon: Cookie, title: 'Consent Management Policy', desc: 'Internal policy document for how you manage user consent' },
    { type: 'breach_notification', icon: AlertTriangle, title: 'Breach Response Procedure', desc: 'Step-by-step internal procedure for handling data breaches' },
    { type: 'vendor_dpa', icon: Handshake, title: 'Data Processing Agreement', desc: 'Template contract for vendors who process data on your behalf' },
    { type: 'vc_readiness', icon: BarChart, title: 'VC Readiness Report', desc: 'Professional DPDP compliance report for investor due diligence' }
  ]

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-24">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2"><FileText className="text-[#1a237e]" /> Legal Documents</h1>
        <p className="text-gray-500">AI-generated templates tailored to your company profile</p>
      </div>

      {!companyData && (
        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-md text-sm">
          ⚠️ Company profile not loaded. Please complete <Link href="/onboarding" className="underline font-medium">onboarding</Link> first.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          {docs.map(d => (
            <Card
              key={d.type}
              className={`transition-all cursor-pointer ${activeDocType === d.type ? 'border-[#1a237e] shadow-md' : 'hover:border-[#1a237e]/50'}`}
              onClick={() => !generating && generateDoc(d.type)}
            >
              <CardContent className="p-5 flex gap-4">
                <div className="mt-1"><d.icon className={activeDocType === d.type ? 'text-[#1a237e]' : 'text-gray-400'} /></div>
                <div>
                  <h3 className="font-bold">{d.title}</h3>
                  <p className="text-sm text-gray-500 mb-3">{d.desc}</p>
                  <Button
                    size="sm"
                    variant={activeDocType === d.type ? "default" : "outline"}
                    disabled={generating && activeDocType !== d.type}
                    className={activeDocType === d.type ? "bg-[#1a237e]" : ""}
                  >
                    {generating && activeDocType === d.type ? 'Generating...' : 'Generate with AI'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-2">
          <Card className="h-full min-h-[600px] flex flex-col">
            {generating ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 p-8 bg-gray-50 rounded-xl">
                <div className="w-16 h-16 border-4 border-[#1a237e] border-t-transparent rounded-full animate-spin" />
                <h3 className="text-xl font-bold">Drafting Document...</h3>
                <p className="text-gray-500">Our AI legal assistant is writing your bespoke document based on DPDP Rules 2025.</p>
              </div>
            ) : previewContent ? (
              <div className="w-full h-full flex flex-col p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">{docs.find(d => d.type === activeDocType)?.title}</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopy}><Copy size={16} className="mr-2" /> Copy</Button>
                    <Button variant="outline" size="sm" onClick={handleDownload}><Download size={16} className="mr-2" /> PDF</Button>
                    <Button
                      size="sm"
                      className={saved ? "bg-green-600 hover:bg-green-700" : "bg-teal-600 hover:bg-teal-700"}
                      onClick={handleSave}
                      disabled={saving || saved}
                    >
                      {saved
                        ? <><CheckCircle2 size={16} className="mr-2" /> Saved</>
                        : saving
                          ? "Saving..."
                          : <><Save size={16} className="mr-2" /> Save</>
                      }
                    </Button>
                  </div>
                </div>
                <div className="flex-1 bg-white border rounded-md p-8 overflow-y-auto whitespace-pre-wrap text-gray-800 text-sm leading-relaxed shadow-inner">
                  {previewContent}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 p-8 bg-gray-50 rounded-xl">
                <FileText size={64} className="mx-auto mb-4 opacity-30" />
                <p className="font-medium">Select a document from the left to generate</p>
                <p className="text-sm mt-2">Powered by Google Gemini AI · Tailored to your DPDP profile</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function DocumentsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading documents...</div>}>
      <DocumentsContent />
    </Suspense>
  )
}