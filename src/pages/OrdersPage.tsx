import { useEffect, useState } from 'react'
import { api, inr, type Order } from '../lib/api'

const statuses = ['Confirmed', 'Accepted', 'Shipped', 'Delivered', 'Cancelled']

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [error, setError] = useState('')

  async function load() {
    try {
      setOrders(await api.orders())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed')
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function setStatus(order: Order, status: string) {
    await api.updateOrder(order.id, { status })
    await load()
  }

  return (
    <div>
      <h1 className="font-display text-3xl text-forest">Orders (COD)</h1>
      <p className="mt-1 text-stone-600">Accept, ship, deliver, or cancel orders.</p>
      {error && <p className="mt-3 text-red-600">{error}</p>}
      <div className="table-wrap mt-6">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-mist/50 text-stone-600">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-leaf/5">
                <td className="px-4 py-3 font-mono font-semibold">{o.id}</td>
                <td className="px-4 py-3">
                  <div>{o.address?.fullName}</div>
                  <div className="text-xs text-stone-500">{o.address?.phone}</div>
                </td>
                <td className="px-4 py-3 font-semibold">{inr(o.total)}</td>
                <td className="px-4 py-3">
                  <span className="rounded-md bg-mist px-2 py-0.5 text-xs font-semibold text-forest">
                    {o.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <select
                    className="input w-auto"
                    value={o.status}
                    onChange={(e) => void setStatus(o, e.target.value)}
                  >
                    {statuses.map((s) => (
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
        {orders.length === 0 && <p className="p-8 text-center text-stone-500">No orders yet.</p>}
      </div>
    </div>
  )
}
