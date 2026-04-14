'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const raw = formData.get('display_name')
  if (typeof raw !== 'string') return { error: 'Datos inválidos' }

  const displayName = raw.trim()

  if (!displayName) return { error: 'El nombre no puede estar vacío' }
  if (displayName.length > 40) return { error: 'Máximo 40 caracteres' }

  const { error } = await supabase
    .from('profiles')
    .update({ display_name: displayName })
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  if (!user.email) return { error: 'La cuenta no tiene email asociado' }

  const current = formData.get('current_password')
  const next    = formData.get('new_password')
  const confirm = formData.get('confirm_password')

  if (typeof current !== 'string' || typeof next !== 'string' || typeof confirm !== 'string') {
    return { error: 'Datos inválidos' }
  }

  if (!current) return { error: 'Ingresá tu contraseña actual' }
  if (!next)    return { error: 'Ingresá la nueva contraseña' }
  if (next.length < 6) return { error: 'Mínimo 6 caracteres' }
  if (next !== confirm) return { error: 'Las contraseñas no coinciden' }
  if (next === current) return { error: 'La nueva contraseña debe ser diferente a la actual' }

  const { error: authError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: current,
  })
  if (authError) return { error: 'Contraseña actual incorrecta' }

  const { error } = await supabase.auth.updateUser({ password: next })
  if (error) return { error: error.message }

  return { success: true }
}
