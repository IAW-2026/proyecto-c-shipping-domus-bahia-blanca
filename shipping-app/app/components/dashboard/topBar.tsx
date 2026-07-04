'use client'
import { useUser, UserButton } from '@clerk/nextjs'
import { SidebarTrigger } from '@/app/components/dashboard/ui/sidebar'


type Crumb = { label: string; href?: string }

export function AppTopbar({ crumbs }: { crumbs?: Crumb[] }) {
  const { user } = useUser()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/60 bg-[#FAF8F5] px-6 backdrop-blur-xl">
      <SidebarTrigger className="-ml-2 text-muted-foreground hover:text-foreground" />
      {crumbs && crumbs.length > 0 && (
        <nav className="hidden items-center gap-1.5 text-[13px] text-muted-foreground md:flex">
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-muted-foreground/40">/</span>}
              <span className={i === crumbs.length - 1 ? 'text-foreground font-medium' : ''}>
                {c.label}
              </span>
            </span>
          ))}
        </nav>
      )}

      <div className="ml-auto flex items-center gap-3">
        <div className="flex items-center gap-2.5 pl-2">
          <div className="text-right leading-tight">
            <p className="text-[13px] font-medium text-foreground">
              {user?.fullName ?? 'Agente'}
            </p>
            <p className="text-[11px] text-muted-foreground">Agente inmobiliario</p>
          </div>
          <UserButton
            appearance={{
              elements: {
                avatarBox: 'h-9 w-9 ring-2 ring-secondary rounded-full',
              },
            }}
          />
        </div>
      </div>
    </header>
  )
}