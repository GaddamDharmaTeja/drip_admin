const API_BASE = import.meta.env.VITE_API_URL ?? '/api'
const TOKEN_KEY = 'dripgrow-admin-token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as Record<string, string> | undefined),
  }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers })
  if (res.status === 401) {
    setToken(null)
    if (!path.includes('/auth/login')) {
      window.location.href = '/login'
    }
  }
  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const body = (await res.json()) as { message?: string }
      if (body.message) message = body.message
    } catch {
      /* ignore */
    }
    throw new Error(message)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export type UploadResult = {
  id: string
  filename: string
  contentType: string
  size: number
  url: string
}

/**
 * Absolute URL for GridFS / API file paths.
 * On Render, relative `/api/files/...` would hit the static admin host and 404 —
 * rewrite those to the API origin when VITE_API_URL is set.
 */
export function fileUrl(pathOrUrl?: string | null) {
  if (!pathOrUrl) return ''
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) return pathOrUrl

  const apiRoot = API_BASE.replace(/\/$/, '')
  const apiOrigin = apiRoot.startsWith('http') ? apiRoot.replace(/\/api$/, '') : ''

  if (pathOrUrl.startsWith('/api/') || pathOrUrl.startsWith('/')) {
    return apiOrigin ? `${apiOrigin}${pathOrUrl}` : pathOrUrl
  }
  return `${apiRoot}/files/${pathOrUrl}`
}

export async function uploadImage(file: File): Promise<UploadResult> {
  const form = new FormData()
  form.append('file', file)
  const headers: Record<string, string> = {}
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API_BASE}/admin/uploads`, {
    method: 'POST',
    headers,
    body: form,
  })
  if (res.status === 401) {
    setToken(null)
    window.location.href = '/login'
  }
  if (!res.ok) {
    let message = `Upload failed (${res.status})`
    try {
      const body = (await res.json()) as { message?: string }
      if (body.message) message = body.message
    } catch {
      /* ignore */
    }
    throw new Error(message)
  }
  return res.json() as Promise<UploadResult>
}

export const api = {
  login: (username: string, password: string) =>
    request<{ token: string; expiresIn: number; username: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  uploadImage,
  dashboard: () =>
    request<{
      products: number
      orders: number
      newRequests: number
      openQuotations: number
      outOfStock: number
    }>('/admin/dashboard'),
  products: () => request<Product[]>('/admin/products'),
  createProduct: (body: Partial<Product>) =>
    request<Product>('/admin/products', { method: 'POST', body: JSON.stringify(body) }),
  updateProduct: (id: string, body: Partial<Product>) =>
    request<Product>(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteProduct: (id: string) =>
    request<void>(`/admin/products/${id}`, { method: 'DELETE' }),
  orders: () => request<Order[]>('/admin/orders'),
  updateOrder: (orderNumber: string, body: { status?: string; adminNotes?: string }) =>
    request<Order>(`/admin/orders/${encodeURIComponent(orderNumber)}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  irrigationPlans: () => request<IrrigationPlan[]>('/admin/irrigation-plans'),
  saveIrrigationPlan: (body: Partial<IrrigationPlan>, id?: string) =>
    id
      ? request<IrrigationPlan>(`/admin/irrigation-plans/${id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        })
      : request<IrrigationPlan>('/admin/irrigation-plans', {
          method: 'POST',
          body: JSON.stringify(body),
        }),
  deleteIrrigationPlan: (id: string) =>
    request<void>(`/admin/irrigation-plans/${id}`, { method: 'DELETE' }),
  projectPlans: () => request<ProjectPlan[]>('/admin/project-plans'),
  saveProjectPlan: (body: Partial<ProjectPlan>, id?: string) =>
    id
      ? request<ProjectPlan>(`/admin/project-plans/${id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        })
      : request<ProjectPlan>('/admin/project-plans', {
          method: 'POST',
          body: JSON.stringify(body),
        }),
  deleteProjectPlan: (id: string) =>
    request<void>(`/admin/project-plans/${id}`, { method: 'DELETE' }),
  projects: () => request<ProjectCase[]>('/admin/projects'),
  saveProject: (body: Partial<ProjectCase>, id?: string) =>
    id
      ? request<ProjectCase>(`/admin/projects/${id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        })
      : request<ProjectCase>('/admin/projects', {
          method: 'POST',
          body: JSON.stringify(body),
        }),
  deleteProject: (id: string) => request<void>(`/admin/projects/${id}`, { method: 'DELETE' }),
  requests: () => request<ServiceRequest[]>('/admin/requests'),
  updateRequest: (id: string, status: string) =>
    request<ServiceRequest>(`/admin/requests/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  convertQuote: (id: string, amount: number, notes?: string) =>
    request<Quotation>(`/admin/requests/${id}/convert-quote`, {
      method: 'POST',
      body: JSON.stringify({ amount, notes }),
    }),
  quotations: () => request<Quotation[]>('/admin/quotations'),
  createQuotation: (body: Partial<Quotation>) =>
    request<Quotation>('/admin/quotations', { method: 'POST', body: JSON.stringify(body) }),
  updateQuotation: (id: string, body: Partial<Quotation>) =>
    request<Quotation>(`/admin/quotations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  siteContact: () => request<SiteContact>('/admin/site-contact'),
  saveSiteContact: (body: Partial<SiteContact>) =>
    request<SiteContact>('/admin/site-contact', {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
}

export type SiteContact = {
  id: string
  title: string
  address: string
  email: string
  phone: string
  hours: string
}

export type Product = {
  id: string
  name: string
  slug: string
  category: string
  cropTypes: string[]
  brand: string
  price: number
  originalPrice?: number
  rating: number
  reviewCount: number
  image: string
  images: string[]
  bestseller?: boolean
  inStock: boolean
  shortDescription: string
  description: string
  specifications: Record<string, string>
  packageIncludes: string[]
  farmSizes: string[]
}

export type Order = {
  id: string
  mongoId: string
  createdAt: string
  items: Array<{ name: string; quantity: number; price: number }>
  address: { fullName: string; phone: string; city: string; state: string }
  total: number
  status: string
  paymentMethod: string
  adminNotes?: string
}

export type IrrigationPlan = {
  id: string
  name: string
  slug: string
  cropTypes: string[]
  farmSize: string
  price: number
  description: string
  active: boolean
  productIds?: string[]
}

export type ProjectPlan = {
  id: string
  name: string
  slug: string
  summary: string
  steps: string[]
  basePrice: number
  durationDays: number
  active: boolean
}

export type ProjectCase = {
  id: string
  title: string
  location: string
  crop: string
  area: string
  image: string
  summary: string
  published: boolean
}

export type ServiceRequest = {
  id: string
  type: string
  name: string
  email?: string
  phone?: string
  message?: string
  details?: Record<string, unknown>
  status: string
  createdAt: string
  updatedAt?: string
}

export type Quotation = {
  id: string
  requestId?: string
  customerName: string
  phone?: string
  email?: string
  notes?: string
  amount: number
  status: string
  createdAt: string
}

export function inr(n: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n)
}
