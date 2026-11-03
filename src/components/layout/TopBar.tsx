import { Bell, LogOut, Menu, Sparkles } from 'lucide-react'
import type { AppPage } from './layout.types'

type TopBarProps = {
  page: AppPage
  onOpenAgent: () => void
  onOpenMenu: () => void
  onSignOut?: () => void
  syncStatus?: 'local' | 'saved' | 'saving' | 'error'
  syncError?: string
}

export default function TopBar({ page, onOpenAgent, onOpenMenu, onSignOut, syncStatus = 'local', syncError }: TopBarProps) {
  return (
    <header className="header">
      <div className="header-left">
        <button type="button" className="icon-button menu-toggle" aria-label="Abrir navegación" onClick={onOpenMenu}>
          <Menu size={18} />
        </button>
        <span className="breadcrumbs">Workspace <span>/</span> <b>{page}</b></span>
      </div>
      <div className="header-actions">
        <span className={`workspace-sync ${syncStatus}`} title={syncError || (syncStatus === 'saved' ? 'Cambios guardados en tu cuenta' : syncStatus === 'saving' ? 'Sincronizando cambios' : 'Cambios guardados en este dispositivo')}><i />{syncStatus === 'saved' ? 'Guardado' : syncStatus === 'saving' ? 'Guardando…' : syncStatus === 'error' ? 'Error al guardar' : 'Modo local'}</span>
        <span className="header-date"><span className="live-indicator" /> Todos los sistemas operativos</span>
        <button type="button" className="icon-button notification-button" aria-label="Notificaciones">
          <Bell size={16} /><i />
        </button>
        {onSignOut && <button type="button" className="icon-button sign-out-button" onClick={onSignOut} aria-label="Cerrar sesión" title="Cerrar sesión"><LogOut size={15} /></button>}
        <span className="header-divider" />
        <button type="button" className="header-agent" onClick={onOpenAgent}>
          <Sparkles size={14} /> Ask BRENO <kbd>⌘ J</kbd>
        </button>
      </div>
    </header>
  )
}

