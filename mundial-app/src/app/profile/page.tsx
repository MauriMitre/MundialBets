import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProfileForm from './ProfileForm'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, display_name, total_points, is_admin')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card p-10 text-center text-on-surface-variant">
          <p className="text-3xl mb-3">⚠️</p>
          <p className="font-body">No se encontró tu perfil. Contactá al admin.</p>
        </div>
      </div>
    )
  }

  // Queries independientes en paralelo
  const [{ count: rankAbove }, { count: predCount }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .gt('total_points', profile.total_points ?? 0),
    supabase
      .from('predictions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id),
  ])

  const rank = (rankAbove ?? 0) + 1
  const displayName = profile.display_name ?? profile.username
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <div className="max-w-2xl mx-auto">

      {/* Header */}
      <header className="mb-8">
        <h1 className="font-headline text-4xl font-bold tracking-tighter text-on-surface">
          Mi Perfil
        </h1>
        <p className="font-label text-primary uppercase tracking-[0.3em] text-xs mt-2">
          Configuración de cuenta
        </p>
      </header>

      {/* Stats card */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-5 mb-6">
          <div className="w-16 h-16 rounded-full bg-surface-container-high border-2 border-primary/30 flex items-center justify-center shrink-0">
            <span className="text-2xl font-headline font-bold text-primary">{initial}</span>
          </div>
          <div>
            <p className="font-headline font-bold text-xl text-on-surface">{displayName}</p>
            <p className="text-on-surface-variant text-sm">@{profile.username}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-surface-container-high rounded-xl p-4 text-center">
            <p className="font-headline text-3xl font-black text-primary">
              {profile.total_points ?? 0}
            </p>
            <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mt-1">
              Puntos
            </p>
          </div>
          <div className="bg-surface-container-high rounded-xl p-4 text-center">
            <p className="font-headline text-3xl font-black text-secondary-container">
              #{rank}
            </p>
            <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mt-1">
              Posición
            </p>
          </div>
          <div className="bg-surface-container-high rounded-xl p-4 text-center">
            <p className="font-headline text-3xl font-black text-on-surface">
              {predCount ?? 0}
            </p>
            <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mt-1">
              Predicciones
            </p>
          </div>
        </div>
      </div>

      {/* Formularios */}
      <ProfileForm
        username={profile.username}
        displayName={profile.display_name ?? null}
        email={user.email ?? ''}
      />

    </div>
  )
}
