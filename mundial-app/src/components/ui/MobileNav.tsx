'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Target, Trophy, BookOpen, Settings, History } from 'lucide-react'
import type { Profile } from '@/types'

const navLinks = [
  { href: '/dashboard',   label: 'Inicio',     Icon: LayoutDashboard },
  { href: '/predict',     label: 'Apostar',    Icon: Target },
  { href: '/history',     label: 'Apuestas',   Icon: History },
  { href: '/leaderboard', label: 'Tabla',      Icon: Trophy },
  { href: '/rules',       label: 'Reglas',     Icon: BookOpen },
]

export default function MobileNav({ profile }: { profile: Profile | null }) {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const links = profile?.is_admin
    ? [...navLinks, { href: '/admin', label: 'Admin', Icon: Settings }]
    : navLinks

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#1c1c1c] border-t border-white/5 stadium-shadow"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex justify-around items-stretch">
        {links.map(({ href, label, Icon }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 flex-1 py-2.5 transition-colors ${
                active ? 'text-primary' : 'text-secondary/50'
              }`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.75} />
              <span className="font-label text-[10px] uppercase tracking-wide leading-none">
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
