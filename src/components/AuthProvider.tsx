'use client'

// Re-export Clerk hooks so existing code that imports from here still works
export { useUser as useAuth } from '@clerk/nextjs'

// Dummy AuthProvider wrapper for layout compatibility (ClerkProvider is in layout.tsx)
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}