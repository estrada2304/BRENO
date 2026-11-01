export type ClientStatus = 'prospecto' | 'activo' | 'cerrado'

export type ServiceInterest =
  | 'pagina-web'
  | 'sistema-inventario'
  | 'crm'
  | 'erp'
  | 'tienda-online'

export type ProjectStatus = 'en-curso' | 'terminado' | 'pausado'
export type PhaseName = 'Diseño' | 'Backend' | 'Frontend' | 'QA'
export type PhaseStatus = 'pendiente' | 'en-curso' | 'terminada'
export type MeetingType = 'discovery' | 'seguimiento' | 'presentacion' | 'interno'
export type PaymentStatus = 'pagado' | 'pendiente' | 'vencido'

/** Datos de contacto y oportunidad comercial de un cliente o prospecto. */
export interface Client {
  id: string
  companyName: string
  contactName: string
  email: string
  phone?: string
  status: ClientStatus
  servicesOfInterest: ServiceInterest[]
  estimatedValue: number
  currency: 'EUR'
  source: string
  notes?: string
  createdAt: string
  initials: string
  accent: 'mint' | 'violet' | 'cyan' | 'amber' | 'magenta'
}

export interface ProjectPhase {
  id: string
  name: PhaseName
  startDate: string
  endDate: string
  progress: number
  status: PhaseStatus
}

/** Proyecto relacionado con un cliente mediante clientId. */
export interface Project {
  id: string
  name: string
  clientId: Client['id']
  summary: string
  status: ProjectStatus
  progress: number
  startDate: string
  endDate: string
  budget: number
  currency: 'EUR'
  phases: ProjectPhase[]
}

/** Reunión de calendario; las fechas ISO conservan su zona horaria. */
export interface Meeting {
  id: string
  title: string
  clientId?: Client['id']
  projectId?: Project['id']
  type: MeetingType
  startsAt: string
  endsAt: string
  videoCallUrl?: string
  notes?: string
}

/** Cargo o factura asociada a un proyecto y a su cliente. */
export interface Earning {
  id: string
  projectId: Project['id']
  clientId: Client['id']
  description: string
  amount: number
  currency: 'EUR'
  status: PaymentStatus
  issuedAt: string
  dueAt: string
  paidAt?: string
  invoiceNumber: string
}

/** Prospecto sugerido o gestionado desde el agente BRENO. */
export interface Lead {
  id: string
  companyName: string
  industry: string
  city: string
  serviceNeed: ServiceInterest
  summary: string
  fitScore: number
  source: string
  status: 'nuevo' | 'revisado' | 'contactado' | 'descartado'
  discoveredAt: string
}

/** Evento breve para el feed de actividad del dashboard. */
export interface ActivityItem {
  id: string
  kind: 'cliente' | 'prospecto' | 'proyecto' | 'reunion' | 'ingreso'
  title: string
  detail: string
  happenedAt: string
  relatedClientId?: Client['id']
  relatedProjectId?: Project['id']
  relatedLeadId?: Lead['id']
}

export const serviceLabels: Record<ServiceInterest, string> = {
  'pagina-web': 'Página web',
  'sistema-inventario': 'Sistema de inventario',
  crm: 'CRM a medida',
  erp: 'ERP',
  'tienda-online': 'Tienda online',
}
