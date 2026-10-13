import { NavLink, Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../auth'

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/orders', label: 'Orders' },
  { to: '/products', label: 'Products' },
  { to: '/irrigation-plans', label: 'Irrigation Plans' },
  { to: '/project-plans', label: 'Project Plans' },
  { to: '/projects', label: 'Projects' },
  { to: '/requests', label: 'Requests' },
  { to: '/quotations', label: 'Quotations' },
  { to: '/site-contact', label: 'Site contact' },
]

export function AdminLayout() {
  const { token, username, logout } = useAuth()
  if (!token) return <Navigate to="/login" replace />

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-white/10 bg-soil text-stone-200 md:flex">
        <div className="px-5 py-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-leaf text-sm font-bold text-white">
            DG
          </div>
          <p className="mt-3 font-display text-2xl text-white">DripGrow</p>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-300/80">
            Admin · GridFS media
          </p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3 pb-6">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-leaf text-white shadow-lg shadow-black/20'
                    : 'text-stone-300 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-leaf/10 bg-white/80 px-4 py-3 backdrop-blur-md">
          <div>
            <p className="font-semibold text-forest md:hidden">DripGrow Admin</p>
            <p className="hidden text-sm text-stone-500 md:block">
              Images save to MongoDB <code className="rounded bg-mist px-1.5 py-0.5 text-xs">uploads</code> bucket
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="rounded-full bg-mist px-3 py-1 font-medium text-forest">{username}</span>
            <button type="button" className="btn-outline" onClick={logout}>
              Logout
            </button>
          </div>
        </header>

        <div className="flex gap-2 overflow-x-auto border-b border-leaf/10 bg-white/70 px-3 py-2 md:hidden">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                  isActive ? 'bg-leaf text-white' : 'bg-mist text-forest'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
