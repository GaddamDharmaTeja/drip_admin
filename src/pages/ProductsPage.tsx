import { useEffect, useState } from 'react'
import { ImageUploader } from '../components/ImageUploader'
import { api, fileUrl, inr, type Product } from '../lib/api'

const empty: Partial<Product> = {
  name: '',
  slug: '',
  category: 'Kits',
  brand: 'DripGrow',
  price: 0,
  rating: 4.5,
  reviewCount: 0,
  image: '',
  images: [],
  inStock: true,
  bestseller: false,
  shortDescription: '',
  description: '',
  cropTypes: ['Vegetables'],
  specifications: {},
  packageIncludes: [],
  farmSizes: ['Standard'],
}

export function ProductsPage() {
  const [items, setItems] = useState<Product[]>([])
  const [form, setForm] = useState<Partial<Product>>(empty)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function load() {
    setItems(await api.products())
  }

  useEffect(() => {
    void load().catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed'))
  }, [])

  async function save() {
    try {
      const payload = {
        ...form,
        images: form.image ? [form.image, ...(form.images ?? []).filter((u) => u !== form.image)] : form.images ?? [],
        cropTypes: form.cropTypes ?? ['Vegetables'],
        packageIncludes: form.packageIncludes ?? [],
        farmSizes: form.farmSizes ?? ['Standard'],
        specifications: form.specifications ?? {},
      }
      if (editingId) await api.updateProduct(editingId, payload)
      else await api.createProduct(payload)
      setForm(empty)
      setEditingId(null)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed')
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      <div>
        <h1 className="page-title">Products</h1>
        <p className="page-sub">Upload product photos into MongoDB GridFS, then save the catalog record.</p>
        {error && <p className="mt-2 text-red-600">{error}</p>}
        <div className="table-wrap mt-6">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-mist/60 text-stone-600">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
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
                      <div>
                        <p className="font-semibold">{p.name}</p>
                        <p className="text-xs text-stone-500">{p.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{inr(p.price)}</td>
                  <td className="px-4 py-3">{p.inStock ? 'In stock' : 'Out'}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      className="btn-outline mr-2"
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
                      onClick={() => void api.deleteProduct(p.id).then(load)}
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
        <h2 className="font-display text-xl text-forest">{editingId ? 'Edit product' : 'Add product'}</h2>
        <ImageUploader
          label="Product image"
          value={form.image}
          onChange={(url) => setForm({ ...form, image: url, images: url ? [url] : [] })}
        />
        <Field label="Name" value={form.name ?? ''} onChange={(v) => setForm({ ...form, name: v, slug: slugify(v) })} />
        <Field label="Slug" value={form.slug ?? ''} onChange={(v) => setForm({ ...form, slug: v })} />
        <Field label="Category" value={form.category ?? ''} onChange={(v) => setForm({ ...form, category: v })} />
        <Field label="Brand" value={form.brand ?? ''} onChange={(v) => setForm({ ...form, brand: v })} />
        <Field
          label="Price"
          value={String(form.price ?? 0)}
          onChange={(v) => setForm({ ...form, price: Number(v) || 0 })}
        />
        <Field
          label="Short description"
          value={form.shortDescription ?? ''}
          onChange={(v) => setForm({ ...form, shortDescription: v })}
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={!!form.inStock}
            onChange={(e) => setForm({ ...form, inStock: e.target.checked })}
          />
          In stock
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={!!form.bestseller}
            onChange={(e) => setForm({ ...form, bestseller: e.target.checked })}
          />
          Bestseller
        </label>
        <div className="flex gap-2 pt-1">
          <button type="submit" className="btn-primary flex-1">
            Save product
          </button>
          {editingId && (
            <button
              type="button"
              className="btn-outline"
              onClick={() => {
                setEditingId(null)
                setForm(empty)
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="label">{label}</label>
      <input className="input" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}
