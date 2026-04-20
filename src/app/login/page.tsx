'use client'
import { supabase } from '@/lib/supabase'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { CheckCircle2, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { Label } from '@/components/ui/label'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [useMagicLink, setUseMagicLink] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/dashboard')
      }
    }
    checkUser()
  }, [router])

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      toast({ title: "Login Failed", description: error.message, variant: "destructive" })
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  async function handleMagicLinkLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const redirectUrl = `${window.location.origin}/dashboard`

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectUrl }
    })

    setLoading(false)
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } else {
      setMagicLinkSent(true)
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
            {useMagicLink ? 'Enter your email for a magic link' : 'Enter your credentials to sign in'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {magicLinkSent ? (
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
                onClick={() => { setMagicLinkSent(false); setEmail('') }}
                className="text-sm text-gray-400 hover:text-gray-600 underline mt-4"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <form onSubmit={useMagicLink ? handleMagicLinkLogin : handlePasswordLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>
                
                {!useMagicLink && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link 
                        href="/forgot-password" 
                        className="text-sm font-medium text-[#1a237e] hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="h-12 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 bg-[#1a237e] hover:bg-[#121958] text-white"
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : (useMagicLink ? 'Send Magic Link' : 'Sign In')}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">Or continue with</span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full h-12 border-gray-300"
                onClick={() => setUseMagicLink(!useMagicLink)}
              >
                {useMagicLink ? (
                  <><Lock className="mr-2 h-4 w-4" /> Sign in with Password</>
                ) : (
                  <><Mail className="mr-2 h-4 w-4" /> Sign in with Magic Link</>
                )}
              </Button>

              <div className="text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <Link href="/signup" className="font-medium text-[#1a237e] hover:underline">
                  Sign up
                </Link>
              </div>

              <div className="text-center text-xs text-gray-500">
                By signing in, you agree to our{' '}
                <Link href="#" className="underline hover:text-gray-700">Terms</Link> and{' '}
                <Link href="#" className="underline hover:text-gray-700">Privacy Policy</Link>.
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
