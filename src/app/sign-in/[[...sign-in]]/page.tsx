'use client'
import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <span className="text-4xl">🛡️</span>
          <h1 className="text-2xl font-bold text-[#1a237e] mt-2">DPDPComply</h1>
          <p className="text-gray-500 text-sm mt-1">India&apos;s DPDP Act compliance tool</p>
        </div>
        <SignIn
          appearance={{
            elements: {
              formButtonPrimary: 'bg-[#1a237e] hover:bg-[#121958] text-sm normal-case',
              card: 'shadow-lg border-t-4 border-t-[#1a237e]',
              headerTitle: 'text-[#1a237e]',
              socialButtonsBlockButton: 'border border-gray-300 hover:bg-gray-50',
            }
          }}
        />
      </div>
    </div>
  )
}