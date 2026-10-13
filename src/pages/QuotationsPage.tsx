import { useEffect, useState } from 'react'
import { api, inr, type Quotation } from '../lib/api'

export function QuotationsPage() {
  const [items, setItems] = useState<Quotation[]>([])
  const [error, setError] = useState('')

  async function load() {
    setItems(await api.quotations())
  }

  useEffect(() => {
    void load().catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed'))
  }, [])

  return (
    <div>
      <h1 className="font-display text-3xl text-forest">Quotations</h1>
      <p className="mt-1 text-stone-600">Send, accept, or reject quotes.</p>
      {error && <p className="mt-2 text-red-600">{error}</p>}
      <div className="table-wrap mt-6">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="bg-mist/50 text-stone-600">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Update</th>
            </tr>
          </thead>
          <tbody>
            {items.map((q) => (
              <tr key={q.id} className="border-t border-leaf/5">
                <td className="px-4 py-3">
                  <div className="font-semibold">{q.customerName}</div>
                  <div className="text-xs text-stone-500">{q.phone || q.email}</div>
                </td>
                <td className="px-4 py-3 font-semibold">{inr(q.amount)}</td>
                <td className="px-4 py-3">{q.status}</td>
                <td className="px-4 py-3">
                  <select
                    className="input w-auto"
                    value={q.status}
                    onChange={(e) =>
                      void api.updateQuotation(q.id, { status: e.target.value }).then(load)
                    }
                  >
                    {['Draft', 'Sent', 'Accepted', 'Rejected'].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
