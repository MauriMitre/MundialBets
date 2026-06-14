import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const user = {
  username: 'Emiliano',
  displayName: 'Emiliano Herrera',
  password: '131313',
  isAdmin: false,
}

// Nota: el trigger `on_auth_user_created` crea automáticamente la fila en
// `profiles` usando el username del email (en minúscula). Por eso el flujo es:
// crear el auth user -> el trigger crea el profile -> actualizar username/displayName.
async function main() {
  const email = `${user.username.toLowerCase()}@mundial.app`

  // ¿Ya existe? (busca tanto el username deseado como el que deriva el trigger)
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .in('username', [user.username, user.username.toLowerCase()])
    .maybeSingle()

  let userId = existing?.id

  if (userId) {
    await supabase.auth.admin.updateUserById(userId, { password: user.password })
    console.log(`🔄 ${user.username} — ya existía, contraseña actualizada`)
  } else {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: user.password,
      email_confirm: true,
    })
    if (error || !data?.user) {
      console.error(`❌ ${user.username}: ${error?.message ?? 'sin respuesta'}`)
      process.exit(1)
    }
    userId = data.user.id
    console.log(`✅ ${user.username} — auth user creado`)
  }

  // Ajustar el profile a los valores deseados (el trigger lo dejó en minúscula)
  const { error: updErr } = await supabase
    .from('profiles')
    .update({
      username: user.username,
      display_name: user.displayName,
      is_admin: user.isAdmin,
    })
    .eq('id', userId)

  if (updErr) {
    console.error(`❌ ${user.username} profile: ${updErr.message}`)
    process.exit(1)
  }

  console.log('─'.repeat(38))
  console.log('Usuario   | Contraseña')
  console.log(`${user.username.padEnd(10)}| ${user.password}`)
  console.log('─'.repeat(38))
}

main().catch(console.error)
