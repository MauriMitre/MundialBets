'use client'

import { useState, useTransition } from 'react'
import { updateProfile, updatePassword } from '@/actions/profile'

interface Props {
  username: string
  displayName: string | null
  email: string
}

export default function ProfileForm({ username, displayName, email }: Props) {
  const [pendingName, startName] = useTransition()
  const [pendingPwd,  startPwd]  = useTransition()
  const [nameMsg, setNameMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const [pwdMsg,  setPwdMsg]  = useState<{ text: string; ok: boolean } | null>(null)

  function handleName(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setNameMsg(null)
    const fd = new FormData(e.currentTarget)
    startName(async () => {
      const res = await updateProfile(fd)
      if (res.error) setNameMsg({ text: res.error, ok: false })
      else           setNameMsg({ text: '¡Nombre actualizado!', ok: true })
    })
  }

  function handlePwd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPwdMsg(null)
    const form = e.currentTarget      // capturar ref antes del transition
    const fd = new FormData(form)
    startPwd(async () => {
      const res = await updatePassword(fd)
      if (res.error) setPwdMsg({ text: res.error, ok: false })
      else {
        setPwdMsg({ text: '¡Contraseña actualizada!', ok: true })
        form.reset()
      }
    })
  }

  return (
    <div className="space-y-6">

      {/* ── Datos personales ─────────────────────────────────── */}
      <div className="card p-6">
        <h2 className="text-white font-semibold mb-5">Datos personales</h2>
        <form onSubmit={handleName} className="space-y-4">

          <div>
            <label className="block text-xs text-white/50 mb-1">Usuario</label>
            <input
              value={username}
              readOnly
              className="input opacity-40 cursor-not-allowed"
              title="El usuario no se puede cambiar"
            />
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-1">Email</label>
            <input
              value={email}
              readOnly
              className="input opacity-40 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-1">Nombre para mostrar</label>
            <input
              name="display_name"
              type="text"
              defaultValue={displayName ?? ''}
              maxLength={40}
              placeholder="Como querés aparecer en el ranking"
              className="input"
              required
            />
          </div>

          {nameMsg && (
            <p className={`text-sm px-3 py-2 rounded-lg border ${
              nameMsg.ok
                ? 'text-green-400 bg-green-500/10 border-green-500/20'
                : 'text-red-400 bg-red-500/10 border-red-500/20'
            }`}>
              {nameMsg.text}
            </p>
          )}

          <button type="submit" disabled={pendingName} className="btn-primary">
            {pendingName ? 'Guardando...' : 'Guardar nombre'}
          </button>
        </form>
      </div>

      {/* ── Cambiar contraseña ───────────────────────────────── */}
      <div className="card p-6">
        <h2 className="text-white font-semibold mb-5">Cambiar contraseña</h2>
        <form onSubmit={handlePwd} className="space-y-4">

          <div>
            <label className="block text-xs text-white/50 mb-1">Contraseña actual</label>
            <input name="current_password" type="password" required className="input" autoComplete="current-password" />
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-1">Nueva contraseña</label>
            <input name="new_password" type="password" required minLength={6} className="input" autoComplete="new-password" />
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-1">Confirmar nueva contraseña</label>
            <input name="confirm_password" type="password" required minLength={6} className="input" autoComplete="new-password" />
          </div>

          {pwdMsg && (
            <p className={`text-sm px-3 py-2 rounded-lg border ${
              pwdMsg.ok
                ? 'text-green-400 bg-green-500/10 border-green-500/20'
                : 'text-red-400 bg-red-500/10 border-red-500/20'
            }`}>
              {pwdMsg.text}
            </p>
          )}

          <button type="submit" disabled={pendingPwd} className="btn-primary">
            {pendingPwd ? 'Actualizando...' : 'Cambiar contraseña'}
          </button>
        </form>
      </div>

    </div>
  )
}
