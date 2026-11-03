import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { ActivityItem, Client, Earning, Lead, Meeting, Project } from '../types'
import { supabase } from './supabase'

export type WorkspaceData = {
  clients: Client[]
  projects: Project[]
  meetings: Meeting[]
  earnings: Earning[]
  leads: Lead[]
  activity: ActivityItem[]
}

type WorkspaceContextValue = WorkspaceData & {
  ready: boolean
  syncStatus: 'local' | 'saved' | 'saving' | 'error'
  syncError?: string
  updateWorkspace: (update: Partial<WorkspaceData> | ((current: WorkspaceData) => WorkspaceData)) => void
}

const emptyWorkspace: WorkspaceData = {
  clients: [],
  projects: [],
  meetings: [],
  earnings: [],
  leads: [],
  activity: [],
}

const sampleIds = {
  clients: new Set(['client-nebula', 'client-casa-oliva', 'client-atlas', 'client-forma', 'client-marea', 'client-taller-norte']),
  projects: new Set(['project-nebula-portal', 'project-atlas-inventory', 'project-casa-store', 'project-marea-crm', 'project-forma-web']),
  meetings: new Set(['meeting-forma-discovery', 'meeting-nebula-sprint', 'meeting-atlas-demo', 'meeting-nebula-handoff', 'meeting-casa-oliva-propuesta', 'meeting-atlas-inventory-review', 'meeting-forma-design-review', 'meeting-marea-discovery', 'meeting-team-planning']),
  earnings: new Set(['earning-nebula-advance', 'earning-casa-final', 'earning-atlas-milestone', 'earning-forma-discovery', 'earning-marea-discovery']),
  leads: new Set(['lead-lumen-interiorismo', 'lead-solera-distribucion', 'lead-aurea-consultores']),
  activity: new Set(['activity-casa-qa', 'activity-nebula-payment', 'activity-aurea-lead']),
}

function cleanSampleData(value: Partial<WorkspaceData>): WorkspaceData {
  return {
    clients: (value.clients ?? []).filter(({ id }) => !sampleIds.clients.has(id)),
    projects: (value.projects ?? []).filter(({ id }) => !sampleIds.projects.has(id)),
    meetings: (value.meetings ?? []).filter(({ id }) => !sampleIds.meetings.has(id)),
    earnings: (value.earnings ?? []).filter(({ id }) => !sampleIds.earnings.has(id)),
    leads: (value.leads ?? []).filter(({ id }) => !sampleIds.leads.has(id)),
    activity: (value.activity ?? []).filter(({ id }) => !sampleIds.activity.has(id)),
  }
}

function deriveActivity(data: WorkspaceData): ActivityItem[] {
  const entries: ActivityItem[] = [
    ...data.clients.map((client): ActivityItem => ({ id: `activity-${client.id}`, kind: client.status === 'prospecto' ? 'prospecto' : 'cliente', title: client.status === 'prospecto' ? 'Prospecto añadido' : 'Cliente registrado', detail: `${client.companyName} · ${client.contactName}`, happenedAt: client.createdAt, relatedClientId: client.id })),
    ...data.projects.map((project): ActivityItem => ({ id: `activity-${project.id}`, kind: 'proyecto', title: 'Proyecto planificado', detail: project.name, happenedAt: project.startDate, relatedClientId: project.clientId, relatedProjectId: project.id })),
    ...data.meetings.filter((meeting) => Date.parse(meeting.startsAt) <= Date.now()).map((meeting): ActivityItem => ({ id: `activity-${meeting.id}`, kind: 'reunion', title: 'Reunión registrada', detail: meeting.title, happenedAt: meeting.startsAt, relatedClientId: meeting.clientId })),
    ...data.earnings.map((earning): ActivityItem => ({ id: `activity-${earning.id}`, kind: 'ingreso', title: earning.status === 'pagado' ? 'Pago recibido' : 'Cobro pendiente registrado', detail: earning.description, happenedAt: earning.issuedAt, relatedClientId: earning.clientId, relatedProjectId: earning.projectId })),
  ]
  return entries.filter((item) => Number.isFinite(Date.parse(item.happenedAt))).sort((a, b) => Date.parse(b.happenedAt) - Date.parse(a.happenedAt)).slice(0, 8)
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

export function WorkspaceProvider({ userId, children }: { userId?: string; children: ReactNode }) {
  const [workspace, setWorkspace] = useState<WorkspaceData>(emptyWorkspace)
  const [ready, setReady] = useState(!userId || !supabase)
  const [loadSucceeded, setLoadSucceeded] = useState(!userId || !supabase)
  const [syncStatus, setSyncStatus] = useState<'local' | 'saved' | 'saving' | 'error'>(userId && supabase ? 'saving' : 'local')
  const [syncError, setSyncError] = useState<string>()
  const loadedUserId = useRef<string | undefined>(undefined)

  useEffect(() => {
    let active = true
    if (!userId || !supabase) {
      loadedUserId.current = undefined
      setWorkspace(emptyWorkspace)
      setLoadSucceeded(true)
      setSyncStatus('local')
      setReady(true)
      return () => { active = false }
    }

    setReady(false)
    loadedUserId.current = undefined
    setLoadSucceeded(false)
    setSyncStatus('saving')
    void supabase.from('workspace_data').select('data').eq('user_id', userId).maybeSingle().then(async ({ data, error }) => {
      if (!active) return
      if (error) {
        console.error('No se pudo cargar el espacio de trabajo de BRENO.', error)
        setSyncError(error.message)
        setSyncStatus('error')
        setReady(true)
        return
      }
      if (data?.data) {
        setWorkspace(cleanSampleData(data.data as Partial<WorkspaceData>))
      } else {
        setWorkspace(emptyWorkspace)
      }
      loadedUserId.current = userId
      setSyncError(undefined)
      setSyncStatus('saved')
      setLoadSucceeded(true)
      setReady(true)
    })
    return () => { active = false }
  }, [userId])

  useEffect(() => {
    const client = supabase
    if (!ready || !loadSucceeded || !userId || !client || loadedUserId.current !== userId) return
    const timer = window.setTimeout(() => {
      setSyncStatus('saving')
      void client.from('workspace_data').upsert({ user_id: userId, data: workspace, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
        .then(({ error }) => {
          if (error) {
            console.error('No se pudieron guardar los cambios de BRENO.', error)
            setSyncError(error.message)
            setSyncStatus('error')
          } else {
            setSyncError(undefined)
            setSyncStatus('saved')
          }
        })
    }, 250)
    return () => window.clearTimeout(timer)
  }, [ready, loadSucceeded, userId, workspace])

  const value = useMemo<WorkspaceContextValue>(() => ({
    ...workspace,
    activity: deriveActivity(workspace),
    ready,
    syncStatus,
    syncError,
    updateWorkspace: (update) => setWorkspace((current) => typeof update === 'function' ? update(current) : { ...current, ...update }),
  }), [workspace, ready, syncStatus, syncError])

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (!context) throw new Error('useWorkspace debe usarse dentro de WorkspaceProvider')
  return context
}

