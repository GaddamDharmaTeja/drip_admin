import { useEffect, useState, type FormEvent } from 'react'
import { api, inr, type Quotation } from '../lib/api'

function formatWhen(value?: string) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return value
  }
}

export function QuotationsPage() {
  const [items, setItems] = useState<Quotation[]>([])
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<Quotation | null>(null)
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [panelMsg, setPanelMsg] = useState('')

  async function load() {
    const data = await api.quotations()
    setItems(data)
    if (selected) {
      const refreshed = data.find((q) => q.id === selected.id) ?? null
      setSelected(refreshed)
      if (refreshed) {
        setAmount(String(refreshed.amount))
        setNotes(refreshed.notes ?? '')
      }
    }
  }

  useEffect(() => {
    void load().catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed'))
  }, [])

  function openView(q: Quotation) {
    setSelected(q)
    setAmount(String(q.amount))
    setNotes(q.notes ?? '')
    setPanelMsg('')
  }

  async function saveDetails(e: FormEvent) {
    e.preventDefault()
    if (!selected) return
    const value = Number(amount)
    if (!value || value <= 0) {
      setPanelMsg('Enter a valid amount greater than 0')
      return
    }
    setSaving(true)
    setPanelMsg('')
    try {
      const updated = await api.updateQuotation(selected.id, {
        amount: value,
        notes: notes.trim(),
      })
      setSelected(updated)
      await load()
      setPanelMsg('Quotation updated')
    } catch (err) {
      setPanelMsg(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <div>
        <h1 className="font-display text-3xl text-forest">Quotations</h1>
        <p className="mt-1 text-stone-600">View details, edit amount/notes, and update status.</p>
        {error && <p className="mt-2 text-red-600">{error}</p>}
        <div className="table-wrap mt-6">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-mist/50 text-stone-600">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
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
                  <td className="space-x-2 px-4 py-3 whitespace-nowrap">
                    <button type="button" className="btn-outline" onClick={() => openView(q)}>
                      View
                    </button>
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
              {items.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-stone-500">
                    No quotations yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selected ? (
        <aside className="card h-fit space-y-4">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-display text-xl text-forest">Quotation details</h2>
            <button
              type="button"
              className="btn-outline"
              onClick={() => {
                setSelected(null)
                setPanelMsg('')
              }}
            >
              Close
            </button>
          </div>

          <dl className="space-y-3 text-sm">
            <div>
              <dt className="label">Customer</dt>
              <dd className="font-semibold text-soil">{selected.customerName}</dd>
            </div>
            <div>
              <dt className="label">Email</dt>
              <dd>{selected.email || '—'}</dd>
            </div>
            <div>
              <dt className="label">Phone</dt>
              <dd>{selected.phone || '—'}</dd>
            </div>
            <div>
              <dt className="label">Status</dt>
              <dd>{selected.status}</dd>
            </div>
            <div>
              <dt className="label">Created</dt>
              <dd>{formatWhen(selected.createdAt)}</dd>
            </div>
            {selected.requestId && (
              <div>
                <dt className="label">Source request</dt>
                <dd className="font-mono text-xs">{selected.requestId}</dd>
              </div>
            )}
          </dl>

          <form className="space-y-3 border-t border-leaf/10 pt-4" onSubmit={(e) => void saveDetails(e)}>
            <div>
              <label className="label">Amount (INR)</label>
              <input
                className="input"
                type="number"
                min="1"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Notes</label>
              <textarea
                className="input min-h-28"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </form>

          {panelMsg && (
            <p
              className={`text-sm font-medium ${
                panelMsg.includes('updated') ? 'text-forest' : 'text-red-600'
              }`}
            >
              {panelMsg}
            </p>
          )}
        </aside>
      ) : (
        <aside className="card h-fit text-sm text-stone-500">
          Select <span className="font-semibold text-forest">View</span> to see notes and edit quotation
          details.
        </aside>
      )}
    </div>
  )
}
