import { useMemo } from 'react'
import { ArrowRight, BriefcaseBusiness, Clock3, CreditCard, Users } from 'lucide-react'
import type { AppPage } from '../layout/layout.types'
import { useWorkspace } from '../../lib/workspace'
import ActivityFeed from './ActivityFeed'
import MetricCard from './MetricCard'
import './dashboard-glass.css'

type DashboardProps = {
  setPage: (page: AppPage) => void
  onAgent: () => void
}

const euro = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
const statusLabels: Record<string, string> = { 'en-curso': 'En curso', terminado: 'Terminado', pausado: 'Pausado' }
const projectAccents = ['lime', 'lilac', 'peach', 'blue', 'pink']

function formatMeetingTime(value: string) {
  return new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid' }).format(new Date(value))
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', timeZone: 'Europe/Madrid' })
    .format(new Date(value)).replace('.', '')
}

function meetingAccent(type: string) {
  if (type === 'discovery') return 'peach'
  if (type === 'seguimiento') return 'lime'
  if (type === 'interno') return 'blue'
  return 'lilac'
}

export default function Dashboard({ setPage, onAgent }: DashboardProps) {
  const { clients, projects, meetings, earnings, activity } = useWorkspace()
  const now = new Date()
  const activeProjects = projects.filter((project) => project.status === 'en-curso')
  const currentMonthEarnings = earnings
    .filter((earning) => earning.status === 'pagado' && earning.paidAt && new Date(earning.paidAt).getMonth() === now.getMonth() && new Date(earning.paidAt).getFullYear() === now.getFullYear())
    .reduce((total, earning) => total + earning.amount, 0)
  const outstanding = earnings
    .filter((earning) => earning.status === 'pendiente' || earning.status === 'vencido')
    .reduce((total, earning) => total + earning.amount, 0)
  const activeClients = clients.filter((client) => client.status === 'activo').length
  const prospects = clients.filter((client) => client.status === 'prospecto').length
  const todaysMeetings = useMemo(() => meetings
    .filter((meeting) => new Date(meeting.startsAt).toDateString() === now.toDateString())
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt)), [meetings, now.toDateString()])

  const dateLabel = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Europe/Madrid',
  }).format(now).toLocaleUpperCase('es-ES')

  return (
    <div className="page-content dashboard-page">
      <div className="welcome-row">
        <div>
          <div className="eyebrow"><span className="eyebrow-line" /> {dateLabel}</div>
          <h1>Buenos días, Breno <span className="wave">✳</span></h1>
          <p className="page-intro">Aquí tienes lo que pasa en tu estudio hoy.</p>
        </div>
        <button type="button" className="button-primary" onClick={() => setPage(clients.length ? 'Proyectos' : 'Clientes')}>
          <span aria-hidden="true">＋</span> {clients.length ? 'Nuevo proyecto' : 'Añadir primer cliente'}
        </button>
      </div>

      <div className="metrics-grid">
        <MetricCard
          label="Ingresos del mes"
          value={euro.format(currentMonthEarnings)}
          note={earnings.length ? 'Cobros confirmados este mes' : 'Aún no hay ingresos registrados'}
          accent="mint"
          icon={CreditCard}
          sparkline={Array(12).fill(0)}
        />
        <MetricCard
          label="Proyectos activos"
          value={String(activeProjects.length).padStart(2, '0')}
          note={activeProjects.length ? `${activeProjects.filter((project) => project.progress < 70).length} en fase de desarrollo` : 'Añade proyectos para ver su avance'}
          accent="violet"
          icon={BriefcaseBusiness}
          sparkline={Array(12).fill(0)}
        />
        <MetricCard
          label="Clientes activos"
          value={String(activeClients).padStart(2, '0')}
          note={clients.length ? `${prospects} prospectos por convertir` : 'Aún no has añadido clientes'}
          accent="cyan"
          icon={Users}
          sparkline={Array(12).fill(0)}
        />
        <MetricCard
          label="Por cobrar"
          value={euro.format(outstanding)}
              change={`${earnings.filter((earning) => earning.status !== 'pagado').length} facturas`}
          changeTone="warning"
          note={earnings.filter((earning) => earning.status !== 'pagado').sort((a, b) => Date.parse(a.dueAt) - Date.parse(b.dueAt))[0] ? `Próximo vencimiento · ${formatDate(earnings.filter((earning) => earning.status !== 'pagado').sort((a, b) => Date.parse(a.dueAt) - Date.parse(b.dueAt))[0].dueAt)}` : 'Sin cobros pendientes'}
          accent="amber"
          icon={Clock3}
          sparkline={Array(12).fill(0)}
        />
      </div>

      <div className="main-grid">
        <div className="main-column">
          <section className="card projects-card" aria-labelledby="active-projects-title">
            <div className="card-heading">
              <div>
                <div className="section-kicker"><span className="section-dot" /> EN MOVIMIENTO</div>
                <h2 id="active-projects-title">Proyectos activos</h2>
              </div>
              <button type="button" className="text-action" onClick={() => setPage('Proyectos')}>Ver todos <ArrowRight size={14} /></button>
            </div>
            <div className="project-table">
              <div className="table-head"><span>PROYECTO</span><span>PROGRESO</span><span>FECHA DE ENTREGA</span><span>ESTADO</span></div>
              {projects.slice(0, 3).map((project, index) => {
                const client = clients.find((item) => item.id === project.clientId)
                const accent = projectAccents[index]
                return (
                  <div className="project-row" key={project.id}>
                    <div className="project-name">
                      <span className={`project-symbol ${accent}`}><BriefcaseBusiness size={14} /></span>
                      <span><b>{project.name}</b><small>{client?.companyName}</small></span>
                    </div>
                    <div className="progress-cell">
                      <div className="progress-label"><span>{project.progress}%</span><small>completado</small></div>
                      <div className="progress-track"><i className={accent} style={{ width: `${project.progress}%` }} /></div>
                    </div>
                    <span className="due-date">{formatDate(project.endDate)}</span>
                    <span className={`status ${project.status === 'terminado' ? 'good' : 'progress-status'}`}><i />{statusLabels[project.status]}</span>
                  </div>
                )
              })}
              {!projects.length && <div className="client-empty-state"><span className="empty-icon"><BriefcaseBusiness size={18} /></span><b>Tu primer proyecto empieza con un cliente</b><small>Registra tu cartera y crea el proyecto desde su ficha.</small><button type="button" onClick={() => setPage('Clientes')}>Ir a clientes</button></div>}
            </div>
          </section>
          <ActivityFeed items={activity} referenceTime={now.toISOString()} />
        </div>

        <div className="right-column">
          <section className="card calendar-card" aria-labelledby="today-agenda-title">
            <div className="card-heading compact-heading">
              <div>
                <div className="section-kicker"><span className="section-dot peach-dot" /> TU AGENDA</div>
                <h2 id="today-agenda-title">{new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'short' }).format(now)}</h2>
              </div>
              <button type="button" className="icon-button" aria-label="Abrir calendario" onClick={() => setPage('Calendario')}><ArrowRight size={15} /></button>
            </div>
            <div className="appointment-list">
              {todaysMeetings.map((meeting) => {
                const meetingLabels = { discovery: 'Discovery call', seguimiento: 'Seguimiento', presentacion: 'Presentación', interno: 'Reunión interna' }
                const durationMinutes = Math.round((Date.parse(meeting.endsAt) - Date.parse(meeting.startsAt)) / 60_000)
                const duration = durationMinutes === 60 ? '1 h' : `${durationMinutes} min`
                return (
                  <div className="appointment" key={meeting.id}>
                    <div className="appointment-time">{formatMeetingTime(meeting.startsAt)}</div>
                    <div className={`appointment-marker ${meetingAccent(meeting.type)}`} />
                    <div className="appointment-info">
                      <b>{meeting.title}</b>
                      <small>{meetingLabels[meeting.type]} · {duration}</small>
                    </div>
                    <button type="button" className="icon-button appointment-more" aria-label={`Opciones: ${meeting.title}`}><span aria-hidden="true">···</span></button>
                  </div>
                )
              })}
              {!todaysMeetings.length && <div className="dashboard-agenda-empty">No tienes reuniones para hoy.</div>}
            </div>
            <button type="button" className="calendar-link" onClick={() => setPage('Calendario')}>Ver calendario completo <ArrowRight size={14} /></button>
          </section>

          <section className="card agent-card" aria-label="Acceso al agente BRENO">
            <div className="agent-orbit"><div className="orbit-ring ring-one" /><div className="orbit-ring ring-two" /><div className="orbit-core"><span aria-hidden="true">✳</span></div><span className="orbit-dot one" /><span className="orbit-dot two" /><span className="orbit-dot three" /></div>
            <div className="agent-card-copy">
              <span className="agent-chip"><span className="live-indicator" /> AGENTE BRENO · DEMO</span>
              <h3>Un impulso<br />para tu próximo <em>sí.</em></h3>
              <p>Encuentra clientes que necesitan exactamente lo que haces.</p>
              <button type="button" onClick={onAgent}>Encontrar oportunidades <ArrowRight size={14} /></button>
            </div>
          </section>
        </div>
      </div>

      <div className="footer-note"><span>BRENO STUDIO OS</span><span>Diseñado para construir cosas que importan. <span className="footer-star">✳</span></span><span>V. 1.0.4 · OCT 2026</span></div>
    </div>
  )
}

