import Link from 'next/link'
import { ArrowRight, ShieldCheck, Cookie, BellRing, FileText, Users, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa] selection:bg-[#1a237e] selection:text-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🛡️</span>
          <span className="font-bold text-xl tracking-tight text-[#1a237e]">DPDPComply</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 hidden sm:block">
            Login
          </Link>
          <Link href="/login">
            <Button className="bg-[#1a237e] hover:bg-[#121958] text-white">
              Start Free
            </Button>
          </Link>
        </div>
      </nav>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-[#1a237e] text-white py-20 px-6 relative overflow-hidden">
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm font-medium mb-8 animate-fade-in">
              <span className="flex h-2 w-2 rounded-full bg-red-400 animate-pulse"></span>
              India&apos;s DPDP Act deadline is May 13, 2027
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
              Is your startup ready? <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400">Most aren&apos;t.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
              Automate your compliance in 5 minutes. No lawyers, no generic foreign tools. Built specifically for Indian startups.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <Link href="/login">
                <Button size="lg" className="h-14 px-8 text-lg bg-teal-500 hover:bg-teal-600 text-white rounded-full group transition-all">
                  Check Your Compliance — FREE
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
            <p className="text-sm text-blue-200">No credit card. No install. 5 minute setup.</p>
          </div>
          
          {/* Abstract background shapes */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
            <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-teal-400 blur-[120px]"></div>
            <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] rounded-full bg-blue-500 blur-[100px]"></div>
          </div>
        </section>

        {/* Penalty Section */}
        <section className="py-20 px-6 bg-white relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">The Cost of Non-Compliance</h2>
              <p className="text-lg text-gray-600">The Data Protection Board can levy massive fines starting May 2027.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { amount: "₹250 Crore", reason: "Security breach failures", desc: "Failure to take reasonable security safeguards" },
                { amount: "₹200 Crore", reason: "Failing to notify DPB", desc: "Not reporting a breach within 72 hours" },
                { amount: "₹200 Crore", reason: "Children&apos;s data violations", desc: "No verifiable parental consent mechanism" },
                { amount: "₹150 Crore", reason: "SDF non-compliance", desc: "Significant Data Fiduciary obligations missed" }
              ].map((penalty, i) => (
                <Card key={i} className="border-red-100 bg-red-50/30 hover:border-red-200 hover:shadow-lg transition-all pt-6">
                  <CardContent className="text-center">
                    <div className="text-4xl font-extrabold text-red-600 mb-2">{penalty.amount}</div>
                    <div className="font-semibold text-gray-900 mb-2">{penalty.reason}</div>
                    <p className="text-sm text-gray-600">{penalty.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
             <div className="text-center mb-16 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Built for India, For India</h2>
              <p className="text-lg text-gray-600">
                Foreign tools like OneTrust and TrustArc cannot legally operate as consent managers under DPDP. You need a solution built ground-up for Indian law.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {[
                { icon: ShieldCheck, title: "Data Audit", desc: "Map every piece of personal data you collect and why." },
                { icon: Cookie, title: "Consent Manager", desc: "DPDP-compliant consent banners and withdrawal links." },
                { icon: BellRing, title: "Breach Response", desc: "72-hour DPB notification timer & workflow." },
                { icon: FileText, title: "Privacy Docs", desc: "AI-generated plain-language privacy notices." },
                { icon: Target, title: "Compliance Score", desc: "Real-time dashboard showing exactly where you stand." },
                { icon: Users, title: "Children&apos;s Data", desc: "Built-in workflows for age verification mapping." }
              ].map((f, i) => (
                <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-8">
                    <div className="h-12 w-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center mb-6">
                      <f.icon size={24} />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900">{f.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{f.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-24 px-6 relative bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900">Ready to secure your startup?</h2>
            <p className="text-xl text-gray-600 mb-10">Join 340+ Indian startups taking DPDP compliance seriously.</p>
             <Link href="/login">
                <Button size="lg" className="h-14 px-10 text-lg bg-[#1a237e] hover:bg-[#121958] text-white rounded-full">
                  Start your free compliance check
                </Button>
            </Link>
            <p className="text-sm text-gray-500 mt-4">Takes 5 minutes. Free forever for basic features.</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-6 text-center text-sm border-t border-gray-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xl">🛡️</span>
            <span className="font-bold tracking-tight text-white">DPDPComply</span>
          </div>
          <p>Built for India. DPDP Act 2023 compliant.</p>
          <div className="flex gap-4">
             <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
             <Link href="#" className="hover:text-white transition-colors">Terms</Link>
             <Link href="#" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-xs max-w-3xl mx-auto">
          DPDPComply provides compliance templates and guidance tools. We are not a law firm. All generated documents are templates only and should be reviewed by a qualified legal professional before use.
        </div>
      </footer>
    </div>
  )
}