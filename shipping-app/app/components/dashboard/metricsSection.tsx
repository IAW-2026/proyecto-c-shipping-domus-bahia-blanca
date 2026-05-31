import type { LucideIcon } from 'lucide-react'

type Metric = {
  label: string
  value: string
  delta: string
  icon: LucideIcon
  accent: string
}

type MetricsSectionProps = {
  metrics: Metric[]
}

export function MetricsSection({ metrics }: MetricsSectionProps) {
  return (
    <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
      {metrics.map((metric) => (
        <article
          key={metric.label}
          className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft transition-shadow hover:shadow-elev"
        >
          <div className="flex items-center justify-between">
            <span className="text-[12.5px] font-medium text-muted-foreground">
              {metric.label}
            </span>
            <span className={`grid h-9 w-9 place-items-center rounded-lg ${metric.accent}`}>
              <metric.icon className="h-[18px] w-[18px]" />
            </span>
          </div>
          <p className="mt-5 font-display text-[34px] font-medium leading-none text-foreground">
            {metric.value}
          </p>
          <p className="mt-2 text-[12px] text-muted-foreground">{metric.delta}</p>
        </article>
      ))}
    </section>
  )
}
