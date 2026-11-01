import { useMemo, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { addDays, addMonths, addWeeks, format, getDay, parse, startOfWeek } from 'date-fns'
import { es } from 'date-fns/locale/es'
import { Calendar, dateFnsLocalizer, type Event, type View } from 'react-big-calendar'
import { ArrowLeft, ArrowRight, CalendarDays, Clock3, Plus, Video, X } from 'lucide-react'
import type { Meeting, MeetingType } from '../../types'
import { useWorkspace } from '../../lib/workspace'
import './meeting-calendar.css'

type MeetingEvent = Event & { meeting: Meeting; category: MeetingType; clientName: string }

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales: { es },
})

const categoryLabels: Record<MeetingType, string> = {
  discovery: 'Discovery',
  seguimiento: 'Seguimiento',
  presentacion: 'Presentación',
  interno: 'Interno',
}

const categoryColors: Record<MeetingType, string> = {
  discovery: 'amber',
  seguimiento: 'cyan',
  presentacion: 'violet',
  interno: 'green',
}

const eventTypeOrder: MeetingType[] = ['discovery', 'seguimiento', 'presentacion', 'interno']
const viewLabels = { month: 'Mes', week: 'Semana', day: 'Día', agenda: 'Agenda' } as const

function toEvent(meeting: Meeting, clients: ReturnType<typeof useWorkspace>['clients']): MeetingEvent {
  const client = clients.find(({ id }) => id === meeting.clientId)
  return {
    title: meeting.title,
    start: new Date(meeting.startsAt),
    end: new Date(meeting.endsAt),
    meeting,
    category: meeting.type,
    clientName: client?.companyName ?? 'Reunión interna',
  }
}

function EventPill({ event }: { event: MeetingEvent }) {
  return (
    <span className={`meeting-event-pill ${categoryColors[event.category]}`}>
      <span className="meeting-event-led" />
      <span className="meeting-event-time">{format(event.start as Date, 'HH:mm')}</span>
      <span className="meeting-event-title">{event.title}</span>
      {event.meeting.videoCallUrl && <Video className="meeting-event-video" size={11} aria-label="Videollamada" />}
    </span>
  )
}

function DateHeader({ date, label }: { date: Date; label: string }) {
  const today = new Date()
  const isToday = date.toDateString() === today.toDateString()
  return (
    <span className={`meeting-date-header ${isToday ? 'is-today' : ''}`}>
      {isToday && <motion.i className="today-led" aria-label="Hoy" initial={{ scale: 0.7, opacity: 0.5 }} animate={{ scale: [0.92, 1.12, 0.92], opacity: [0.7, 1, 0.7] }} transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }} />}
      {label}
    </span>
  )
}

function MeetingForm({ clients, onClose, onCreate }: { clients: ReturnType<typeof useWorkspace>['clients']; onClose: () => void; onCreate: (meeting: Meeting) => void }) {
  const [title, setTitle] = useState('')
  const [clientId, setClientId] = useState('')
  const [type, setType] = useState<MeetingType>('seguimiento')
  const [startsAt, setStartsAt] = useState('')
  const [videoCallUrl, setVideoCallUrl] = useState('')

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const start = new Date(startsAt)
    if (Number.isNaN(start.getTime())) return
    onCreate({ id: `meeting-${Date.now()}`, title: title.trim(), clientId: clientId || undefined, type, startsAt: start.toISOString(), endsAt: new Date(start.getTime() + 30 * 60_000).toISOString(), videoCallUrl: videoCallUrl.trim() || undefined })
    onClose()
  }

  return <motion.div className="client-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <motion.section className="card client-modal" role="dialog" aria-modal="true" aria-labelledby="meeting-modal-title" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
      <div className="client-modal-head"><div><div className="section-kicker"><span className="section-dot" /> COORDINACIÓN</div><h2 id="meeting-modal-title">Nueva reunión</h2></div><button type="button" className="icon-button" aria-label="Cerrar formulario" onClick={onClose}><X size={16} /></button></div>
      <form className="client-form" onSubmit={submit}>
        <label>Asunto<input autoFocus required maxLength={100} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Revisión de propuesta" /></label>
        <div className="client-form-row"><label>Cliente<select value={clientId} onChange={(event) => setClientId(event.target.value)}><option value="">Sin cliente</option>{clients.map((client) => <option value={client.id} key={client.id}>{client.companyName}</option>)}</select></label><label>Tipo<select value={type} onChange={(event) => setType(event.target.value as MeetingType)}>{Object.entries(categoryLabels).map(([key, label]) => <option value={key} key={key}>{label}</option>)}</select></label></div>
        <label>Fecha y hora<input required type="datetime-local" value={startsAt} onChange={(event) => setStartsAt(event.target.value)} /></label>
        <label>Enlace de videollamada<input type="url" value={videoCallUrl} onChange={(event) => setVideoCallUrl(event.target.value)} placeholder="https://…" /></label>
        <div className="client-form-actions"><button type="button" className="gantt-today" onClick={onClose}>Cancelar</button><button type="submit" className="button-primary"><Plus size={14} /> Guardar reunión</button></div>
      </form>
    </motion.section>
  </motion.div>
}

export default function MeetingCalendar() {
  const { meetings, clients, updateWorkspace } = useWorkspace()
  const [date, setDate] = useState(() => new Date())
  const [view, setView] = useState<View>('month')
  const [selected, setSelected] = useState<MeetingEvent | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const events = useMemo(() => meetings.map((meeting) => toEvent(meeting, clients)), [meetings, clients])
  const today = new Date()
  const title = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(date)

  function navigate(direction: -1 | 0 | 1) {
    if (direction === 0) {
      setDate(new Date())
      return
    }
    setDate((current) => view === 'month'
      ? addMonths(current, direction)
      : view === 'week'
        ? addWeeks(current, direction)
        : addDays(current, direction))
  }

  return (
    <div className="page-content inner-page meeting-calendar-page">
      <div className="welcome-row">
        <div>
          <div className="eyebrow"><span className="eyebrow-line" /> COORDINA LO QUE VIENE</div>
          <h1>Calendario</h1>
          <p className="page-intro">Reuniones de clientes, entregas y próximas conversaciones.</p>
        </div>
        <button type="button" className="button-primary" onClick={() => setIsCreating(true)}><span aria-hidden="true">＋</span> Nueva reunión</button>
      </div>

      <section className="card meeting-calendar-panel" aria-label="Calendario de reuniones">
        <div className="meeting-calendar-toolbar">
          <div className="meeting-calendar-heading">
            <div className="meeting-calendar-icon"><CalendarDays size={16} /></div>
            <div><h2>{title}</h2><small><span className="live-indicator" /> {events.length} reuniones programadas</small></div>
          </div>
          <div className="meeting-calendar-controls">
            <button className="icon-button" type="button" aria-label="Período anterior" onClick={() => navigate(-1)}><ArrowLeft size={15} /></button>
            <button className="gantt-today" type="button" onClick={() => navigate(0)}>Hoy</button>
            <button className="icon-button" type="button" aria-label="Período siguiente" onClick={() => navigate(1)}><ArrowRight size={15} /></button>
            <span className="header-divider" />
            {(['month', 'week', 'day', 'agenda'] as const).map((item) => (
              <button key={item} className={`gantt-view ${view === item ? 'active' : ''}`} type="button" onClick={() => setView(item)}>
                {viewLabels[item]}
              </button>
            ))}
          </div>
        </div>

        <div className="meeting-calendar-stage">
          <Calendar<MeetingEvent>
            localizer={localizer}
            events={events}
            date={date}
            view={view}
            onNavigate={setDate}
            onView={setView}
            onSelectEvent={(event) => setSelected(event)}
            startAccessor="start"
            endAccessor="end"
            titleAccessor="title"
            culture="es"
            popup
            dayLayoutAlgorithm="overlap"
            components={{ event: EventPill, month: { dateHeader: DateHeader } }}
            eventPropGetter={(event) => ({ className: `meeting-event-${categoryColors[event.category]}` })}
            dayPropGetter={(day) => ({ className: day.toDateString() === today.toDateString() ? 'meeting-today-cell' : '' })}
            messages={{
              allDay: 'Todo el día', previous: 'Anterior', next: 'Siguiente', today: 'Hoy', month: 'Mes', week: 'Semana', day: 'Día', agenda: 'Agenda',
              date: 'Fecha', time: 'Hora', event: 'Reunión', noEventsInRange: 'No hay reuniones en este período.', showMore: (count) => `+${count} más`,
            }}
            formats={{ timeGutterFormat: 'HH:mm', eventTimeRangeFormat: ({ start, end }) => `${format(start, 'HH:mm')} – ${format(end, 'HH:mm')}` }}
          />
        </div>

        {selected && (
          <div className="meeting-selected-detail" aria-live="polite">
            <span className={`meeting-detail-led ${categoryColors[selected.category]}`} />
            <div className="meeting-detail-copy">
              <b>{selected.title}</b>
              <small><Clock3 size={12} /> {format(selected.start as Date, "EEEE d 'de' MMMM · HH:mm", { locale: es })} · {selected.clientName}</small>
            </div>
            {selected.meeting.videoCallUrl && <a className="meeting-video-link" href={selected.meeting.videoCallUrl} target="_blank" rel="noreferrer"><Video size={13} /> Abrir videollamada <ArrowRight size={12} /></a>}
          </div>
        )}

        <div className="meeting-calendar-legend" aria-label="Categorías de reunión">
          {eventTypeOrder.map((type) => <span key={type}><i className={`meeting-legend-led ${categoryColors[type]}`} />{categoryLabels[type]}</span>)}
          <span className="meeting-legend-note">Hora local · selecciona una reunión para ver el enlace</span>
        </div>
      </section>
      <AnimatePresence>{isCreating && <MeetingForm clients={clients} onClose={() => setIsCreating(false)} onCreate={(meeting) => updateWorkspace((current) => ({ ...current, meetings: [...current.meetings, meeting] }))} />}</AnimatePresence>
    </div>
  )
}
