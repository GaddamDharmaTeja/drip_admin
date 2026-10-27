import { NavLink, Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useState, type FormEvent } from 'react'
import { useAuth } from '../auth'

const links = [
  { to: '/', label: 'Dashboard', end: true, permission: 'dashboard' },
  { to: '/orders', label: 'Orders', permission: 'orders' },
  { to: '/products', label: 'Products', permission: 'catalog' },
  { to: '/irrigation-plans', label: 'Irrigation Plans', permission: 'plans' },
  { to: '/project-plans', label: 'Project Plans', permission: 'plans' },
  { to: '/projects', label: 'Projects', permission: 'projects' },
  { to: '/requests', label: 'Requests', permission: 'requests' },
  { to: '/quotations', label: 'Quotations', permission: 'quotations' },
  { to: '/site-contact', label: 'Site contact', permission: 'settings' },
  { to: '/languages', label: 'Languages', permission: 'languages' },
  { to: '/accounts', label: 'Accounts', permission: 'staff' },
]

export function AdminLayout() {
  const { token, username, role, permissions, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [query, setQuery] = useState('')
  const location = useLocation()
  const navigate = useNavigate()
  if (!token) return <Navigate to="/login" replace />
  const visibleLinks = links.filter((link) => !link.permission || permissions.includes(link.permission))

  return (
    <div className={`app-layout ${menuOpen ? 'sidebar-open' : ''}`}>
      <button type="button" className="sidebar-overlay md:hidden" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />
      <aside className="sidebar flex w-64 shrink-0 flex-col border-r border-white/10 bg-soil text-stone-200">
        <div className="px-5 py-6">
          <div className="flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-leaf text-base font-bold text-white">❧</div><p className="font-display text-lg font-semibold text-white">DripGrow Admin</p></div>
          <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.18em] text-emerald-300/80">Operations console</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3 pb-6">
          {visibleLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-leaf text-white shadow-lg shadow-black/20'
                    : 'text-stone-300 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <span className="mr-2 inline-flex w-4 justify-center text-base">{navIcon(l.label)}</span>{l.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="app-header sticky top-0 z-20 flex items-center justify-between border-b border-leaf/10 bg-white/80 px-4 py-3 backdrop-blur-md">
          <div className="flex min-w-0 items-center gap-2">
            <button type="button" className="mobile-menu-button mr-2 md:hidden" aria-label="Open navigation" onClick={() => setMenuOpen(true)}>☰</button>
            <p className="inline font-semibold text-forest md:hidden">DripGrow Admin</p>
            <form className="hidden w-[min(31vw,360px)] md:block" onSubmit={(event: FormEvent) => { event.preventDefault(); navigate(query.trim() ? `/products?q=${encodeURIComponent(query.trim())}` : '/products') }}><input className="input h-9 bg-stone-50 text-xs" placeholder="Search orders, products, customers…" value={query} onChange={(event) => setQuery(event.target.value)} /></form>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden rounded-full bg-mist px-3 py-1 font-medium text-forest sm:inline">● {username} · {role}</span>
            <button type="button" className="btn-outline" onClick={logout}>
              Logout
            </button>
          </div>
        </header>

        <main className="main-content has-bottom-nav flex-1 p-4 lg:p-8" key={location.pathname}>
          <Outlet />
        </main>
        <nav className="mobile-bottom-nav md:hidden">
          {visibleLinks.slice(0, 4).map((link) => <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => isActive ? 'active' : ''}>{link.label}</NavLink>)}
          <button type="button" onClick={() => setMenuOpen(true)}>More</button>
        </nav>
      </div>
    </div>
  )
}

function navIcon(label: string) {
  const icons: Record<string, string> = { Dashboard: '⌂', Orders: '▣', Products: '◈', 'Irrigation Plans': '◌', 'Project Plans': '◫', Projects: '◩', Requests: '!', Quotations: '₹', 'Site contact': '✉', Languages: '文', Accounts: '♙' }
  return icons[label] ?? '•'
}
