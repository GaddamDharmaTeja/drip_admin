import { useEffect, useState } from 'react'
import { api, type ServiceRequest } from '../lib/api'

export function RequestsPage() {
  const [items, setItems] = useState<ServiceRequest[]>([])
  const [error, setError] = useState('')

  async function load() {
    setItems(await api.requests())
  }

  useEffect(() => {
    void load().catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed'))
  }, [])

  async function convert(req: ServiceRequest) {
    const raw = window.prompt('Quotation amount (INR)', '10000')
    if (!raw) return
    const amount = Number(raw)
    if (!amount) return
    await api.convertQuote(req.id, amount, req.message)
    await load()
    alert('Quotation created as Draft')
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-forest">Requests</h1>
      <p className="mt-1 text-stone-600">Contact, bulk quote, installation, and calculator leads.</p>
      {error && <p className="mt-2 text-red-600">{error}</p>}
      <div className="table-wrap mt-6">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-mist/50 text-stone-600">
            <tr>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id} className="border-t border-leaf/5">
                <td className="px-4 py-3 font-semibold">{r.type}</td>
                <td className="px-4 py-3">
                  <div>{r.name}</div>
                  <div className="text-xs text-stone-500">{r.email || r.phone}</div>
                </td>
                <td className="max-w-xs truncate px-4 py-3 text-stone-600">{r.message}</td>
                <td className="px-4 py-3">{r.status}</td>
                <td className="space-x-2 px-4 py-3">
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => void api.updateRequest(r.id, 'InProgress').then(load)}
                  >
                    In progress
                  </button>
                  <button type="button" className="btn-primary" onClick={() => void convert(r)}>
                    Convert to quote
                  </button>
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => void api.updateRequest(r.id, 'Closed').then(load)}
                  >
                    Close
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
