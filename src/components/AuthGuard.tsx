'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, useUser } from '@clerk/nextjs'
import { Spinner } from '@/components/ui/spinner' // tiny spinner component (will be created next)

export function AuthGuard({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { userId, isLoaded: authLoaded } = useAuth()
  const { isLoaded: userLoaded } = useUser()

  // Wait for Clerk to finish loading
  const loading = !authLoaded || !userLoaded

  useEffect(() => {
    if (!loading && !userId) {
      // Not logged in → send to sign‑in
      router.replace('/sign-in')
    }
  }, [loading, userId, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Spinner />
      </div>
    )
  }

  // If we reach here we have a userId
  return <>{children}</>
}