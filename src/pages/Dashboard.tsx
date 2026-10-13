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
    { label: 'Orders', value: data.orders, to: '/orders' },
    { label: 'New requests', value: data.newRequests, to: '/requests' },
    { label: 'Open quotations', value: data.openQuotations, to: '/quotations' },
    { label: 'Products', value: data.products, to: '/products' },
    { label: 'Out of stock', value: data.outOfStock, to: '/products' },
  ]

  return (
    <div>
      <h1 className="font-display text-3xl text-forest">Dashboard</h1>
      <p className="mt-1 text-stone-600">Overview of store operations.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className="card hover:border-leaf">
            <p className="text-xs font-semibold uppercase tracking-wide text-leaf">{c.label}</p>
            <p className="mt-2 font-display text-3xl text-soil">{c.value}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
