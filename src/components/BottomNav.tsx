'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Shield, Cookie, AlertTriangle, FileText } from 'lucide-react'

export function BottomNav() {
  const pathname = usePathname()

  const links = [
    { href: '/dashboard', label: 'Home', icon: Home },
    { href: '/audit', label: 'Audit', icon: Shield },
    { href: '/consent', label: 'Consent', icon: Cookie },
    { href: '/breach', label: 'Breach', icon: AlertTriangle },
    { href: '/documents', label: 'Docs', icon: FileText }
  ]

  // Only show on these pages
  const showNav = links.some(link => pathname.startsWith(link.href))
  if (!showNav) return null

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-16">
        {links.map((link) => {
          const isActive = pathname.startsWith(link.href)
          const Icon = link.icon
          return (
            <Link 
              key={link.href} 
              href={link.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? 'text-[#1a237e]' : 'text-gray-500 hover:text-[#1a237e]'
              }`}
            >
              <Icon size={20} className={isActive ? 'stroke-2' : 'stroke-[1.5]'} />
              <span className="text-[10px] font-medium">{link.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
