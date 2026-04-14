'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, Target, Trophy, BookOpen, Settings, LogOut, History } from 'lucide-react'
import type { Profile } from '@/types'

const navLinks = [
  { href: '/dashboard',   label: 'Dashboard',    Icon: LayoutDashboard },
  { href: '/predict',     label: 'Predicciones', Icon: Target },
  { href: '/history',     label: 'Mis apuestas', Icon: History },
  { href: '/leaderboard', label: 'Clasificación', Icon: Trophy },
  { href: '/rules',       label: 'Reglas',        Icon: BookOpen },
]

export default function Sidebar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname()
  const router   = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full h-screen w-64 bg-[#131313] bg-[#1c1c1c] z-40 pt-20">

      {/* Liga badge */}
      <div className="px-6 py-6">
        <div className="flex items-center gap-3">
          <Trophy size={28} className="text-secondary-container flex-shrink-0" strokeWidth={1.5} />
          <div>
            <h2 className="text-secondary-container font-headline font-black uppercase tracking-tighter leading-none">
              World Cup Arena
            </h2>
            <p className="text-on-surface-variant text-[10px] uppercase tracking-widest mt-0.5">
              Elite Betting League
            </p>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-4 space-y-1">
        {navLinks.map(({ href, label, Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-body ${
                active
                  ? 'bg-gradient-to-r from-primary/20 to-transparent text-primary border-l-4 border-primary'
                  : 'text-secondary/70 hover:bg-[#1c1c1c] hover:text-primary border-l-4 border-transparent'
              }`}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 1.75} />
              <span>{label}</span>
            </Link>
          )
        })}

        {profile?.isAdmin && (
          <Link
            href="/admin"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-body ${
              pathname.startsWith('/admin')
                ? 'bg-gradient-to-r from-primary/20 to-transparent text-primary border-l-4 border-primary'
                : 'text-secondary/70 hover:bg-[#1c1c1c] hover:text-primary border-l-4 border-transparent'
            }`}
          >
            <Settings size={18} strokeWidth={1.75} />
            <span>Admin</span>
          </Link>
        )}
      </nav>

      {/* Place Bet CTA */}
      <div className="px-4 mb-6">
        <Link
          href="/predict"
          className="block w-full py-3 gradient-cta text-on-primary font-headline font-bold rounded-xl text-xs uppercase tracking-wider text-center shadow-lg shadow-primary/10 transition-opacity hover:opacity-90"
        >
          Apostar
        </Link>
      </div>

      {/* Footer */}
      <div className="px-4 border-t border-white/5 pt-4 pb-6 space-y-1">
        <Link
          href="/profile"
          className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-colors text-sm font-body ${
            pathname === '/profile'
              ? 'text-primary'
              : 'text-secondary/70 hover:text-primary'
          }`}
        >
          <Settings size={16} strokeWidth={1.5} />
          <span>Mi perfil</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 w-full text-left text-secondary/40 hover:text-primary transition-colors"
        >
          <LogOut size={16} strokeWidth={1.5} />
          <span className="font-body text-sm">Cerrar sesión</span>
        </button>
      </div>
    </aside>
  )
}
