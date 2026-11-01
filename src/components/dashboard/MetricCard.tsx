import type { LucideIcon } from 'lucide-react'

type MetricAccent = 'mint' | 'violet' | 'cyan' | 'amber'

type MetricCardProps = {
  label: string
  value: string
  change?: string
  changeTone?: 'positive' | 'warning'
  note: string
  accent: MetricAccent
  icon: LucideIcon
  sparkline: number[]
}

const accentStyles: Record<MetricAccent, { icon: string; spark: string; edge: string }> = {
  mint: { icon: 'lime-icon', spark: 'lime-spark', edge: 'lime-accent' },
  violet: { icon: 'purple-icon', spark: 'purple-spark', edge: 'purple-accent' },
  cyan: { icon: 'blue-icon', spark: 'blue-spark', edge: 'blue-accent' },
  amber: { icon: 'peach-icon', spark: 'peach-spark', edge: 'peach-accent' },
}

export default function MetricCard({
  label,
  value,
  change,
  changeTone = 'positive',
  note,
  accent,
  icon: Icon,
  sparkline,
}: MetricCardProps) {
  const styles = accentStyles[accent]

  return (
    <article className="card metric-card" data-accent={accent} aria-label={`${label}: ${value}`}>
      <div className="metric-top">
        <span>{label}</span>
        <span className={`metric-icon ${styles.icon}`}><Icon size={15} /></span>
      </div>
      <div className="metric-value">
        {value}
        {change && (
          <span className={`trend ${changeTone === 'warning' ? 'down' : 'up'}`}>
            {changeTone === 'warning' ? null : <span aria-hidden="true">↗</span>}
            {change}
          </span>
        )}
      </div>
      <div className="metric-bottom">
        <span>{note}</span>
        <span className={`sparkline ${styles.spark}`} aria-hidden="true">
          {sparkline.map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}
        </span>
      </div>
      <div className={`metric-accent ${styles.edge}`} />
    </article>
  )
}
