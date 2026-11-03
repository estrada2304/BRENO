import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate, useOutletContext } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import ClientsPage from './components/clients/ClientsPage'
import Dashboard from './components/dashboard/Dashboard'
import ProjectGantt from './components/projects/ProjectGantt'
import MeetingCalendar from './components/calendar/MeetingCalendar'
import EarningsPanel from './components/earnings/EarningsPanel'
import BrenoAgent from './components/agent/BrenoAgent'
import Sidebar from './components/layout/Sidebar'
import TopBar from './components/layout/TopBar'
import { appPagePaths, getPageFromPath, type AppPage } from './components/layout/layout.types'
import AuthScreen from './components/auth/AuthScreen'
import { isSupabaseConfigured, supabase } from './lib/supabase'
import { useWorkspace, WorkspaceProvider } from './lib/workspace'

type AppLayoutContext = {
  navigateToPage: (page: AppPage) => void
  openAgent: () => void
}

type ApplicationRouterProps = { userEmail?: string; onSignOut?: () => void }

function AuthSetupScreen() {
  return (
    <main className="auth-screen">
      <section className="auth-panel auth-setup-panel">
        <div className="auth-panel-reflection" />
        <div className="auth-brand"><span className="auth-brand-mark">b.</span><span>BRENO<span className="auth-brand-dot">.</span></span><small>STUDIO OS</small></div>
        <div className="auth-kicker">CONFIGURACIÓN PENDIENTE</div>
        <h1>Conecta tu espacio</h1>
        <p className="auth-intro">La autenticación está activada, pero falta vincular el proyecto de Supabase para recibir registros y enviar correos de confirmación.</p>
        <div className="auth-message auth-success">Crea un proyecto Supabase y configura <code>VITE_SUPABASE_URL</code> y <code>VITE_SUPABASE_ANON_KEY</code>. Después configura SMTP y las URL de redirección.</div>
        <p className="auth-security-note">BRENO no almacenará contraseñas en el navegador. Las cuentas se gestionan en Supabase Auth.</p>
      </section>
      <p className="auth-footnote">BRENO STUDIO OS <span>·</span> Preparado para el primer despliegue.</p>
    </main>
  )
}

function AuthGate() {
  const client = supabase
  const authRequired = import.meta.env.VITE_AUTH_REQUIRED === 'true' || isSupabaseConfigured
  const [session, setSession] = useState<Session | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!authRequired || !client) {
      setReady(true)
      return
    }
    let alive = true
    client.auth.getSession().then(({ data }) => {
      if (alive) {
        setSession(data.session)
        setReady(true)
      }
    })
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setReady(true)
    })
    return () => {
      alive = false
      subscription.unsubscribe()
    }
  }, [authRequired, client])

  if (!authRequired) return <WorkspaceProvider><ApplicationRouter /></WorkspaceProvider>
  if (!client) return <AuthSetupScreen />
  if (window.location.hash.includes('type=recovery')) return <AuthScreen client={client} />
  if (!ready) return <main className="auth-screen"><div className="auth-panel"><div className="auth-kicker">CONECTANDO</div><h1>Preparando tu espacio…</h1></div></main>
  if (!session) return <AuthScreen client={client} />
  return <WorkspaceProvider userId={session.user.id}><ApplicationRouter userEmail={session.user.email ?? ''} onSignOut={() => client.auth.signOut()} /></WorkspaceProvider>
}

function AppLayout({ userEmail, onSignOut }: ApplicationRouterProps) {
  const workspaceState = useWorkspace()
  const location = useLocation()
  const navigate = useNavigate()
  const [agentOpen, setAgentOpen] = useState(false)
  const [mobileNav, setMobileNav] = useState(false)
  const page = getPageFromPath(location.pathname)
  const context: AppLayoutContext = {
    navigateToPage: (nextPage) => navigate(appPagePaths[nextPage]),
    openAgent: () => setAgentOpen(true),
  }

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <Sidebar onAgent={context.openAgent} open={mobileNav} setOpen={setMobileNav} profileEmail={userEmail} />
      <main className="main-shell">
        <TopBar page={page} onOpenAgent={context.openAgent} onOpenMenu={() => setMobileNav(true)} onSignOut={onSignOut} syncStatus={workspaceState.syncStatus} syncError={workspaceState.syncError} />
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={location.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: .2 }}>
            <Outlet context={context} />
          </motion.div>
        </AnimatePresence>
      </main>
      <BrenoAgent open={agentOpen} onClose={() => setAgentOpen(false)} />
    </div>
  )
}

function DashboardRoute() {
  const { navigateToPage, openAgent } = useOutletContext<AppLayoutContext>()
  return <Dashboard setPage={navigateToPage} onAgent={openAgent} />
}

function ApplicationRouter({ userEmail = '', onSignOut }: ApplicationRouterProps) {
  return (
    <Routes>
      <Route element={<AppLayout userEmail={userEmail} onSignOut={onSignOut} />}>
        <Route index element={<Navigate to={appPagePaths.Dashboard} replace />} />
        <Route path={appPagePaths.Dashboard} element={<DashboardRoute />} />
        <Route path={appPagePaths.Clientes} element={<ClientsPage />} />
        <Route path={appPagePaths.Proyectos} element={<ProjectGantt />} />
        <Route path={appPagePaths.Calendario} element={<MeetingCalendar />} />
        <Route path={appPagePaths.Ganancias} element={<EarningsPanel />} />
      </Route>
      <Route path="*" element={<Navigate to={appPagePaths.Dashboard} replace />} />
    </Routes>
  )
}

export default function App() {
  return <AuthGate />
}

