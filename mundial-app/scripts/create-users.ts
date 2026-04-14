import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const users = [
  { username: 'Mauricio',   displayName: 'Mauricio',  password: '111111', isAdmin: false },
  { username: 'TomasFa',    displayName: 'Tomas Fa',  password: '222222', isAdmin: false },
  { username: 'TomasFlo',   displayName: 'Tomas Flo', password: '333333', isAdmin: false },
  { username: 'LucasM',     displayName: 'Lucas M',   password: '444444', isAdmin: false },
  { username: 'LucasL',     displayName: 'Lucas L',   password: '555555', isAdmin: false },
  { username: 'Gonzalo',    displayName: 'Gonzalo',   password: '666666', isAdmin: false },
  { username: 'JuanBor',    displayName: 'Juan Bor',  password: '777777', isAdmin: false },
  { username: 'JuanRea',    displayName: 'Juan Rea',  password: '888888', isAdmin: false },
  { username: 'Elio',       displayName: 'Elio',      password: '999999', isAdmin: false },
  { username: 'Ramiro',     displayName: 'Ramiro',    password: '101010', isAdmin: false },
  { username: 'Julian',     displayName: 'Julian',    password: '121212', isAdmin: false },
  { username: 'MauroAdmin', displayName: 'Admin',     password: 'admin2026', isAdmin: true },
]

async function main() {
  console.log('Creando usuarios...\n')

  for (const user of users) {
    const email = `${user.username.toLowerCase()}@mundial.app`

    // Buscar si ya existe por username en profiles
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', user.username)
      .single()

    if (existing) {
      await supabase.auth.admin.updateUserById(existing.id, { password: user.password })
      if (user.isAdmin) {
        await supabase.from('profiles').update({ is_admin: true }).eq('id', existing.id)
      }
      console.log(`🔄 ${user.username} — actualizado${user.isAdmin ? ' [ADMIN]' : ''}`)
      continue
    }

    // Crear usuario en auth (sin metadata para no disparar el trigger con datos que fallan)
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: user.password,
      email_confirm: true,
    })

    if (error || !data?.user) {
      console.error(`❌ ${user.username}: ${error?.message ?? 'sin respuesta'}`)
      continue
    }

    const userId = data.user.id

    // Crear el profile via la función SQL que creamos
    const { error: rpcErr } = await supabase.rpc('create_user_profile', {
      p_user_id: userId,
      p_username: user.username,
      p_display_name: user.displayName,
      p_is_admin: user.isAdmin,
    })

    if (rpcErr) {
      // Fallback: intentar insert directo
      const { error: insertErr } = await supabase.from('profiles').insert({
        id: userId,
        username: user.username,
        display_name: user.displayName,
        is_admin: user.isAdmin,
        total_points: 0,
      })
      if (insertErr) {
        console.error(`❌ ${user.username} profile: ${insertErr.message}`)
        continue
      }
    }

    console.log(`✅ ${user.username} — creado${user.isAdmin ? ' [ADMIN]' : ''}`)
  }

  console.log('\n¡Listo! Tabla de accesos:')
  console.log('─'.repeat(38))
  console.log('Usuario       | Contraseña')
  console.log('─'.repeat(38))
  for (const user of users) {
    console.log(`${user.username.padEnd(14)}| ${user.password}${user.isAdmin ? '  ← ADMIN' : ''}`)
  }
  console.log('─'.repeat(38))
}

main().catch(console.error)
