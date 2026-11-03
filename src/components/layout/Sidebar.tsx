import type { Dispatch, SetStateAction } from 'react'
import { NavLink } from 'react-router-dom'
import {
  BriefcaseBusiness,
  CalendarDays,
  Command,
  CreditCard,
  LayoutDashboard,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings2,
  Sparkles,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react'
import { appPagePaths, type AppPage } from './layout.types'
import './router.css'

type SidebarProps = {
  onAgent: () => void
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  profileEmail?: string
  collapsed: boolean
  onToggleCollapse: () => void
}

const navGroups: { title: string; items: [AppPage, LucideIcon][] }[] = [
  {
    title: 'GENERAL',
    items: [
      ['Dashboard', LayoutDashboard],
      ['Clientes', Users],
      ['Proyectos', BriefcaseBusiness],
    ],
  },
  {
    title: 'GESTIÓN',
    items: [
      ['Calendario', CalendarDays],
      ['Ganancias', CreditCard],
    ],
  },
]

function Brand() {
  return (
    <div className="brand" aria-label="BRENO Studio">
      <span className="brand-mark">b.</span>
      <span className="brand-name">BRENO<span className="brand-dot">.</span></span>
      <span className="brand-tag">STUDIO</span>
    </div>
  )
}

export default function Sidebar({ onAgent, open, setOpen, profileEmail, collapsed, onToggleCollapse }: SidebarProps) {
  return (
    <>
      <button
        type="button"
        aria-label="Cerrar navegación"
        className={`sidebar-scrim ${open ? 'show' : ''}`}
        onClick={() => setOpen(false)}
      />
      <aside className={`sidebar ${open ? 'sidebar-open' : ''} ${collapsed ? 'sidebar-collapsed' : ''}`} aria-label="Navegación principal">
        <div className="side-top">
          <Brand />
          <button type="button" className="icon-button sidebar-collapse-toggle" aria-label={collapsed ? 'Expandir menú' : 'Plegar menú'} title={collapsed ? 'Expandir menú' : 'Plegar menú'} onClick={onToggleCollapse}>
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
          <button type="button" className="icon-button side-close" aria-label="Cerrar menú" onClick={() => setOpen(false)}>
            <X size={16} />
          </button>
        </div>

        <button type="button" className="search-shortcut" title="Buscar">
          <Search size={15} />
          <span>Buscar cualquier cosa...</span>
          <kbd><Command size={10} /> K</kbd>
        </button>

        <nav className="side-nav">
          {navGroups.map((group) => (
            <div className="nav-group" key={group.title}>
              <span className="nav-label">{group.title}</span>
              {group.items.map(([label, Icon]) => {
                return (
                  <NavLink
                    key={label}
                    to={appPagePaths[label]}
                    end
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    title={collapsed ? label : undefined}
                    onClick={() => setOpen(false)}
                  >
                    <NavLinkIcon Icon={Icon} />
                    <span>{label}</span>
                    <NavLinkLed />
                  </NavLink>
                )
              })}
            </div>
          ))}

          <div className="nav-group">
            <span className="nav-label">ASISTENTE</span>
            <button type="button" className="nav-item agent-link" title={collapsed ? 'Agente BRENO' : undefined} onClick={() => { onAgent(); setOpen(false) }}>
              <span className="nav-icon-button agent-nav-icon"><Sparkles size={14} /></span>
              <span>Agente BRENO</span>
              <span className="live-indicator" aria-label="Agente disponible" />
            </button>
          </div>
        </nav>

        <div className="sidebar-bottom">
          <div className="side-tip">
            <div className="tip-icon"><Sparkles size={14} /></div>
            <span className="tip-pill">NUEVO</span>
            <b>¿Una idea en mente?</b>
            <p>Tu agente BRENO está listo para ayudarte.</p>
            <button type="button" onClick={onAgent}>Habla con el agente <span aria-hidden="true">↗</span></button>
          </div>
          <button type="button" className="nav-item settings-item">
            <span className="nav-icon-button"><Settings2 size={15} /></span><span>Configuración</span>
          </button>
          <div className="profile-row">
            <span className="avatar blue">BR</span>
            <span className="profile-copy"><b>{profileEmail ? profileEmail.split('@')[0] : 'Breno Rivas'}</b><small>{profileEmail ?? 'Admin workspace'}</small></span>
            <MoreHorizontal size={17} />
          </div>
        </div>
      </aside>
    </>
  )
}

function NavLinkIcon({ Icon }: { Icon: LucideIcon }) {
  return <span className="nav-icon-button"><Icon size={15} /></span>
}

function NavLinkLed() {
  return <span className="nav-item-led" aria-label="Sección activa" />
}

