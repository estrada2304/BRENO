import { useMemo, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Gantt, ViewMode, type Task } from 'gantt-task-react'
import 'gantt-task-react/dist/index.css'
import './project-gantt.css'
import { BriefcaseBusiness, ChevronDown, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
import type { PhaseName, Project, ProjectStatus } from '../../types'
import { useWorkspace } from '../../lib/workspace'

type ProjectFilter = 'todos' | ProjectStatus

const phasePalette: Record<PhaseName, { led: string; track: string; fill: string; selected: string }> = {
  Diseño: { led: 'cyan', track: '#123D4A', fill: '#69D8FF', selected: '#9DEEFF' },
  Backend: { led: 'violet', track: '#282346', fill: '#A9C9FF', selected: '#D2E1FF' },
  Frontend: { led: 'magenta', track: '#43243D', fill: '#F1A7D7', selected: '#FFD2ED' },
  QA: { led: 'green', track: '#183A37', fill: '#75FFD3', selected: '#BCFFEB' },
}

const filterOptions: { value: ProjectFilter; label: string }[] = [
  { value: 'todos', label: 'Todos los proyectos' },
  { value: 'en-curso', label: 'En curso' },
  { value: 'terminado', label: 'Finalizados' },
  { value: 'pausado', label: 'Pausados' },
]

const projectStatusLabels: Record<ProjectStatus, string> = {
  'en-curso': 'En curso',
  terminado: 'Finalizado',
  pausado: 'Pausado',
}

const euro = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })

function ProjectForm({ clients, onClose, onCreate }: { clients: ReturnType<typeof useWorkspace>['clients']; onClose: () => void; onCreate: (project: Project) => void }) {
  const [name, setName] = useState('')
  const [clientId, setClientId] = useState(clients[0]?.id ?? '')
  const [summary, setSummary] = useState('')
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10))
  const [endDate, setEndDate] = useState('')
  const [budget, setBudget] = useState('')

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!clientId || !endDate || endDate < startDate) return
    const start = new Date(`${startDate}T12:00:00`).getTime()
    const end = new Date(`${endDate}T18:00:00`).getTime()
    const phaseNames: PhaseName[] = ['Diseño', 'Backend', 'Frontend', 'QA']
    const phases = phaseNames.map((phase, index) => {
      const from = new Date(start + (end - start) * index / 4)
      const to = new Date(start + (end - start) * (index + 1) / 4)
      return { id: `${Date.now()}-${index}`, name: phase, startDate: from.toISOString(), endDate: to.toISOString(), progress: 0, status: 'pendiente' as const }
    })
    onCreate({ id: `project-${Date.now()}`, name: name.trim(), clientId, summary: summary.trim(), status: 'en-curso', progress: 0, startDate: new Date(`${startDate}T12:00:00`).toISOString(), endDate: new Date(`${endDate}T18:00:00`).toISOString(), budget: Number(budget) || 0, currency: 'EUR', phases })
    onClose()
  }

  return <motion.div className="client-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <motion.section className="card client-modal" role="dialog" aria-modal="true" aria-labelledby="project-modal-title" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
      <div className="client-modal-head"><div><div className="section-kicker"><span className="section-dot" /> NUEVO PROYECTO</div><h2 id="project-modal-title">Añadir proyecto</h2></div><button type="button" className="icon-button" aria-label="Cerrar formulario" onClick={onClose}><X size={16} /></button></div>
      <form className="client-form" onSubmit={submit}>
        <label>Nombre del proyecto<input autoFocus required maxLength={90} value={name} onChange={(event) => setName(event.target.value)} placeholder="Nombre del proyecto" /></label>
        <label>Cliente<select required value={clientId} onChange={(event) => setClientId(event.target.value)}><option value="" disabled>{clients.length ? 'Selecciona un cliente' : 'Crea primero un cliente'}</option>{clients.map((client) => <option value={client.id} key={client.id}>{client.companyName}</option>)}</select></label>
        <label>Resumen<input value={summary} onChange={(event) => setSummary(event.target.value)} placeholder="Alcance breve" /></label>
        <div className="client-form-row"><label>Inicio<input required type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label><label>Entrega<input required type="date" min={startDate} value={endDate} onChange={(event) => setEndDate(event.target.value)} /></label></div>
        <label>Presupuesto (€)<input min="0" step="100" type="number" value={budget} onChange={(event) => setBudget(event.target.value)} placeholder="0" /></label>
        <div className="client-form-actions"><button type="button" className="gantt-today" onClick={onClose}>Cancelar</button><button type="submit" className="button-primary" disabled={!clients.length}><Plus size={14} /> Guardar proyecto</button></div>
      </form>
    </motion.section>
  </motion.div>
}

function toGanttTasks(projects: Project[]): Task[] {
  return projects.flatMap((project) => {
    const parent: Task = {
      id: project.id,
      name: project.name,
      type: 'project',
      start: new Date(project.startDate),
      end: new Date(project.endDate),
      progress: project.progress,
      isDisabled: true,
      styles: {
        backgroundColor: '#153543',
        backgroundSelectedColor: '#1B5262',
        progressColor: '#43CDBB',
        progressSelectedColor: '#85F5DF',
      },
    }

    const phases = project.phases.map((phase, index): Task => {
      const palette = phasePalette[phase.name]
      const previousPhase = project.phases[index - 1]
      return {
        id: phase.id,
        name: phase.name,
        type: 'task',
        start: new Date(phase.startDate),
        end: new Date(phase.endDate),
        progress: phase.progress,
        project: project.id,
        dependencies: previousPhase ? [previousPhase.id] : undefined,
        isDisabled: true,
        styles: {
          backgroundColor: palette.track,
          backgroundSelectedColor: palette.track,
          progressColor: palette.fill,
          progressSelectedColor: palette.selected,
        },
      }
    })

    return [parent, ...phases]
  })
}

export default function ProjectGantt() {
  const { projects: allProjects, clients, updateWorkspace } = useWorkspace()
  const [filter, setFilter] = useState<ProjectFilter>('todos')
  const [isCreating, setIsCreating] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Week)
  const [anchorDate, setAnchorDate] = useState(new Date('2026-11-01T12:00:00+01:00'))

  const visibleProjects = useMemo(
    () => filter === 'todos' ? allProjects : allProjects.filter((project) => project.status === filter),
    [allProjects, filter],
  )
  const tasks = useMemo(() => toGanttTasks(visibleProjects), [visibleProjects])
  const activeProjects = allProjects.filter((project) => project.status === 'en-curso')
  const countProjects = (status: ProjectFilter) => status === 'todos' ? allProjects.length : allProjects.filter((project) => project.status === status).length
  const averageProgress = activeProjects.length
    ? Math.round(activeProjects.reduce((sum, project) => sum + project.progress, 0) / activeProjects.length)
    : 0
  const nextDelivery = [...activeProjects].sort((a, b) => Date.parse(a.endDate) - Date.parse(b.endDate))[0]
  const dayOffset = viewMode === ViewMode.Month ? 30 : 7

  function moveTimeline(direction: -1 | 1) {
    setAnchorDate((date) => {
      const next = new Date(date)
      next.setDate(next.getDate() + direction * dayOffset)
      return next
    })
  }

  const timelineLabel = new Intl.DateTimeFormat('es-ES', {
    month: 'long', year: 'numeric', timeZone: 'Europe/Madrid',
  }).format(anchorDate)

  return (
    <div className="page-content inner-page project-gantt-page">
      <div className="welcome-row">
        <div>
          <div className="eyebrow"><span className="eyebrow-line" /> PLANIFICACIÓN</div>
          <h1>Proyectos <span className="title-count">{String(allProjects.length).padStart(2, '0')}</span></h1>
          <p className="page-intro">Fases, entregas y ritmo de trabajo en una sola vista.</p>
        </div>
        <button type="button" className="button-primary" onClick={() => setIsCreating(true)}><span aria-hidden="true">＋</span> Nuevo proyecto</button>
      </div>

      <div className="project-summary">
        <section className="card"><span>En curso</span><b>{String(activeProjects.length).padStart(2, '0')}</b><small>Proyectos en ejecución</small></section>
        <section className="card"><span>Finalizados</span><b>{String(countProjects('terminado')).padStart(2, '0')}</b><small>Entregas completadas</small></section>
        <section className="card"><span>Entrega más próxima</span><b>{nextDelivery ? new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', timeZone: 'Europe/Madrid' }).format(new Date(nextDelivery.endDate)) : '—'}</b><small>{nextDelivery?.name ?? 'Sin entregas pendientes'}</small></section>
        <section className="card"><span>Progreso medio</span><b>{averageProgress}%</b><small>En proyectos en curso</small></section>
      </div>

      <section className="card gantt-card project-gantt" aria-label="Diagrama de Gantt de proyectos">
        <div className="gantt-toolbar project-gantt-toolbar">
          <div className="filter-pills" role="group" aria-label="Filtrar proyectos por estado">
            {filterOptions.map(({ value, label }) => (
              <button type="button" key={value} aria-pressed={filter === value} onClick={() => setFilter(value)} className={filter === value ? 'selected' : ''}>
                {label}<span>{countProjects(value)}</span>
              </button>
            ))}
          </div>
          <div className="gantt-controls">
            <button type="button" className="icon-button" aria-label="Período anterior" onClick={() => moveTimeline(-1)}><ChevronLeft size={15} /></button>
            <button type="button" className="gantt-today" onClick={() => setAnchorDate(new Date('2026-11-01T12:00:00+01:00'))}>Hoy</button>
            <button type="button" className="icon-button" aria-label="Período siguiente" onClick={() => moveTimeline(1)}><ChevronRight size={15} /></button>
            <span className="gantt-month-label">{timelineLabel}</span>
            <span className="header-divider" />
            <button type="button" className={`gantt-view ${viewMode === ViewMode.Week ? 'active' : ''}`} onClick={() => setViewMode(ViewMode.Week)}>Semana</button>
            <button type="button" className={`gantt-view ${viewMode === ViewMode.Month ? 'active' : ''}`} onClick={() => setViewMode(ViewMode.Month)}>Mes</button>
            <button type="button" className="icon-button gantt-more" aria-label="Más opciones"><ChevronDown size={14} /></button>
          </div>
        </div>

        {tasks.length ? (
          <div className="project-gantt-scroll">
            <svg className="project-gantt-defs" aria-hidden="true" focusable="false">
              <defs>
                <linearGradient id="phase-track-cyan" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1B5061" /><stop offset="52%" stopColor="#123D4A" /><stop offset="100%" stopColor="#0A2733" /></linearGradient>
                <linearGradient id="phase-fill-cyan" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#44B8D8" /><stop offset="100%" stopColor="#9DEEFF" /></linearGradient>
                <linearGradient id="phase-track-violet" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#494071" /><stop offset="52%" stopColor="#282346" /><stop offset="100%" stopColor="#19162E" /></linearGradient>
                <linearGradient id="phase-fill-violet" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#7770CA" /><stop offset="100%" stopColor="#C7D9FF" /></linearGradient>
                <linearGradient id="phase-track-magenta" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#704061" /><stop offset="52%" stopColor="#43243D" /><stop offset="100%" stopColor="#2B1929" /></linearGradient>
                <linearGradient id="phase-fill-magenta" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#C94D9F" /><stop offset="100%" stopColor="#FFB8E5" /></linearGradient>
                <linearGradient id="phase-track-green" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#32675D" /><stop offset="52%" stopColor="#183A37" /><stop offset="100%" stopColor="#102724" /></linearGradient>
                <linearGradient id="phase-fill-green" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#36B68B" /><stop offset="100%" stopColor="#A3FFE0" /></linearGradient>
                <linearGradient id="project-track-metal" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#347485" /><stop offset="48%" stopColor="#153543" /><stop offset="100%" stopColor="#0B222E" /></linearGradient>
                <linearGradient id="project-fill-metal" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#258C90" /><stop offset="100%" stopColor="#8AFFE1" /></linearGradient>
              </defs>
            </svg>
            <Gantt
              tasks={tasks}
              viewMode={viewMode}
              viewDate={anchorDate}
              locale="es"
              listCellWidth="230px"
              columnWidth={viewMode === ViewMode.Month ? 112 : 64}
              headerHeight={44}
              rowHeight={40}
              barCornerRadius={5}
              barFill={72}
              barBackgroundColor="#123D4A"
              barBackgroundSelectedColor="#1B5262"
              barProgressColor="#69D8FF"
              barProgressSelectedColor="#9DEEFF"
              projectBackgroundColor="#153543"
              projectBackgroundSelectedColor="#1B5262"
              projectProgressColor="#43CDBB"
              projectProgressSelectedColor="#85F5DF"
              todayColor="rgba(105,216,255,.08)"
              fontFamily="DM Sans, sans-serif"
              fontSize="10px"
            />
          </div>
        ) : (
          <div className="project-gantt-empty"><BriefcaseBusiness size={18} /><b>No hay proyectos en este estado</b><small>Selecciona otro filtro para ver el resto de la planificación.</small></div>
        )}

        <div className="gantt-legend project-gantt-legend" aria-label="Leyenda de fases">
          {(Object.entries(phasePalette) as [PhaseName, (typeof phasePalette)[PhaseName]][]).map(([phase, palette]) => (
            <span key={phase}><i className={`phase-led ${palette.led}`} /> {phase}</span>
          ))}
          <span className="gantt-foot-note">{euro.format(visibleProjects.reduce((sum, project) => sum + project.budget, 0))} · valor planificado</span>
        </div>
      </section>

      <div className="project-gantt-client-notes" aria-hidden="true">{clients.length} cuentas vinculadas</div>
      <div className="sr-only">Estados: {Object.values(projectStatusLabels).join(', ')}.</div>
      <AnimatePresence>{isCreating && <ProjectForm clients={clients} onClose={() => setIsCreating(false)} onCreate={(project) => updateWorkspace((current) => ({ ...current, projects: [project, ...current.projects] }))} />}</AnimatePresence>
    </div>
  )
}
