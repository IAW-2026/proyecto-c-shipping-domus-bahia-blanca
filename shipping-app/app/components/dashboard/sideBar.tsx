'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CalendarClock,
  ClipboardList,
  CheckCircle2,
  Crown,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/app/components/dashboard/ui/sidebar'

const main = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Turnos', url: '/dashboard/turnos', icon: ClipboardList },
  { title: 'Agenda', url: '/dashboard/agenda', icon: CalendarClock },
  { title: 'Turnos finalizados', url: '/dashboard/finalizados', icon: CheckCircle2 },
]

const adminItem = { title: 'Panel administracion', url: '/admin', icon: Crown }

type SidebarItem = (typeof main)[number] | typeof adminItem

export function AppSidebar({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname()
  const items = isAdmin ? [...main, adminItem] : main

  const isActive = (path: string) =>
    path === '/dashboard' ? pathname === path : pathname.startsWith(path)

  const renderItem = (item: SidebarItem) => (
    <SidebarMenuItem key={item.url}>
      <SidebarMenuButton
        asChild
        isActive={isActive(item.url)}
        className="text-sidebar-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-foreground data-[active=true]:font-medium hover:bg-sidebar-accent transition-colors"
      >
        <Link href={item.url} className="flex items-center gap-3">
          <item.icon className="h-[18px] w-[18px]" />
          <span className="text-[13.5px] group-data-[collapsible=icon]:hidden">{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-border/60 text-sidebar-foreground"
    >
      <SidebarHeader className="px-4 pt-5 pb-3">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground font-display text-lg font-semibold">
            D
          </div>
          <div className="leading-tight group-data-[collapsible=icon]:hidden">
              <p className="font-display text-[15px] font-semibold text-sidebar-foreground">
                Domus
              </p>
              <p className="text-[11px] uppercase tracking-[0.14em] text-sidebar-foreground">
                Bahía Blanca
              </p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>{items.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>
    </Sidebar>
  )
}
