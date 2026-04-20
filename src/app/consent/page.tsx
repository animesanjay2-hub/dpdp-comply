'use client'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Cookie, Copy, PieChart, Download } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function ConsentPage() {
  const { toast } = useToast()
  const [purposes, setPurposes] = useState(['essential'])
  
  const PURPOSES = [
    { id: 'essential', label: 'Essential (cannot be disabled)' },
    { id: 'analytics', label: 'Analytics and Improvement' },
    { id: 'marketing', label: 'Marketing and Promotions' },
    { id: 'personalization', label: 'Personalization' },
    { id: 'thirdparty', label: 'Third-party Sharing' }
  ]

  const toggleP = (id: string) => {
    if (id === 'essential') return
    setPurposes(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const generatedCode = `<!-- DPDPComply Consent Banner -->
<div id="dpdp-consent-banner" style="position:fixed;bottom:0;left:0;right:0;background:#1a237e;color:white;padding:16px;z-index:9999;display:none;font-family:sans-serif;">
  <div style="max-width:1200px;margin:auto;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:16px;">
    <p style="margin:0;font-size:14px;line-height:1.5;">We collect data for: ${purposes.join(', ')}. 
    Read our <a href="/privacy-policy" style="color:#64ffda;text-decoration:underline;">Privacy Notice</a>.
    You can withdraw consent anytime.</p>
    <div style="display:flex;gap:8px;">
      <button onclick="dpdpDecline()" style="background:transparent;border:1px solid white;color:white;padding:8px 16px;border-radius:4px;cursor:pointer;">Only Essential</button>
      <button onclick="dpdpAccept()" style="background:#64ffda;border:none;color:#004d40;padding:8px 16px;border-radius:4px;cursor:pointer;font-weight:bold;">I Accept</button>
    </div>
  </div>
</div>
<script>
function dpdpAccept() {
  localStorage.setItem('dpdp_consent', JSON.stringify({ given: true, timestamp: new Date().toISOString(), purposes: ${JSON.stringify(purposes)} }));
  document.getElementById('dpdp-consent-banner').style.display='none';
}
function dpdpDecline() {
  localStorage.setItem('dpdp_consent', JSON.stringify({ given: false, timestamp: new Date().toISOString(), purposes: ['essential'] }));
  document.getElementById('dpdp-consent-banner').style.display='none';
}
if (!localStorage.getItem('dpdp_consent')) {
  document.getElementById('dpdp-consent-banner').style.display='block';
}
</script>`

  function copyCode() {
    navigator.clipboard.writeText(generatedCode)
    toast({ title: "Code copied to clipboard!" })
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-24">
      <div className="flex items-center gap-2">
        <Cookie size={32} className="text-[#f57c00]" />
        <div>
          <h1 className="text-3xl font-bold">Consent Manager</h1>
          <p className="text-gray-500">Generate tags and view consent logs</p>
        </div>
      </div>

      <Tabs defaultValue="generator" className="space-y-4">
        <TabsList>
          <TabsTrigger value="generator">Banner Generator</TabsTrigger>
          <TabsTrigger value="analytics">Analytics & Logs</TabsTrigger>
          <TabsTrigger value="withdraw">Withdrawal Link</TabsTrigger>
        </TabsList>
        
        <TabsContent value="generator" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Data Collection Purposes</h4>
                  <div className="space-y-3">
                    {PURPOSES.map(p => (
                      <div key={p.id} className="flex items-center space-x-2">
                        <Checkbox id={p.id} checked={purposes.includes(p.id)} onCheckedChange={() => toggleP(p.id)} disabled={p.id === 'essential'} />
                        <label htmlFor={p.id} className="text-sm cursor-pointer">{p.label}</label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Customization</h4>
                  <div className="space-y-4">
                    <div className="space-y-2"><Label>Primary Color</Label><Input type="color" defaultValue="#1a237e" className="w-20 h-10 p-1" /></div>
                    <div className="space-y-2"><Label>Language</Label>
                      <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                        <option>English</option><option>Hindi</option>
                      </select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-none">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">Live Preview & Code</CardTitle>
                <Button size="sm" variant="secondary" onClick={copyCode}><Copy size={14} className="mr-2" /> Copy Code</Button>
              </CardHeader>
              <CardContent>
                <div className="mb-6 border border-gray-700 bg-white/5 p-4 rounded-md">
                   <div style={{background:'#1a237e', color:'white', padding:'16px', borderRadius:'8px', fontFamily:'sans-serif'}}>
                    <div style={{display:'flex', flexWrap:'wrap', justifyContent:'space-between', alignItems:'center', gap:'16px'}}>
                      <p style={{margin:0, fontSize:'14px', lineHeight:'1.5'}}>We collect data for: {purposes.join(', ')}. 
                      Read our <span style={{color:'#64ffda',textDecoration:'underline'}}>Privacy Notice</span>.
                      You can withdraw consent anytime.</p>
                      <div style={{display:'flex', gap:'8px'}}>
                        <div style={{background:'transparent', border:'1px solid white', color:'white', padding:'8px 16px', borderRadius:'4px', cursor:'pointer', fontSize:'14px'}}>Only Essential</div>
                        <div style={{background:'#64ffda', border:'none', color:'#004d40', padding:'8px 16px', borderRadius:'4px', cursor:'pointer', fontWeight:'bold', fontSize:'14px'}}>I Accept</div>
                      </div>
                    </div>
                  </div>
                </div>
                <pre className="text-xs text-gray-300 overflow-x-auto p-4 bg-black/50 rounded-md">
                  {generatedCode}
                </pre>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics">
          <Card>
            <CardHeader><CardTitle>Consent Records</CardTitle><CardDescription>7-year retention log required by DPDP</CardDescription></CardHeader>
            <CardContent>
              <div className="text-center p-12 text-gray-400">
                <PieChart className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p>No consent records yet. Install the snippet on your website to begin logging.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdraw">
           <Card>
            <CardHeader><CardTitle>Consent Withdrawal Link</CardTitle><CardDescription>Provide this link to users so they can manage or withdraw consent</CardDescription></CardHeader>
            <CardContent className="space-y-4">
               <div className="flex gap-2">
                 <Input readOnly value="https://dpdp-comply.vercel.app/consent-centre/c-12345" />
                 <Button variant="outline"><Copy size={16} /></Button>
               </div>
               <p className="text-sm text-gray-500">Section 6(4) of DPDP Act: "The Data Principal shall have the right to withdraw her consent at any time, with the ease of doing so being comparable to the ease with which such consent was given."</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
