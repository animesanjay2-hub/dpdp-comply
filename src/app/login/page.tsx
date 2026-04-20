'use client'
import { supabase } from '@/lib/supabase'
import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { CheckCircle2, Mail } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { toast } = useToast()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const redirectUrl = process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
      : `${window.location.origin}/dashboard`

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectUrl }
    })

    setLoading(false)
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-lg border-t-4 border-t-[#1a237e]">
        <CardHeader className="space-y-1 items-center pb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-3xl">🛡️</span>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Sign in to DPDPComply</CardTitle>
          <CardDescription className="text-center">
            Enter your email to receive a magic link
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            // Persistent "sent" success state
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Check your email!</h3>
              <p className="text-gray-500 text-sm">
                We sent a magic link to <strong>{email}</strong>.<br />
                Click the link to sign in — no password needed.
              </p>
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700">
                <Mail size={16} className="inline mr-2" />
                Can't find it? Check your spam folder.
              </div>
              <button
                onClick={() => { setSent(false); setEmail('') }}
                className="text-sm text-gray-400 hover:text-gray-600 underline mt-4"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="name@startup.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 bg-[#1a237e] hover:bg-[#121958] text-white"
                disabled={loading}
              >
                {loading ? 'Sending link...' : 'Send Magic Link'}
              </Button>
              <div className="mt-4 text-center text-sm text-gray-500">
                By signing in, you agree to our{' '}
                <Link href="#" className="underline hover:text-gray-700">Terms</Link> and{' '}
                <Link href="#" className="underline hover:text-gray-700">Privacy Policy</Link>.
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
