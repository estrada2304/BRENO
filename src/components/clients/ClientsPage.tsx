import { useMemo, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { MoreHorizontal, Plus, Search, Users, X } from 'lucide-react'
import { serviceLabels, type Client, type ClientStatus, type ServiceInterest } from '../../types'
import { useWorkspace } from '../../lib/workspace'

type StatusFilter = 'todos' | ClientStatus

const statusLabels: Record<ClientStatus, string> = {
  prospecto: 'Prospecto',
  activo: 'Activo',
  cerrado: 'Cerrado',
}

const statusAccent: Record<ClientStatus, string> = {
  prospecto: 'prospect-status',
  activo: 'good',
  cerrado: 'closed-status',
}

const avatarAccent: Record<Client['accent'], string> = {
  mint: 'lime',
  violet: 'lilac',
  cyan: 'blue',
  amber: 'peach',
  magenta: 'pink',
}

const filters: { id: StatusFilter; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'prospecto', label: 'Prospectos' },
  { id: 'activo', label: 'Activos' },
  { id: 'cerrado', label: 'Cerrados' },
]

const formatEuro = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

function ClientStatusBadge({ status }: { status: ClientStatus }) {
  return <span className={`status ${statusAccent[status]}`}><i />{statusLabels[status]}</span>
}

type ClientFormProps = {
  onClose: () => void
  onCreate: (client: Client) => void
}

function ClientForm({ onClose, onCreate }: ClientFormProps) {
  const [companyName, setCompanyName] = useState('')
  const [contactName, setContactName] = useState('')
  const [email, setEmail] = useState('')
  const [service, setService] = useState<ServiceInterest>('pagina-web')
  const [estimatedValue, setEstimatedValue] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const cleanName = companyName.trim()
    const cleanContact = contactName.trim()
    if (!cleanName || !cleanContact || !email.trim()) return

    onCreate({
      id: `client-${Date.now()}`,
      companyName: cleanName,
      contactName: cleanContact,
      email: email.trim(),
      status: 'prospecto',
      servicesOfInterest: [service],
      estimatedValue: Number(estimatedValue) || 0,
      currency: 'EUR',
      source: 'Añadido desde BRENO',
      createdAt: new Date().toISOString(),
      initials: cleanName.slice(0, 1).toLocaleUpperCase('es-ES'),
      accent: 'cyan',
    })
    onClose()
  }

  return (
    <motion.div className="client-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <motion.section
        className="card client-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="client-modal-title"
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8, scale: 0.98 }}
        transition={{ duration: 0.18 }}
      >
        <div className="client-modal-head">
          <div><div className="section-kicker"><span className="section-dot" /> NUEVO REGISTRO</div><h2 id="client-modal-title">Añadir cliente</h2></div>
          <button type="button" className="icon-button" aria-label="Cerrar formulario" onClick={onClose}><X size={16} /></button>
        </div>
        <form className="client-form" onSubmit={handleSubmit}>
          <label>Empresa<input autoFocus required value={companyName} onChange={(event) => setCompanyName(event.target.value)} placeholder="Nombre de la empresa" /></label>
          <label>Persona de contacto<input required value={contactName} onChange={(event) => setContactName(event.target.value)} placeholder="Nombre y apellido" /></label>
          <label>Correo electrónico<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nombre@empresa.com" /></label>
          <div className="client-form-row">
            <label>Servicio de interés<select value={service} onChange={(event) => setService(event.target.value as ServiceInterest)}>{Object.entries(serviceLabels).map(([id, label]) => <option value={id} key={id}>{label}</option>)}</select></label>
            <label>Valor estimado (€)<input min="0" step="100" type="number" value={estimatedValue} onChange={(event) => setEstimatedValue(event.target.value)} placeholder="0" /></label>
          </div>
          <div className="client-form-actions"><button type="button" className="gantt-today" onClick={onClose}>Cancelar</button><button type="submit" className="button-primary"><Plus size={14} /> Guardar prospecto</button></div>
        </form>
      </motion.section>
    </motion.div>
  )
}

export default function ClientsPage() {
  const { clients, updateWorkspace } = useWorkspace()
  const [filter, setFilter] = useState<StatusFilter>('todos')
  const [search, setSearch] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const visibleClients = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('es-ES')
    return clients.filter((client) => {
      const matchesStatus = filter === 'todos' || client.status === filter
      const searchable = [
        client.companyName,
        client.contactName,
        client.email,
        ...client.servicesOfInterest.map((service) => serviceLabels[service]),
      ].join(' ').toLocaleLowerCase('es-ES')
      return matchesStatus && (!query || searchable.includes(query))
    })
  }, [clients, filter, search])

  const totalValue = clients
    .filter((client) => client.status !== 'cerrado')
    .reduce((total, client) => total + client.estimatedValue, 0)

  function countFor(status: StatusFilter) {
    return status === 'todos' ? clients.length : clients.filter((client) => client.status === status).length
  }

  return (
    <div className="page-content inner-page">
      <div className="welcome-row">
        <div>
          <div className="eyebrow"><span className="eyebrow-line" /> RELACIONES</div>
          <h1>Clientes <span className="title-count">{String(clients.length).padStart(2, '0')}</span></h1>
          <p className="page-intro">Cada gran proyecto empieza con una buena conversación.</p>
        </div>
        <button type="button" className="button-primary" onClick={() => setIsCreating(true)}><Plus size={16} /> Añadir cliente</button>
      </div>

      <div className="client-stats">
        <section className="card"><span>Clientes activos</span><b>{String(countFor('activo')).padStart(2, '0')}</b><small>Relaciones en curso</small></section>
        <section className="card"><span>Prospectos</span><b>{String(countFor('prospecto')).padStart(2, '0')}</b><small>Oportunidades abiertas</small></section>
        <section className="card"><span>Valor del pipeline</span><b>{formatEuro.format(totalValue)}</b><small>Clientes activos y prospectos</small></section>
        <section className="card"><span>Registros cerrados</span><b>{String(countFor('cerrado')).padStart(2, '0')}</b><small>Historial de clientes</small></section>
      </div>

      <section className="card directory-card client-directory" aria-labelledby="client-directory-title">
        <div className="directory-title-row"><div><div className="section-kicker"><span className="section-dot" /> DIRECTORIO</div><h2 id="client-directory-title">Tu cartera de clientes</h2></div><span className="client-total-led"><i /> {clients.length} registros</span></div>
        <div className="directory-toolbar">
          <div className="filter-pills" role="group" aria-label="Filtrar clientes por estado">
            {filters.map(({ id, label }) => <button type="button" key={id} aria-pressed={filter === id} onClick={() => setFilter(id)} className={filter === id ? 'selected' : ''}>{label}<span>{countFor(id)}</span></button>)}
          </div>
          <label className="table-search"><Search size={15} /><input aria-label="Buscar clientes" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por empresa, contacto o servicio..." /><kbd>⌘ F</kbd></label>
        </div>

        <div className="directory-scroll">
          <div className="directory-head client-directory-head"><span>CLIENTE</span><span>SERVICIOS DE INTERÉS</span><span>ESTADO</span><span>VALOR ESTIMADO</span><span>FECHA DE ALTA</span><span /></div>
          {visibleClients.length ? visibleClients.map((client) => (
            <article className="client-row" key={client.id}>
              <div className="client-person">
                <span className={`avatar ${avatarAccent[client.accent]}`}>{client.initials}</span>
                <span><b>{client.companyName}</b><small>{client.contactName}</small></span>
              </div>
              <div className="client-service-tags">{client.servicesOfInterest.map((service) => <span className="client-service-tag" key={service}>{serviceLabels[service]}</span>)}</div>
              <ClientStatusBadge status={client.status} />
              <span className="client-amount">{formatEuro.format(client.estimatedValue)}</span>
              <time className="client-date" dateTime={client.createdAt}>{new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Europe/Madrid' }).format(new Date(client.createdAt))}</time>
              <button type="button" className="icon-button" aria-label={`Cambiar estado de ${client.companyName}`} title="Cambiar estado prospecto / activo / cerrado" onClick={() => updateWorkspace((current) => ({ ...current, clients: current.clients.map((item) => item.id === client.id ? { ...item, status: item.status === 'prospecto' ? 'activo' : item.status === 'activo' ? 'cerrado' : 'prospecto' } : item) }))}><MoreHorizontal size={17} /></button>
            </article>
          )) : (
            <div className="client-empty-state"><span className="empty-icon"><Users size={18} /></span><b>No encontramos clientes</b><small>Prueba otra búsqueda o cambia el filtro de estado.</small><button type="button" onClick={() => { setSearch(''); setFilter('todos') }}>Limpiar filtros</button></div>
          )}
        </div>
        <div className="directory-footer">Mostrando <b>{visibleClients.length}</b> de <b>{clients.length}</b> clientes<span className="client-directory-footnote">Los cambios se sincronizan con tu espacio de trabajo.</span></div>
      </section>

      <AnimatePresence>{isCreating && <ClientForm onClose={() => setIsCreating(false)} onCreate={(client) => updateWorkspace((current) => ({ ...current, clients: [client, ...current.clients] }))} />}</AnimatePresence>
    </div>
  )
}
