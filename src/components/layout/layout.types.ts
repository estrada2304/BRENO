export type AppPage = 'Dashboard' | 'Clientes' | 'Proyectos' | 'Calendario' | 'Ganancias'

export const appPagePaths: Record<AppPage, string> = {
  Dashboard: '/dashboard',
  Clientes: '/clientes',
  Proyectos: '/proyectos',
  Calendario: '/calendario',
  Ganancias: '/ganancias',
}

export function getPageFromPath(pathname: string): AppPage {
  return (Object.entries(appPagePaths).find(([, path]) => path === pathname)?.[0] as AppPage | undefined) ?? 'Dashboard'
}
