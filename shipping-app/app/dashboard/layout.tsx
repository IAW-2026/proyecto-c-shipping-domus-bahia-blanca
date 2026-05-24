import { SidebarProvider } from '@/app/components/dashboard/ui/sidebar'
import { AppSidebar } from '@/app/components/dashboard/sideBar'
import { requireAgente } from '@/lib/auth/requireAgente'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  
  await requireAgente()

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          {children}
        </div>
      </div>
    </SidebarProvider>
  )
}