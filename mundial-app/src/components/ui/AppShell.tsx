import TopNavbar from './TopNavbar'
import Sidebar from './Sidebar'
import type { Profile } from '@/types'

interface AppShellProps {
  profile: Profile | null
  children: React.ReactNode
}

export default function AppShell({ profile, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <TopNavbar profile={profile} />
      <Sidebar profile={profile} />
      <main className="lg:ml-64 pt-24 pb-12 px-6 md:px-10 min-h-screen">
        {children}
      </main>
    </div>
  )
}
