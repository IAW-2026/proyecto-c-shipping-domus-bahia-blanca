import { SidebarProvider } from '@/app/components/dashboard/ui/sidebar'
import { AppSidebar } from '@/app/components/dashboard/sideBar'
import { requireAgente } from '@/lib/auth/requireAgente'
import { auth } from '@clerk/nextjs/server'
import { userHasAdminRole } from '@/lib/auth/requireAdmin'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  
  await requireAgente()
  const { userId } = await auth()
  const isAdmin = userId ? await userHasAdminRole(userId) : false

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#FAF8F5]">
        <AppSidebar isAdmin={isAdmin} />
        <div className="flex min-w-0 flex-1 flex-col">
          {children}
        </div>
      </div>
    </SidebarProvider>
  )
}
