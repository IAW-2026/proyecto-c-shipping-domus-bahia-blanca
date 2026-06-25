import { AppTopbar } from '@/app/components/dashboard/topBar'
import { Skeleton } from '@/app/components/dashboard/ui/skeleton'

type DashboardSkeletonProps = {
  variant?: 'overview' | 'agenda' | 'list' | 'detail'
}

function HeaderSkeleton() {
  return (
    <header className="mb-7 flex flex-wrap items-end justify-between gap-3">
      <div className="w-full max-w-md">
        <Skeleton className="h-9 w-56 rounded-lg" />
        <Skeleton className="mt-3 h-4 w-full max-w-sm rounded-lg" />
      </div>
      <Skeleton className="h-9 w-28 rounded-lg" />
    </header>
  )
}

function MetricsSkeleton() {
  return (
    <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <Skeleton className="h-3 w-28 rounded-lg" />
              <Skeleton className="mt-4 h-8 w-16 rounded-lg" />
              <Skeleton className="mt-3 h-3 w-36 rounded-lg" />
            </div>
            <Skeleton className="h-11 w-11 rounded-xl" />
          </div>
        </div>
      ))}
    </section>
  )
}

function CardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <ul className="mt-7 grid grid-cols-1 gap-4 lg:grid-cols-2">
      {Array.from({ length: count }).map((_, index) => (
        <li key={index} className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <Skeleton className="h-3 w-20 rounded-lg" />
              <Skeleton className="mt-3 h-6 w-3/4 rounded-lg" />
              <Skeleton className="mt-3 h-4 w-2/3 rounded-lg" />
            </div>
            <Skeleton className="h-7 w-24 rounded-full" />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-secondary/60 p-3.5">
            <Skeleton className="h-12 rounded-lg" />
            <Skeleton className="h-12 rounded-lg" />
          </div>
          <div className="mt-5 flex justify-end">
            <Skeleton className="h-9 w-24 rounded-lg" />
          </div>
        </li>
      ))}
    </ul>
  )
}

function AgendaSkeleton() {
  return (
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1.5fr_1fr]">
      <div className="hidden self-start overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft lg:block">
        <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-border/60 bg-secondary/30 px-3 py-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="mx-auto h-3 w-10 rounded-lg" />
          ))}
        </div>
        <div className="h-[487px] overflow-hidden">
          {Array.from({ length: 8 }).map((_, row) => (
            <div key={row} className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-border/40">
              {Array.from({ length: 8 }).map((_, col) => (
                <div key={col} className="min-h-16 border-r border-border/40 p-3 last:border-0">
                  {(row + col) % 5 === 0 ? <Skeleton className="h-8 rounded-lg" /> : null}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div>
        <Skeleton className="mb-5 h-8 w-32 rounded-lg" />
        <CardsSkeleton count={3} />
      </div>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <Skeleton className="h-3 w-24 rounded-lg" />
            <Skeleton className="mt-3 h-8 w-3/4 rounded-lg" />
            <Skeleton className="mt-3 h-4 w-2/3 rounded-lg" />
          </div>
          <Skeleton className="h-7 w-28 rounded-full" />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-xl bg-secondary/60 p-4">
              <Skeleton className="h-3 w-20 rounded-lg" />
              <Skeleton className="mt-3 h-5 w-4/5 rounded-lg" />
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </section>

      <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
        <Skeleton className="h-7 w-36 rounded-lg" />
        <Skeleton className="mt-5 min-h-[320px] rounded-xl" />
      </section>
    </div>
  )
}

export function DashboardSkeleton({ variant = 'overview' }: DashboardSkeletonProps) {
  return (
    <>
      <AppTopbar crumbs={[{ label: 'Inicio' }]} />
      <main className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-10">
        <HeaderSkeleton />
        {variant === 'overview' ? (
          <>
            <MetricsSkeleton />
            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
                <Skeleton className="h-7 w-44 rounded-lg" />
                <div className="mt-5 space-y-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-16 rounded-xl" />
                  ))}
                </div>
              </div>
              <Skeleton className="min-h-[320px] rounded-2xl" />
            </div>
          </>
        ) : variant === 'agenda' ? (
          <AgendaSkeleton />
        ) : variant === 'detail' ? (
          <DetailSkeleton />
        ) : (
          <CardsSkeleton />
        )}
      </main>
    </>
  )
}
