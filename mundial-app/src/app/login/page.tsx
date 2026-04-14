'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const email = `${username.trim().toLowerCase()}@mundial.app`

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(`${error.status} — ${error.message}`)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="bg-surface font-body text-on-surface overflow-hidden min-h-screen">
      {/* Atmospheric Radial Glow */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(136,217,130,0.08),transparent_70%)] pointer-events-none"></div>

      <main className="min-h-screen flex items-center justify-center p-6 relative">
        {/* Large Ghost Ranking Typography */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-headline font-black text-[30vw] text-primary opacity-[0.03] select-none pointer-events-none uppercase">01</div>

        <div className="w-full max-w-[480px] z-10">
          {/* Brand Logo */}
          <div className="flex flex-col items-center mb-10">
            <span className="text-4xl font-headline font-bold tracking-tighter text-secondary mb-2">EL PODIO</span>
            <div className="h-1 w-12 bg-primary rounded-full"></div>
          </div>

          {/* Login Card */}
          <div className="glass-card rounded-xl p-8 md:p-12 shadow-[0_40px_100px_rgba(0,0,0,0.5)] border border-outline-variant/10">
            <header className="mb-10 text-center">
              <h1 className="font-headline font-bold text-3xl md:text-4xl text-on-surface tracking-tight leading-tight uppercase">
                BIENVENIDO A <span className="text-primary block">LA ARENA</span>
              </h1>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Input */}
              <div className="space-y-2">
                <label htmlFor="username" className="font-label text-xs uppercase tracking-widest text-on-surface-variant ml-1">Usuario</label>
                <div className="relative group">
                  <input
                    id="username"
                    className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-lg px-4 py-4 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 outline-none"
                    placeholder="Ej: Mauricio"
                    type="text"
                    required
                    autoComplete="username"
                    autoCapitalize="none"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label htmlFor="password" className="font-label text-xs uppercase tracking-widest text-on-surface-variant ml-1">Contraseña</label>
                <div className="relative group">
                  <input
                    id="password"
                    className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-lg px-4 py-4 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300 outline-none pr-12"
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 hover:text-on-surface-variant transition-colors duration-200 focus:outline-none"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-error-container/20 text-error rounded-lg px-3 py-2 text-sm font-label">
                  {error}
                </div>
              )}

              {/* Primary Action */}
              <button
                className="w-full gradient-cta text-on-primary py-5 rounded-full font-headline font-bold text-sm tracking-[0.2em] uppercase glow-hover transition-all duration-500 shadow-lg shadow-primary/10 disabled:opacity-60 disabled:cursor-not-allowed"
                type="submit"
                disabled={loading}
              >
                {loading ? 'ENTRANDO...' : 'ENTRAR A LA ARENA'}
              </button>
            </form>

            {/* Footer Link */}
            <div className="mt-12 text-center">
              <p className="font-body text-sm text-on-surface-variant">
                Solo los jugadores registrados pueden acceder.
              </p>
            </div>
          </div>

          {/* Branding Footer */}
          <footer className="mt-8 text-center">
            <p className="font-label text-[9px] uppercase tracking-[0.4em] text-on-surface-variant/30">
              © 2026 EL PODIO • ELITE BETTING LEAGUE
            </p>
          </footer>
        </div>
      </main>

      {/* UI Accents: Grid Lines */}
      <div className="fixed inset-0 pointer-events-none -z-5 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[1px] h-full bg-gradient-to-b from-transparent via-primary/5 to-transparent"></div>
        <div className="absolute top-0 right-1/4 w-[1px] h-full bg-gradient-to-b from-transparent via-primary/5 to-transparent"></div>
        <div className="absolute left-0 top-1/4 h-[1px] w-full bg-gradient-to-r from-transparent via-primary/5 to-transparent"></div>
        <div className="absolute left-0 bottom-1/4 h-[1px] w-full bg-gradient-to-r from-transparent via-primary/5 to-transparent"></div>
      </div>
    </div>
  )
}
