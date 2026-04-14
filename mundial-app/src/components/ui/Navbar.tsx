'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Profile } from '@/types'

interface NavbarProps {
  profile: Profile | null
}

const navLinks = [
  { href: '/dashboard',   label: 'Partidos',  icon: '📅' },
  { href: '/leaderboard', label: 'Tabla',      icon: '🏆' },
]

export default function Navbar({ profile }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header style={{ background: 'rgba(10,40,18,0.95)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      className="sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-white">
          <span className="text-xl">⚽</span>
          <span className="hidden sm:block text-sm font-semibold" style={{ color: '#f5c518' }}>
            Mundial 2026
          </span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              style={{
                background: pathname === link.href ? 'rgba(245,197,24,0.15)' : 'transparent',
                color: pathname === link.href ? '#f5c518' : 'rgba(255,255,255,0.6)',
              }}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}

          {profile?.isAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              style={{
                background: pathname.startsWith('/admin') ? 'rgba(245,197,24,0.15)' : 'transparent',
                color: pathname.startsWith('/admin') ? '#f5c518' : 'rgba(255,255,255,0.6)',
              }}
            >
              <span>⚙️</span>
              <span className="hidden sm:block">Admin</span>
            </Link>
          )}
        </nav>

        {/* Usuario */}
        <div className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-white leading-none">
              {profile?.displayName || profile?.username}
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#f5c518' }}>
              {profile?.totalPoints ?? 0} pts
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="btn-secondary text-xs px-3 py-1.5"
            style={{ padding: '6px 12px' }}
          >
            Salir
          </button>
        </div>

      </div>
    </header>
  )
}
