import { useEffect, useState, type FormEvent } from 'react'
import { api, type ServiceRequest } from '../lib/api'

type PanelMode = 'view' | 'quote' | null

function formatWhen(value?: string) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return value
  }
}

export function RequestsPage() {
  const [items, setItems] = useState<ServiceRequest[]>([])
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<ServiceRequest | null>(null)
  const [mode, setMode] = useState<PanelMode>(null)
  const [amount, setAmount] = useState('10000')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [panelMsg, setPanelMsg] = useState('')

  async function load() {
    const data = await api.requests()
    setItems(data)
    if (selected) {
      const refreshed = data.find((r) => r.id === selected.id) ?? null
      setSelected(refreshed)
      if (!refreshed) setMode(null)
    }
  }

  useEffect(() => {
    void load().catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed'))
  }, [])

  function openView(req: ServiceRequest) {
    setSelected(req)
    setMode('view')
    setPanelMsg('')
  }

  function openQuote(req: ServiceRequest) {
    setSelected(req)
    setMode('quote')
    setAmount('10000')
    setNotes(req.message ?? '')
    setPanelMsg('')
  }

  function closePanel() {
    setMode(null)
    setSelected(null)
    setPanelMsg('')
  }

  async function submitQuote(e: FormEvent) {
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
      await api.convertQuote(selected.id, value, notes.trim() || selected.message)
      await load()
      setMode('view')
      setPanelMsg('Draft quotation created. Open Quotations to send or update status.')
    } catch (err) {
      setPanelMsg(err instanceof Error ? err.message : 'Could not create quotation')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
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
                  <td className="space-x-2 px-4 py-3 whitespace-nowrap">
                    <button type="button" className="btn-outline" onClick={() => openView(r)}>
                      View
                    </button>
                    <button
                      type="button"
                      className="btn-outline"
                      onClick={() => void api.updateRequest(r.id, 'InProgress').then(load)}
                    >
                      In progress
                    </button>
                    <button type="button" className="btn-primary" onClick={() => openQuote(r)}>
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
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-stone-500">
                    No requests yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {mode && selected ? (
        <aside className="card h-fit space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-xl text-forest">
                {mode === 'quote' ? 'Create quotation' : 'Request details'}
              </h2>
              <p className="mt-1 text-xs text-stone-500">{selected.type}</p>
            </div>
            <button type="button" className="btn-outline" onClick={closePanel}>
              Close
            </button>
          </div>

          <dl className="space-y-3 text-sm">
            <div>
              <dt className="label">Customer</dt>
              <dd className="font-semibold text-soil">{selected.name}</dd>
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
              <dt className="label">Received</dt>
              <dd>{formatWhen(selected.createdAt)}</dd>
            </div>
            <div>
              <dt className="label">Message</dt>
              <dd className="whitespace-pre-wrap rounded-xl bg-mist/70 px-3 py-2 text-soil">
                {selected.message || '—'}
              </dd>
            </div>
            {selected.details && Object.keys(selected.details).length > 0 && (
              <div>
                <dt className="label">Extra details</dt>
                <dd className="rounded-xl bg-mist/70 px-3 py-2">
                  <ul className="space-y-1">
                    {Object.entries(selected.details).map(([key, value]) => (
                      <li key={key}>
                        <span className="font-medium text-stone-600">{key}: </span>
                        <span>{typeof value === 'string' ? value : JSON.stringify(value)}</span>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            )}
          </dl>

          {mode === 'view' && (
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn-primary" onClick={() => openQuote(selected)}>
                Convert to quote
              </button>
              <button
                type="button"
                className="btn-outline"
                onClick={() => void api.updateRequest(selected.id, 'InProgress').then(load)}
              >
                Mark in progress
              </button>
              <button
                type="button"
                className="btn-outline"
                onClick={() => void api.updateRequest(selected.id, 'Closed').then(load)}
              >
                Close request
              </button>
            </div>
          )}

          {mode === 'quote' && (
            <form className="space-y-3 border-t border-leaf/10 pt-4" onSubmit={(e) => void submitQuote(e)}>
              <div>
                <label className="label">Quotation amount (INR)</label>
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
                  placeholder="Scope, farm size, delivery notes…"
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1" disabled={saving}>
                  {saving ? 'Creating…' : 'Create draft quotation'}
                </button>
                <button type="button" className="btn-outline" onClick={() => setMode('view')}>
                  Cancel
                </button>
              </div>
            </form>
          )}

          {panelMsg && (
            <p
              className={`text-sm font-medium ${
                panelMsg.includes('created') || panelMsg.includes('Quotations')
                  ? 'text-forest'
                  : 'text-red-600'
              }`}
            >
              {panelMsg}
            </p>
          )}
        </aside>
      ) : (
        <aside className="card h-fit text-sm text-stone-500">
          Select <span className="font-semibold text-forest">View</span> to read the full request, or{' '}
          <span className="font-semibold text-forest">Convert to quote</span> to enter amount and notes in
          this panel.
        </aside>
      )}
    </div>
  )
}
