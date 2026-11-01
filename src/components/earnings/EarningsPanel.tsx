import { useMemo, useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDownRight, ArrowUpRight, CalendarDays, Clock3, CreditCard, MoreHorizontal, Plus, WalletCards, X } from 'lucide-react'
import type { Earning, PaymentStatus } from '../../types'
import { useWorkspace } from '../../lib/workspace'
import './earnings-panel.css'

type MonthlyIncome = { key: string; label: string; paid: number; pending: number }

const euro = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
const statusLabels: Record<PaymentStatus, string> = { pagado: 'Pagado', pendiente: 'Pendiente', vencido: 'Vencido' }
const statusColors: Record<PaymentStatus, string> = { pagado: 'green', pendiente: 'amber', vencido: 'red' }

function EarningForm({ projects, clients, onClose, onCreate }: { projects: ReturnType<typeof useWorkspace>['projects']; clients: ReturnType<typeof useWorkspace>['clients']; onClose: () => void; onCreate: (earning: Earning) => void }) {
  const [projectId, setProjectId] = useState(projects[0]?.id ?? '')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [dueAt, setDueAt] = useState('')

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const project = projects.find((item) => item.id === projectId)
    if (!project || !dueAt) return
    onCreate({ id: `earning-${Date.now()}`, projectId, clientId: project.clientId, description: description.trim(), amount: Number(amount) || 0, currency: 'EUR', status: 'pendiente', issuedAt: new Date().toISOString(), dueAt: new Date(`${dueAt}T23:59:00`).toISOString(), invoiceNumber: `BR-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}` })
    onClose()
  }

  return <motion.div className="client-modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <motion.section className="card client-modal" role="dialog" aria-modal="true" aria-labelledby="earning-modal-title" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
      <div className="client-modal-head"><div><div className="section-kicker"><span className="section-dot" /> REGISTRO FINANCIERO</div><h2 id="earning-modal-title">Registrar ingreso</h2></div><button type="button" className="icon-button" aria-label="Cerrar formulario" onClick={onClose}><X size={16} /></button></div>
      <form className="client-form" onSubmit={submit}>
        <label>Proyecto<select required value={projectId} onChange={(event) => setProjectId(event.target.value)}><option value="" disabled>{projects.length ? 'Selecciona un proyecto' : 'Crea primero un proyecto'}</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name} · {clients.find((client) => client.id === project.clientId)?.companyName}</option>)}</select></label>
        <label>Concepto<input autoFocus required maxLength={120} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Hito de desarrollo" /></label>
        <div className="client-form-row"><label>Importe (€)<input required min="0.01" step="0.01" type="number" value={amount} onChange={(event) => setAmount(event.target.value)} /></label><label>Fecha de cobro<input required type="date" value={dueAt} onChange={(event) => setDueAt(event.target.value)} /></label></div>
        <div className="client-form-actions"><button type="button" className="gantt-today" onClick={onClose}>Cancelar</button><button type="submit" className="button-primary" disabled={!projects.length}><Plus size={14} /> Guardar ingreso</button></div>
      </form>
    </motion.section>
  </motion.div>
}

function getMonthlyIncome(earnings: Earning[]): MonthlyIncome[] {
  const now = new Date()
  const months = Array.from({ length: 6 }, (_, index) => {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1)
    return {
      key: `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`,
      label: new Intl.DateTimeFormat('es-ES', { month: 'short' }).format(monthDate).replace('.', '').toUpperCase(),
      paid: 0,
      pending: 0,
    }
  })

  for (const earning of earnings) {
    const cashDate = earning.status === 'pagado' && earning.paidAt ? earning.paidAt : earning.dueAt
    const monthKey = cashDate.slice(0, 7)
    const month = months.find(({ key }) => key === monthKey)
    if (!month) continue
    if (earning.status === 'pagado') month.paid += earning.amount
    else month.pending += earning.amount
  }
  return months
}

function PaymentLed({ status }: { status: PaymentStatus }) {
  return <span className={`earning-payment-status ${statusColors[status]}`}><i aria-hidden="true" />{statusLabels[status]}</span>
}

function MonthlyChart({ data }: { data: MonthlyIncome[] }) {
  const maxValue = Math.max(1, ...data.map(({ paid, pending }) => paid + pending))
  const chartHeight = 150
  const chartWidth = 650
  const barWidth = 42
  const gap = (chartWidth - barWidth * data.length) / (data.length + 1)
  const formatShort = (value: number) => value === 0 ? '' : euro.format(value).replace(',00', '')

  return (
    <div className="earnings-chart-scroll">
      <svg className="earnings-chart-svg" viewBox={`0 0 ${chartWidth} ${chartHeight + 35}`} role="img" aria-label="Ingresos cobrados y pendientes por mes">
        <defs>
          <linearGradient id="income-paid-gradient" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stopColor="#147b79" /><stop offset="58%" stopColor="#37d9bd" /><stop offset="100%" stopColor="#bdfff0" /></linearGradient>
          <linearGradient id="income-pending-gradient" x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stopColor="#8b5e27" /><stop offset="58%" stopColor="#f1b655" /><stop offset="100%" stopColor="#ffe5a4" /></linearGradient>
          <filter id="income-glow" x="-40%" y="-20%" width="180%" height="150%"><feGaussianBlur stdDeviation="3" result="blur" /><feComposite in="SourceGraphic" in2="blur" operator="over" /></filter>
        </defs>
        {[0, 1, 2, 3].map((line) => {
          const y = 12 + line * (chartHeight / 3)
          return <line key={line} x1="0" x2={chartWidth} y1={y} y2={y} className="earnings-chart-gridline" />
        })}
        {data.map((month, index) => {
          const x = gap + index * (barWidth + gap)
          const paidHeight = month.paid / maxValue * (chartHeight - 18)
          const pendingHeight = month.pending / maxValue * (chartHeight - 18)
          const baseY = chartHeight + 10
          return (
            <g key={month.key}>
              {month.pending > 0 && <rect className="income-bar pending" x={x} y={baseY - paidHeight - pendingHeight} width={barWidth} height={pendingHeight} rx="5" fill="url(#income-pending-gradient)" opacity=".88"><title>{month.label}: {formatShort(month.pending)} pendientes</title></rect>}
              {month.paid > 0 && <rect className="income-bar paid" x={x} y={baseY - paidHeight} width={barWidth} height={paidHeight} rx="5" fill="url(#income-paid-gradient)" filter="url(#income-glow)"><title>{month.label}: {formatShort(month.paid)} cobrados</title></rect>}
              {month.paid + month.pending === 0 && <line x1={x} x2={x + barWidth} y1={baseY} y2={baseY} className="earnings-chart-empty-mark" />}
              {(month.paid > 0 || month.pending > 0) && <text x={x + barWidth / 2} y={Math.max(11, baseY - paidHeight - pendingHeight - 8)} className="earnings-chart-value">{formatShort(month.paid + month.pending)}</text>}
              <text x={x + barWidth / 2} y={chartHeight + 31} className="earnings-chart-label">{month.label}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function EarningRow({ earning, projects, clients, onToggleStatus }: { earning: Earning; projects: ReturnType<typeof useWorkspace>['projects']; clients: ReturnType<typeof useWorkspace>['clients']; onToggleStatus: () => void }) {
  const project = projects.find(({ id }) => id === earning.projectId)
  const client = clients.find(({ id }) => id === earning.clientId)
  const date = earning.status === 'pagado' && earning.paidAt ? earning.paidAt : earning.dueAt
  return (
    <div className="earning-row">
      <div className="earning-project-cell"><span className="earning-project-icon"><CreditCard size={14} /></span><span><b>{project?.name ?? 'Proyecto'}</b><small>{earning.invoiceNumber} · {earning.description}</small></span></div>
      <span className="earning-client-cell">{client?.companyName ?? '—'}</span>
      <b className="earning-amount-cell">{euro.format(earning.amount)}</b>
      <span className="earning-date-cell">{new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date))}</span>
      <PaymentLed status={earning.status} />
      <button type="button" className="icon-button earning-more" aria-label={`Cambiar estado de ${earning.invoiceNumber}`} title="Marcar como pagado o pendiente" onClick={onToggleStatus}><MoreHorizontal size={16} /></button>
    </div>
  )
}

export default function EarningsPanel() {
  const { earnings, projects, clients, updateWorkspace } = useWorkspace()
  const [isCreating, setIsCreating] = useState(false)
  const totals = useMemo(() => earnings.reduce((acc, earning) => {
    acc[earning.status] += earning.amount
    acc[`${earning.status}Count`] += 1
    return acc
  }, { pagado: 0, pendiente: 0, vencido: 0, pagadoCount: 0, pendienteCount: 0, vencidoCount: 0 }), [earnings])
  const chartData = useMemo(() => getMonthlyIncome(earnings), [earnings])
  const peak = Math.max(...chartData.map(({ paid, pending }) => paid + pending))
  const peakMonth = chartData.find(({ paid, pending }) => paid + pending === peak)
  const nextDue = earnings.filter(({ status }) => status === 'pendiente').sort((a, b) => Date.parse(a.dueAt) - Date.parse(b.dueAt))[0]

  return (
    <div className="page-content inner-page earnings-panel-page">
      <div className="welcome-row">
        <div><div className="eyebrow"><span className="eyebrow-line" /> SALUD FINANCIERA</div><h1>Ganancias</h1><p className="page-intro">Cobros, facturas y próximos vencimientos del estudio.</p></div>
        <button type="button" className="button-primary" onClick={() => setIsCreating(true)}><span aria-hidden="true">＋</span> Registrar ingreso</button>
      </div>

      <div className="earnings-overview-grid">
        <section className="card earnings-overview-card collected">
          <span className="earnings-overview-icon"><WalletCards size={16} /></span><span className="earnings-overview-label">TOTAL COBRADO</span>
          <b>{euro.format(totals.pagado)}</b><small><ArrowUpRight size={13} /> {totals.pagadoCount} pagos registrados</small>
        </section>
        <section className="card earnings-overview-card awaiting">
          <span className="earnings-overview-icon"><Clock3 size={16} /></span><span className="earnings-overview-label">POR COBRAR</span>
          <b>{euro.format(totals.pendiente)}</b><small>{totals.pendienteCount} facturas pendientes</small>
        </section>
        <section className="card earnings-overview-card overdue">
          <span className="earnings-overview-icon"><CalendarDays size={16} /></span><span className="earnings-overview-label">VENCIDO</span>
          <b>{euro.format(totals.vencido)}</b><small><ArrowDownRight size={13} /> {totals.vencidoCount} requiere seguimiento</small>
        </section>
      </div>

      <section className="card earnings-chart-card">
        <div className="earnings-section-heading"><div><div className="section-kicker"><span className="section-dot" /> FLUJO DE INGRESOS</div><h2>Ingresos por mes</h2><p>Pagos recibidos y cobros previstos por fecha</p></div><span className="earnings-peak-label">{peakMonth?.label ?? '—'} · {euro.format(peak)}</span></div>
        <MonthlyChart data={chartData} />
        <div className="earnings-chart-legend"><span><i className="chart-legend-led paid" />Cobrado</span><span><i className="chart-legend-led pending" />Pendiente</span><span className="earnings-chart-period">Últimos 6 meses</span></div>
      </section>
      <AnimatePresence>{isCreating && <EarningForm projects={projects} clients={clients} onClose={() => setIsCreating(false)} onCreate={(earning) => updateWorkspace((current) => ({ ...current, earnings: [earning, ...current.earnings] }))} />}</AnimatePresence>

      <section className="card earnings-ledger-card">
        <div className="earnings-ledger-heading"><div><div className="section-kicker"><span className="section-dot" /> MOVIMIENTOS</div><h2>Ingresos por proyecto</h2><p>{earnings.length} facturas · {nextDue ? `próximo cobro ${new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short' }).format(new Date(nextDue.dueAt))}` : 'sin vencimientos próximos'}</p></div><button type="button" className="gantt-today">Todas las facturas <ArrowUpRight size={13} /></button></div>
        <div className="earnings-ledger-scroll">
          <div className="earning-table-head"><span>PROYECTO / FACTURA</span><span>CLIENTE</span><span>IMPORTE</span><span>FECHA DE COBRO</span><span>ESTADO</span><span /></div>
          {earnings.map((earning) => <EarningRow earning={earning} projects={projects} clients={clients} key={earning.id} onToggleStatus={() => updateWorkspace((current) => ({ ...current, earnings: current.earnings.map((item) => item.id === earning.id ? item.status === 'pagado' ? { ...item, status: 'pendiente', paidAt: undefined } : { ...item, status: 'pagado', paidAt: new Date().toISOString() } : item) }))} />)}
        </div>
        <div className="earnings-ledger-foot"><span>Mostrando <b>{earnings.length}</b> de <b>{earnings.length}</b> movimientos</span><span className="earnings-ledger-total">Total facturado <b>{euro.format(earnings.reduce((sum, earning) => sum + earning.amount, 0))}</b></span></div>
      </section>
    </div>
  )
}
