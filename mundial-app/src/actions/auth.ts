'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { SESSION_STARTED_COOKIE } from '@/lib/supabase/middleware'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })

  if (error) return { error: error.message }

  // Reiniciar el contador de sesión de 1h: si quedó una cookie de un login
  // anterior, el middleware expulsaría al usuario en la primera request
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_STARTED_COOKIE)

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function register(formData: FormData) {
  const supabase = await createClient()

  const email = ((formData.get('email') as string | null) ?? '').trim()
  const password = (formData.get('password') as string | null) ?? ''
  const username = ((formData.get('username') as string | null) ?? '').trim().toLowerCase()
  const displayName = ((formData.get('displayName') as string | null) ?? '').trim()

  if (!email || !password) return { error: 'Email y contraseña son obligatorios' }
  if (!username) return { error: 'Elegí un nombre de usuario' }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username, display_name: displayName || username },
    },
  })

  if (error) return { error: error.message }

  // Email ya registrado: Supabase devuelve éxito "fake" sin identities
  if (data.user && data.user.identities?.length === 0) {
    return { error: 'Ese email ya está registrado' }
  }
  // Sin sesión = confirmación de email pendiente; redirigir al dashboard
  // rebotaría a /login sin explicación
  if (!data.session) {
    return { error: 'Revisá tu email para confirmar la cuenta antes de ingresar' }
  }

  const cookieStore = await cookies()
  cookieStore.delete(SESSION_STARTED_COOKIE)

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_STARTED_COOKIE)
  redirect('/login')
}
