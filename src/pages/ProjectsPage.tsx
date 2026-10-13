import { useEffect, useState } from 'react'
import { ImageUploader } from '../components/ImageUploader'
import { api, fileUrl, type ProjectCase } from '../lib/api'

const empty: Partial<ProjectCase> = {
  title: '',
  location: '',
  crop: '',
  area: '',
  image: '',
  summary: '',
  published: true,
}

export function ProjectsPage() {
  const [items, setItems] = useState<ProjectCase[]>([])
  const [form, setForm] = useState<Partial<ProjectCase>>(empty)
  const [editingId, setEditingId] = useState<string | null>(null)

  async function load() {
    setItems(await api.projects())
  }

  useEffect(() => {
    void load()
  }, [])

  async function save() {
    await api.saveProject(form, editingId ?? undefined)
    setForm(empty)
    setEditingId(null)
    await load()
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <div>
        <h1 className="page-title">Project Cases</h1>
        <p className="page-sub">Case-study photos are stored in the database (uploads GridFS bucket).</p>
        <div className="table-wrap mt-6">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-mist/60 text-stone-600">
              <tr>
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Published</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p.id} className="border-t border-leaf/5">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.image ? (
                        <img src={fileUrl(p.image)} alt="" className="thumb" />
                      ) : (
                        <div className="thumb bg-mist" />
                      )}
                      <span className="font-semibold">{p.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{p.location}</td>
                  <td className="px-4 py-3">{p.published ? 'Yes' : 'No'}</td>
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
                      onClick={() => void api.deleteProject(p.id).then(load)}
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
        <h2 className="font-display text-xl text-forest">{editingId ? 'Edit project' : 'Add project'}</h2>
        <ImageUploader
          label="Cover image"
          value={form.image}
          onChange={(url) => setForm({ ...form, image: url })}
        />
        {(['title', 'location', 'crop', 'area'] as const).map((key) => (
          <input
            key={key}
            className="input"
            placeholder={key}
            value={String(form[key] ?? '')}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          />
        ))}
        <textarea
          className="input min-h-20"
          placeholder="Summary"
          value={form.summary ?? ''}
          onChange={(e) => setForm({ ...form, summary: e.target.value })}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.published !== false}
            onChange={(e) => setForm({ ...form, published: e.target.checked })}
          />
          Published
        </label>
        <button type="submit" className="btn-primary w-full">
          Save project
        </button>
      </form>
    </div>
  )
}
