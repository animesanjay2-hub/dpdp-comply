'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export default function SeeDashboardButton() {
  const router = useRouter()

  const goToDashboard = () => {
    // Client-side navigation to avoid NEXT_REDIRECT errors
    router.push('/dashboard')
  }

  return (
    <Button
      size="lg"
      className="h-14 px-8 text-lg bg-teal-500 hover:bg-teal-600 text-white rounded-full group transition-all"
      onClick={goToDashboard}
    >
      Check Your Compliance — FREE
      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
    </Button>
  )
}