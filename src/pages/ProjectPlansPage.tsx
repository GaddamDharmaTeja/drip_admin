import { useEffect, useState } from 'react'
import { api, inr, type ProjectPlan } from '../lib/api'

const empty: Partial<ProjectPlan> = {
  name: '',
  slug: '',
  summary: '',
  steps: ['Site Survey', 'Design', 'Supply', 'Installation', 'Maintenance'],
  basePrice: 0,
  durationDays: 14,
  active: true,
}

export function ProjectPlansPage() {
  const [items, setItems] = useState<ProjectPlan[]>([])
  const [form, setForm] = useState<Partial<ProjectPlan>>(empty)
  const [editingId, setEditingId] = useState<string | null>(null)

  async function load() {
    setItems(await api.projectPlans())
  }

  useEffect(() => {
    void load()
  }, [])

  async function save() {
    await api.saveProjectPlan(
      {
        ...form,
        steps: form.steps ?? [],
      },
      editingId ?? undefined,
    )
    setForm(empty)
    setEditingId(null)
    await load()
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <div>
        <h1 className="font-display text-3xl text-forest">Project Plans</h1>
        <div className="table-wrap mt-6">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="bg-mist/50 text-stone-600">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Days</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-t border-leaf/5">
                  <td className="px-4 py-3 font-semibold">{p.name}</td>
                  <td className="px-4 py-3">{p.durationDays}</td>
                  <td className="px-4 py-3">{inr(p.basePrice)}</td>
                  <td className="space-x-2 px-4 py-3 text-right">
                    <button
                      type="button"
                      className="btn-outline"
                      onClick={() => {
                        setEditingId(p.id)
                        setForm(p)
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn-danger"
                      onClick={() => void api.deleteProjectPlan(p.id).then(load)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <form
        className="card h-fit space-y-3"
        onSubmit={(e) => {
          e.preventDefault()
          void save()
        }}
      >
        <h2 className="font-display text-xl">{editingId ? 'Edit plan' : 'Add plan'}</h2>
        <input
          className="input"
          placeholder="Name"
          value={form.name ?? ''}
          onChange={(e) =>
            setForm({
              ...form,
              name: e.target.value,
              slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            })
          }
        />
        <textarea
          className="input min-h-20"
          placeholder="Summary"
          value={form.summary ?? ''}
          onChange={(e) => setForm({ ...form, summary: e.target.value })}
        />
        <input
          className="input"
          placeholder="Base price"
          value={String(form.basePrice ?? 0)}
          onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) || 0 })}
        />
        <input
          className="input"
          placeholder="Duration days"
          value={String(form.durationDays ?? 14)}
          onChange={(e) => setForm({ ...form, durationDays: Number(e.target.value) || 14 })}
        />
        <button type="submit" className="btn-primary w-full">
          Save
        </button>
      </form>
    </div>
  )
}
