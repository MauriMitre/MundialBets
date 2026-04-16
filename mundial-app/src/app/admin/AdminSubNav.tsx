'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/admin',          label: '📋 Partidos' },
  { href: '/admin/results',  label: '⚽ Resultados' },
  { href: '/admin/teams',    label: '🛡️ Equipos' },
  { href: '/admin/players',  label: '👤 Jugadores' },
  { href: '/admin/points',   label: '🏅 Puntos' },
]

export default function AdminSubNav() {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
      {links.map(link => (
        <Link
          key={link.href}
          href={link.href}
          className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 border ${
            isActive(link.href)
              ? 'bg-primary/20 text-primary border-primary/30'
              : 'text-secondary/60 border-outline-variant/20 hover:text-primary hover:bg-surface-container-high'
          }`}
        >
          {link.label}
        </Link>
      ))}
    </div>
  )
}
