import { redirect } from 'next/navigation'

// El registro está desactivado — los usuarios son creados por el admin
export default function RegisterPage() {
  redirect('/login')
}
