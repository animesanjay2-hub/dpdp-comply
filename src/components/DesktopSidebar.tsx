'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Shield, Cookie, AlertTriangle, FileText, LayoutDashboard } from 'lucide-react'
import { UserButton } from '@clerk/nextjs'

export function DesktopSidebar() {
  const pathname = usePathname()

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/audit', label: 'Data Audit', icon: Shield },
    { href: '/consent', label: 'Consent Manager', icon: Cookie },
    { href: '/breach', label: 'Breach Response', icon: AlertTriangle },
    { href: '/documents', label: 'Documents', icon: FileText }
  ]

  // Hide on public/onboarding pages
  if (['/', '/login', '/signup', '/sign-in', '/sign-up', '/onboarding'].some(p => pathname.startsWith(p))) return null

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r min-h-screen p-4 sticky top-0 h-screen overflow-y-auto">
      <div className="flex items-center gap-2 mb-10 px-2 pt-2">
        <span className="text-2xl">🛡️</span>
        <span className="font-bold text-xl text-[#1a237e]">DPDPComply</span>
      </div>
      <nav className="space-y-2 flex-1">
        {links.map(link => {
          const isActive = pathname.startsWith(link.href)
          const Icon = link.icon
          return (
            <Link 
              key={link.href} 
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-colors ${
                isActive 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon size={18} /> {link.label}
            </Link>
          )
        })}
      </nav>
      {/* Clerk user profile + sign out button */}
      <div className="border-t pt-4 mt-4 flex items-center gap-3 px-2">
        <UserButton afterSignOutUrl="/sign-in" />
        <span className="text-sm text-gray-500">Account</span>
      </div>
    </aside>
  )
}
