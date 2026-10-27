import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'

export function Dashboard() {
  const [data, setData] = useState<Awaited<ReturnType<typeof api.dashboard>> | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    void api
      .dashboard()
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load'))
  }, [])

  if (error) return <p className="text-red-600">{error}</p>
  if (!data) return <p className="text-stone-600">Loading dashboard…</p>

  const cards = [
    { label: 'Total orders', value: data.orders, icon: '▣', to: '/orders', note: 'Manage fulfilment' },
    { label: 'New requests', value: data.newRequests, icon: '◉', to: '/requests', note: 'Needs attention' },
    { label: 'Open quotations', value: data.openQuotations, icon: '₹', to: '/quotations', note: 'Customer follow-up' },
    { label: 'Products', value: data.products, icon: '◈', to: '/products', note: `${data.outOfStock} out of stock` },
  ]

  return (
    <div className="page-container !p-0">
      <div className="page-header"><div><h1 className="page-title">Dashboard</h1><p className="page-sub">A live overview of customer orders, catalog activity, and farm service work.</p></div><select className="input w-auto text-xs"><option>This month</option><option>Last 30 days</option><option>This year</option></select></div>
      <div className="stats-grid">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className="stat-card card-hover">
            <div className="flex items-start justify-between"><p className="stat-label">{c.label}</p><span className="rounded-lg bg-mist px-2 py-1 text-leaf">{c.icon}</span></div>
            <p className="stat-value">{c.value}</p>
            <p className="stat-description">{c.note}</p>
          </Link>
        ))}
      </div>
      <div className="content-grid mt-6">
        <section className="card"><div className="card-header"><div><h2 className="card-title">Sales overview</h2><p className="text-xs text-stone-500">Order activity over the current period</p></div><span className="badge badge-success">Live</span></div><div className="flex h-48 items-end gap-2 pt-5">{[32, 48, 39, 67, 51, 72, 63, 84, 68, 91, 78, 88].map((height, index) => <div key={index} className="flex flex-1 flex-col justify-end gap-2"><div className="rounded-t-md bg-gradient-to-t from-leaf to-emerald-300" style={{ height: `${height}%` }} /><span className="text-center text-[10px] text-stone-400">{index + 1}</span></div>)}</div></section>
        <section className="card"><div className="card-header"><div><h2 className="card-title">Quick actions</h2><p className="text-xs text-stone-500">Common operation tasks</p></div></div><div className="grid gap-3 sm:grid-cols-2"><Link to="/products" className="rounded-xl border border-leaf/10 bg-mist/40 p-4 text-sm font-semibold text-forest hover:bg-mist">+ Add or update product</Link><Link to="/orders" className="rounded-xl border border-leaf/10 bg-white p-4 text-sm font-semibold text-forest hover:bg-mist">Review order status</Link><Link to="/accounts" className="rounded-xl border border-leaf/10 bg-white p-4 text-sm font-semibold text-forest hover:bg-mist">Manage team access</Link><Link to="/requests" className="rounded-xl border border-leaf/10 bg-white p-4 text-sm font-semibold text-forest hover:bg-mist">Review customer requests</Link></div></section>
      </div>
    </div>
  )
}
