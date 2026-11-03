import { useMemo, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import './project-gantt.css'
import { BriefcaseBusiness, ChevronLeft, ChevronRight, Pencil, Plus, Trash2, X } from 'lucide-react'
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

function ProjectForm({ clients, onClose, onSave, initial }: { clients: ReturnType<typeof useWorkspace>['clients']; onClose: () => void; onSave: (project: Project) => void; initial?: Project }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [clientId, setClientId] = useState(initial?.clientId ?? clients[0]?.id ?? '')
  const [summary, setSummary] = useState(initial?.summary ?? '')
  const [startDate, setStartDate] = useState(initial ? new Date(initial.startDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10))
  const [endDate, setEndDate] = useState(initial ? new Date(initial.endDate).toISOString().slice(0, 10) : '')
  const [budget, setBudget] = useState(initial ? String(initial.budget) : '')

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!clientId || !endDate || endDate < startDate) return
    const start = new Date(`${startDate}T12:00:00`).getTime()
    const end = new Date(`${endDate}T18:00:00`).getTime()
    const phaseNames: PhaseName[] = ['Diseño', 'Backend', 'Frontend', 'QA']
    const phases = phaseNames.map((phase, index) => {
      const from = new Date(start + (end - start) * index / 4)
      const to = new Date(start + (end - start) * (index + 1) / 4)
      const previous = initial?.phases.find((item) => item.name === phase)
      return { id: previous?.id ?? `${Date.now()}-${index}`, name: phase, startDate: from.toISOString(), endDate: to.toISOString(), progress: previous?.progress ?? 0, status: previous?.status ?? 'pendiente' as const }
    })
    onSave({ id: initial?.id ?? `project-${Date.now()}`, name: name.trim(), clientId, summary: summary.trim(), status: initial?.status ?? 'en-curso', progress: Math.round(phases.reduce((sum, phase) => sum + phase.progress, 0) / phases.length), startDate: new Date(`${startDate}T12:00:00`).toISOString(), endDate: new Date(`${endDate}T18:00:00`).toISOString(), budget: Number(budget) || 0, currency: 'EUR', phases })
    onClose()
  }

  return <motion.div className="client-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <motion.section className="card client-modal" role="dialog" aria-modal="true" aria-labelledby="project-modal-title" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
      <div className="client-modal-head"><div><div className="section-kicker"><span className="section-dot" /> {initial ? 'ACTUALIZAR PLAN' : 'NUEVO PROYECTO'}</div><h2 id="project-modal-title">{initial ? 'Editar proyecto' : 'Añadir proyecto'}</h2></div><button type="button" className="icon-button" aria-label="Cerrar formulario" onClick={onClose}><X size={16} /></button></div>
      <form className="client-form" onSubmit={submit}>
        <label>Nombre del proyecto<input autoFocus required maxLength={90} value={name} onChange={(event) => setName(event.target.value)} placeholder="Nombre del proyecto" /></label>
        <label>Cliente<select required value={clientId} onChange={(event) => setClientId(event.target.value)}><option value="" disabled>{clients.length ? 'Selecciona un cliente' : 'Crea primero un cliente'}</option>{clients.map((client) => <option value={client.id} key={client.id}>{client.companyName}</option>)}</select></label>
        <label>Resumen<input value={summary} onChange={(event) => setSummary(event.target.value)} placeholder="Alcance breve" /></label>
        <div className="client-form-row"><label>Inicio<input required type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label><label>Entrega<input required type="date" min={startDate} value={endDate} onChange={(event) => setEndDate(event.target.value)} /></label></div>
        <label>Presupuesto (€)<input min="0" step="100" type="number" value={budget} onChange={(event) => setBudget(event.target.value)} placeholder="0" /></label>
        <div className="client-form-actions"><button type="button" className="gantt-today" onClick={onClose}>Cancelar</button><button type="submit" className="button-primary" disabled={!clients.length}><Plus size={14} /> {initial ? 'Guardar cambios' : 'Guardar proyecto'}</button></div>
      </form>
    </motion.section>
  </motion.div>
}

export default function ProjectGantt() {
  const { projects: allProjects, clients, updateWorkspace } = useWorkspace()
  const [filter, setFilter] = useState<ProjectFilter>('todos')
  const [isCreating, setIsCreating] = useState(false)
  const [editing, setEditing] = useState<Project | null>(null)
  const [anchorDate, setAnchorDate] = useState(new Date())

  const visibleProjects = useMemo(
    () => filter === 'todos' ? allProjects : allProjects.filter((project) => project.status === filter),
    [allProjects, filter],
  )
  const activeProjects = allProjects.filter((project) => project.status === 'en-curso')
  const countProjects = (status: ProjectFilter) => status === 'todos' ? allProjects.length : allProjects.filter((project) => project.status === status).length
  const averageProgress = activeProjects.length
    ? Math.round(activeProjects.reduce((sum, project) => sum + project.progress, 0) / activeProjects.length)
    : 0
  const nextDelivery = [...activeProjects].sort((a, b) => Date.parse(a.endDate) - Date.parse(b.endDate))[0]
  const dayOffset = 30

  function moveTimeline(direction: -1 | 1) {
    setAnchorDate((date) => {
      const next = new Date(date)
      next.setDate(next.getDate() + direction * dayOffset)
      return next
    })
  }

  const timelineLabel = new Intl.DateTimeFormat('es-ES', {
    month: 'long', year: 'numeric',
  }).format(anchorDate)

  function setPhaseProgress(projectId: string, phaseId: string, progress: number) {
    updateWorkspace((current) => ({
      ...current,
      projects: current.projects.map((project) => {
        if (project.id !== projectId) return project
        const phases = project.phases.map((phase) => phase.id === phaseId
          ? { ...phase, progress, status: progress === 100 ? 'terminada' as const : progress > 0 ? 'en-curso' as const : 'pendiente' as const }
          : phase)
        return { ...project, phases, progress: Math.round(phases.reduce((sum, phase) => sum + phase.progress, 0) / phases.length) }
      }),
    }))
  }

  return (
    <div className="page-content inner-page project-gantt-page">
      <div className="welcome-row">
        <div>
          <div className="eyebrow"><span className="eyebrow-line" /> PLANIFICACIÓN</div>
          <h1>Proyectos <span className="title-count">{String(allProjects.length).padStart(2, '0')}</span></h1>
          <p className="page-intro">Fases, entregas y ritmo de trabajo en una sola vista.</p>
        </div>
        <button type="button" className="button-primary" onClick={() => setIsCreating(true)} disabled={!clients.length} title={!clients.length ? 'Primero añade un cliente' : undefined}><span aria-hidden="true">＋</span> Nuevo proyecto</button>
      </div>

      <div className="project-summary">
        <section className="card"><span>En curso</span><b>{String(activeProjects.length).padStart(2, '0')}</b><small>Proyectos en ejecución</small></section>
        <section className="card"><span>Finalizados</span><b>{String(countProjects('terminado')).padStart(2, '0')}</b><small>Entregas completadas</small></section>
        <section className="card"><span>Entrega más próxima</span><b>{nextDelivery ? new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', timeZone: 'Europe/Madrid' }).format(new Date(nextDelivery.endDate)) : '—'}</b><small>{nextDelivery?.name ?? 'Sin entregas pendientes'}</small></section>
        <section className="card"><span>Progreso medio</span><b>{averageProgress}%</b><small>En proyectos en curso</small></section>
      </div>

      <section className="card gantt-card project-gantt" aria-label="Cronograma de proyectos">
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
            <button type="button" className="gantt-today" onClick={() => setAnchorDate(new Date())}>Hoy</button>
            <button type="button" className="icon-button" aria-label="Período siguiente" onClick={() => moveTimeline(1)}><ChevronRight size={15} /></button>
            <span className="gantt-month-label">{timelineLabel}</span>
            <span className="header-divider" />
            <span className="gantt-view active">Cronograma</span>
          </div>
        </div>

        {visibleProjects.length ? (
          <div className="project-roadmap-list">
            {visibleProjects.map((project) => {
              const client = clients.find((item) => item.id === project.clientId)
              return <article className="project-roadmap-card" key={project.id}>
                <header className="project-roadmap-head"><div className="project-roadmap-title"><span className="project-roadmap-icon"><BriefcaseBusiness size={15} /></span><span><b>{project.name}</b><small>{client?.companyName ?? 'Cliente eliminado'} · {project.summary || 'Sin descripción'}</small></span></div><label className="project-status-control"><span className="sr-only">Estado del proyecto</span><select aria-label={`Estado de ${project.name}`} value={project.status} onChange={(event) => updateWorkspace((current) => ({ ...current, projects: current.projects.map((item) => item.id === project.id ? { ...item, status: event.target.value as ProjectStatus } : item) }))}>{Object.entries(projectStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><button type="button" className="icon-button" aria-label={`Editar ${project.name}`} title="Editar proyecto" onClick={() => setEditing(project)}><Pencil size={14} /></button><button type="button" className="icon-button" aria-label={`Eliminar ${project.name}`} title="Eliminar proyecto" onClick={() => { if (window.confirm(`¿Eliminar el proyecto ${project.name}? También se eliminarán sus ingresos.`)) updateWorkspace((current) => ({ ...current, projects: current.projects.filter((item) => item.id !== project.id), earnings: current.earnings.filter((item) => item.projectId !== project.id), meetings: current.meetings.map((item) => item.projectId === project.id ? { ...item, projectId: undefined } : item) })) }}><Trash2 size={14} /></button></header>
                <div className="project-roadmap-meta"><span>{new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' }).format(new Date(project.startDate))} — {new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(project.endDate))}</span><b>{project.progress}% completado</b><span>{euro.format(project.budget)}</span></div>
                <div className="project-phase-roadmap">{project.phases.map((phase) => { const palette = phasePalette[phase.name]; return <div className="project-phase-control" key={phase.id}><div className="project-phase-heading"><span><i className={`phase-led ${palette.led}`} />{phase.name}</span><b>{phase.progress}%</b></div><div className="phase-progress-track"><i style={{ width: `${phase.progress}%`, background: `linear-gradient(90deg, ${palette.fill}, ${palette.selected})` }} /></div><input aria-label={`Progreso de ${phase.name} en ${project.name}`} type="range" min="0" max="100" value={phase.progress} onChange={(event) => setPhaseProgress(project.id, phase.id, Number(event.target.value))} /></div> })}</div>
              </article>
            })}
          </div>
        ) : (
          <div className="project-gantt-empty"><BriefcaseBusiness size={18} /><b>{allProjects.length ? 'No hay proyectos en este estado' : 'Tu cronograma está listo'}</b><small>{allProjects.length ? 'Selecciona otro filtro para revisar la planificación.' : clients.length ? 'Crea el primer proyecto para planificar sus fases y entregas.' : 'Primero añade un cliente; después podrás crear su proyecto.'}</small>{clients.length > 0 && !allProjects.length && <button type="button" className="button-primary" onClick={() => setIsCreating(true)}>Crear primer proyecto</button>}</div>
        )}

        <div className="gantt-legend project-gantt-legend" aria-label="Leyenda de fases">
          {(Object.entries(phasePalette) as [PhaseName, (typeof phasePalette)[PhaseName]][]).map(([phase, palette]) => (
            <span key={phase}><i className={`phase-led ${palette.led}`} /> {phase}</span>
          ))}
          <span className="gantt-foot-note">{euro.format(visibleProjects.reduce((sum, project) => sum + project.budget, 0))} · valor planificado</span>
        </div>
      </section>

      <div className="sr-only">Estados: {Object.values(projectStatusLabels).join(', ')}.</div>
      <AnimatePresence>{isCreating && <ProjectForm clients={clients} onClose={() => setIsCreating(false)} onSave={(project) => updateWorkspace((current) => ({ ...current, projects: [project, ...current.projects] }))} />}{editing && <ProjectForm clients={clients} initial={editing} onClose={() => setEditing(null)} onSave={(project) => updateWorkspace((current) => ({ ...current, projects: current.projects.map((item) => item.id === project.id ? project : item) }))} />}</AnimatePresence>
    </div>
  )
}

