import { ArrowUpRight, BriefcaseBusiness, CreditCard, UserRoundPlus, Video } from 'lucide-react'
import type { ActivityItem } from '../../types'

type ActivityFeedProps = {
  items: ActivityItem[]
  referenceTime: string
}

const activityAppearance = {
  cliente: { icon: UserRoundPlus, color: 'peach' },
  prospecto: { icon: ArrowUpRight, color: 'peach' },
  proyecto: { icon: BriefcaseBusiness, color: 'lime' },
  reunion: { icon: Video, color: 'lilac' },
  ingreso: { icon: CreditCard, color: 'blue' },
} as const

function relativeTime(timestamp: string, referenceTime: string) {
  const elapsedMinutes = Math.max(0, Math.round((Date.parse(referenceTime) - Date.parse(timestamp)) / 60_000))
  if (elapsedMinutes < 60) return `Hace ${elapsedMinutes} min`
  const elapsedHours = Math.floor(elapsedMinutes / 60)
  if (elapsedHours < 24) return `Hace ${elapsedHours} h`
  const elapsedDays = Math.floor(elapsedHours / 24)
  return elapsedDays === 1 ? 'Ayer' : `Hace ${elapsedDays} días`
}

export default function ActivityFeed({ items, referenceTime }: ActivityFeedProps) {
  return (
    <section className="card activity-card" aria-labelledby="activity-feed-title">
      <div className="card-heading">
        <div>
          <div className="section-kicker"><span className="section-dot purple-dot" /> EN TIEMPO REAL</div>
          <h2 id="activity-feed-title">Actividad reciente</h2>
        </div>
        <button type="button" className="icon-button" aria-label="Más opciones de actividad">
          <span aria-hidden="true">···</span>
        </button>
      </div>

      <div className="activity-list" aria-live="polite">
        {items.map((item) => {
          const appearance = activityAppearance[item.kind]
          const Icon = appearance.icon
          return (
            <article className="activity-item" key={item.id}>
              <span className={`activity-icon ${appearance.color}`}><Icon size={14} /></span>
              <span className="activity-text">
                <b>{item.title}</b>
                <small>{item.detail}</small>
              </span>
              <time className="activity-time" dateTime={item.happenedAt}>
                {relativeTime(item.happenedAt, referenceTime)}
              </time>
              <span className={`activity-state-led ${appearance.color}`} aria-label="Actividad registrada" />
            </article>
          )
        })}
      </div>
    </section>
  )
}
