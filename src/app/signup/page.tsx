'use client'
import { supabase } from '@/lib/supabase'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { Label } from '@/components/ui/label'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [signedUp, setSignedUp] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast({ title: "Passwords mismatch", description: "Please make sure your passwords match.", variant: "destructive" })
      return
    }

    if (password.length < 6) {
      toast({ title: "Weak password", description: "Password must be at least 6 characters long.", variant: "destructive" })
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      }
    })

    setLoading(false)
    if (error) {
      toast({ title: "Sign Up Failed", description: error.message, variant: "destructive" })
    } else {
      setSignedUp(true)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-lg border-t-4 border-t-[#1a237e]">
        <CardHeader className="space-y-1 items-center pb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-3xl">🛡️</span>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Create your account</CardTitle>
          <CardDescription className="text-center">
            Start your DPDP compliance journey today
          </CardDescription>
        </CardHeader>
        <CardContent>
          {signedUp ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Registration Successful!</h3>
              <p className="text-gray-500 text-sm">
                We've sent a verification email to <strong>{email}</strong>.<br />
                Please check your inbox and click the link to activate your account.
              </p>
              <Button 
                className="w-full mt-4 bg-[#1a237e] hover:bg-[#121958]"
                onClick={() => router.push('/login')}
              >
                Back to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4">
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
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
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

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="h-12"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-[#1a237e] hover:bg-[#121958] text-white"
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Sign Up'}
              </Button>

              <div className="text-center text-sm text-gray-600 mt-4">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-[#1a237e] hover:underline">
                  Sign in
                </Link>
              </div>

              <div className="text-center text-xs text-gray-500 mt-6">
                By signing up, you agree to our{' '}
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
