import { useEffect, useState, type FormEvent } from 'react'
import { api, type SiteContact } from '../lib/api'

const empty: SiteContact = {
  id: 'main',
  title: 'DripGrow HQ',
  address: '',
  email: '',
  phone: '',
  hours: '',
}

export function SiteContactPage() {
  const [form, setForm] = useState<SiteContact>(empty)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    void api
      .siteContact()
      .then((data) => setForm({ ...empty, ...data }))
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  async function onSave(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')
    try {
      const saved = await api.saveSiteContact(form)
      setForm({ ...empty, ...saved })
      setMessage('Contact details saved. They appear on the storefront Contact page.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-stone-500">Loading contact details…</p>
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="page-title">Site contact</h1>
      <p className="page-sub">HQ details shown on the public Contact page.</p>

      <form className="card mt-6 space-y-4" onSubmit={(e) => void onSave(e)}>
        <div>
          <label className="label">Title</label>
          <input
            className="input"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="label">Address</label>
          <textarea
            className="input min-h-20"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="label">Phone / WhatsApp</label>
          <input
            className="input"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="label">Hours</label>
          <input
            className="input"
            value={form.hours}
            onChange={(e) => setForm({ ...form, hours: e.target.value })}
            required
          />
        </div>

        {message && <p className="text-sm font-medium text-forest">{message}</p>}
        {error && <p className="text-sm font-medium text-red-600">{error}</p>}

        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save contact details'}
        </button>
      </form>
    </div>
  )
}
