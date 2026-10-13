import { useEffect, useState } from 'react'
import { api, inr, type IrrigationPlan } from '../lib/api'

const empty: Partial<IrrigationPlan> = {
  name: '',
  slug: '',
  farmSize: '1 Acre',
  price: 0,
  description: '',
  cropTypes: ['Vegetables'],
  active: true,
}

export function IrrigationPlansPage() {
  const [items, setItems] = useState<IrrigationPlan[]>([])
  const [form, setForm] = useState<Partial<IrrigationPlan>>(empty)
  const [editingId, setEditingId] = useState<string | null>(null)

  async function load() {
    setItems(await api.irrigationPlans())
  }

  useEffect(() => {
    void load()
  }, [])

  async function save() {
    await api.saveIrrigationPlan(
      {
        ...form,
        cropTypes: form.cropTypes ?? ['Vegetables'],
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
        <h1 className="font-display text-3xl text-forest">Irrigation Plans</h1>
        <div className="table-wrap mt-6">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="bg-mist/50 text-stone-600">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-t border-leaf/5">
                  <td className="px-4 py-3 font-semibold">{p.name}</td>
                  <td className="px-4 py-3">{p.farmSize}</td>
                  <td className="px-4 py-3">{inr(p.price)}</td>
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
                      onClick={() => void api.deleteIrrigationPlan(p.id).then(load)}
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
        <input
          className="input"
          placeholder="Farm size"
          value={form.farmSize ?? ''}
          onChange={(e) => setForm({ ...form, farmSize: e.target.value })}
        />
        <input
          className="input"
          placeholder="Price"
          value={String(form.price ?? 0)}
          onChange={(e) => setForm({ ...form, price: Number(e.target.value) || 0 })}
        />
        <textarea
          className="input min-h-24"
          placeholder="Description"
          value={form.description ?? ''}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.active !== false}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
          />
          Active
        </label>
        <button type="submit" className="btn-primary w-full">
          Save
        </button>
      </form>
    </div>
  )
}
