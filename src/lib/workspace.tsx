import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { ActivityItem, Client, Earning, Lead, Meeting, Project } from '../types'
import { mockActivity, mockClients, mockEarnings, mockLeads, mockMeetings, mockProjects } from '../mockData'
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
  updateWorkspace: (update: Partial<WorkspaceData> | ((current: WorkspaceData) => WorkspaceData)) => void
}

const demoWorkspace: WorkspaceData = {
  clients: mockClients,
  projects: mockProjects,
  meetings: mockMeetings,
  earnings: mockEarnings,
  leads: mockLeads,
  activity: mockActivity,
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

export function WorkspaceProvider({ userId, children }: { userId?: string; children: ReactNode }) {
  const [workspace, setWorkspace] = useState<WorkspaceData>(demoWorkspace)
  const [ready, setReady] = useState(!userId || !supabase)

  useEffect(() => {
    let active = true
    if (!userId || !supabase) {
      setWorkspace(demoWorkspace)
      setReady(true)
      return () => { active = false }
    }

    setReady(false)
    void supabase.from('workspace_data').select('data').eq('user_id', userId).maybeSingle().then(async ({ data, error }) => {
      if (!active) return
      if (error) {
        console.error('No se pudo cargar el espacio de trabajo de BRENO.', error)
        setReady(true)
        return
      }
      if (data?.data) {
        setWorkspace({ ...demoWorkspace, ...data.data } as WorkspaceData)
      } else {
        setWorkspace(demoWorkspace)
      }
      setReady(true)
    })
    return () => { active = false }
  }, [userId])

  useEffect(() => {
    const client = supabase
    if (!ready || !userId || !client) return
    const timer = window.setTimeout(() => {
      void client.from('workspace_data').upsert({ user_id: userId, data: workspace, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
        .then(({ error }) => { if (error) console.error('No se pudieron guardar los cambios de BRENO.', error) })
    }, 250)
    return () => window.clearTimeout(timer)
  }, [ready, userId, workspace])

  const value = useMemo<WorkspaceContextValue>(() => ({
    ...workspace,
    ready,
    updateWorkspace: (update) => setWorkspace((current) => typeof update === 'function' ? update(current) : { ...current, ...update }),
  }), [workspace, ready])

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext)
  if (!context) throw new Error('useWorkspace debe usarse dentro de WorkspaceProvider')
  return context
}
