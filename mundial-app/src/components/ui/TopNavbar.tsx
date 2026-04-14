'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Profile } from '@/types'

const navLinks = [
  { href: '/dashboard',   label: 'Dashboard' },
  { href: '/predict',     label: 'Predicciones' },
  { href: '/leaderboard', label: 'Clasificación' },
  { href: '/rules',       label: 'Reglas' },
]

export default function TopNavbar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const initial = (profile?.displayName || profile?.username || 'U').charAt(0).toUpperCase()

  return (
    <nav
      className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-20 bg-[#131313] stadium-shadow font-headline tracking-tight"
    >
      {/* Logo */}
      <Link href="/dashboard" className="text-2xl font-bold tracking-tighter text-secondary">
        EL PODIO
      </Link>

      {/* Nav links */}
      <div className="hidden md:flex items-center gap-8">
        {navLinks.map(link => {
          const active = isActive(link.href)
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors duration-300 ${
                active
                  ? 'text-primary font-bold border-b-2 border-primary pb-0.5'
                  : 'text-secondary/60 hover:text-primary'
              }`}
            >
              {link.label}
            </Link>
          )
        })}
      </div>

      {/* User avatar */}
      <div className="flex items-center gap-3">
        {profile && (
          <span className="hidden sm:block text-sm text-on-surface-variant font-label">
            {profile.totalPoints ?? 0} <span className="text-primary font-bold">pts</span>
          </span>
        )}
        <div className="w-10 h-10 rounded-full bg-surface-container-high border border-outline-variant/30 flex items-center justify-center overflow-hidden">
          <span className="text-sm font-headline font-bold text-primary">{initial}</span>
        </div>
      </div>
    </nav>
  )
}
