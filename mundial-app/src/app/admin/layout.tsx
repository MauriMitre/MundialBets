import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/ui/Navbar'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) redirect('/dashboard')

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar profile={profile} />
      <div className="max-w-4xl mx-auto w-full px-4 py-6 flex-1">
        {/* Sub-nav admin */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {[
            { href: '/admin',         label: '📋 Partidos' },
            { href: '/admin/results', label: '⚽ Resultados' },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="btn-secondary whitespace-nowrap text-sm"
            >
              {link.label}
            </Link>
          ))}
        </div>
        {children}
      </div>
    </div>
  )
}
