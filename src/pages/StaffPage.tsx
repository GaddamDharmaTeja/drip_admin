import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { api, type CreatedUser } from '../lib/api'

const roleHelp: Record<string, string> = {
  OWNER: 'Full control, staff management, settings, and audit visibility.',
  ADMIN: 'Catalog, plans, projects, orders, customer requests, and quotations.',
  MAINTENANCE: 'Order fulfilment and service-request progress only.',
  SERVICE: 'Customer requests and quotations only.',
}

export function StaffPage() {
  const { role } = useAuth()
  const [staff, setStaff] = useState<CreatedUser[]>([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ displayName: '', username: '', email: '', password: '', role: 'SERVICE' })
  const load = async () => { try { setStaff(await api.staff()) } catch (err) { setError(err instanceof Error ? err.message : 'Could not load staff accounts.') } }
  useEffect(() => { void load() }, [])
  if (role !== 'OWNER') return <Navigate to="/" replace />
  async function create(e: React.FormEvent) { e.preventDefault(); setSaving(true); setError(''); try { const created = await api.createUser(form); setStaff((current) => [...current, created]); setForm({ displayName: '', username: '', email: '', password: '', role: 'SERVICE' }) } catch (err) { setError(err instanceof Error ? err.message : 'Could not create the staff account.') } finally { setSaving(false) } }
  async function toggle(user: CreatedUser) { try { const updated = await api.setStaffActive(user.id, !user.active); setStaff((current) => current.map((item) => item.id === user.id ? updated : item)) } catch (err) { setError(err instanceof Error ? err.message : 'Could not update the account.') } }
  return <div className="max-w-6xl"><p className="eyebrow">Owner controls</p><h1 className="font-display text-3xl text-forest">Team access and permissions</h1><p className="mt-2 max-w-3xl text-stone-600">Create staff accounts, choose a job role, and disable access immediately when someone no longer needs it. The permissions listed below are enforced by the API.</p><div className="mt-8 grid gap-8 xl:grid-cols-[380px_1fr]"><form className="card h-fit space-y-4" onSubmit={(e) => void create(e)}><div><h2 className="font-display text-2xl text-forest">Add staff account</h2><p className="mt-1 text-sm text-stone-600">Passwords must contain at least 8 characters.</p></div><Field label="Staff member name" value={form.displayName} onChange={(displayName) => setForm({ ...form, displayName })} /><Field label="Username" value={form.username} onChange={(username) => setForm({ ...form, username })} /><Field label="Work email" type="email" value={form.email} onChange={(email) => setForm({ ...form, email })} /><Field label="Temporary password" type="password" value={form.password} onChange={(password) => setForm({ ...form, password })} /><div><label className="label">Access role</label><select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>{Object.keys(roleHelp).filter((item) => item !== 'OWNER').map((item) => <option key={item} value={item}>{item[0] + item.slice(1).toLowerCase()}</option>)}</select><p className="mt-1 text-xs text-stone-500">{roleHelp[form.role]}</p></div>{error && <p className="text-sm font-medium text-red-700">{error}</p>}<button className="btn-primary w-full" disabled={saving}>{saving ? 'Creating account…' : 'Create staff account'}</button></form><section className="card overflow-hidden"><div className="border-b border-leaf/10 px-6 py-5"><h2 className="font-display text-2xl text-forest">All staff accounts</h2><p className="mt-1 text-sm text-stone-600">Owner-only view of every team login and its access level.</p></div><div className="overflow-x-auto"><table className="w-full min-w-[660px] text-left text-sm"><thead className="bg-mist/40 text-stone-600"><tr><th className="px-5 py-3">Staff member</th><th className="px-5 py-3">Role</th><th className="px-5 py-3">Allowed areas</th><th className="px-5 py-3">Access</th></tr></thead><tbody>{staff.map((user) => <tr key={user.id} className="border-t border-leaf/10"><td className="px-5 py-4"><strong>{user.displayName || user.username}</strong><span className="block text-xs text-stone-500">{user.username} · {user.email || 'No email provided'}</span></td><td className="px-5 py-4"><span className="rounded-full bg-mist px-3 py-1 text-xs font-bold text-forest">{user.role}</span></td><td className="px-5 py-4 text-xs text-stone-600">{user.permissions.join(', ')}</td><td className="px-5 py-4"><button type="button" onClick={() => void toggle(user)} className={user.active ? 'btn-outline !px-3 !py-1.5 text-xs' : 'btn-primary !px-3 !py-1.5 text-xs'}>{user.active ? 'Disable access' : 'Enable access'}</button></td></tr>)}</tbody></table></div></section></div></div>
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) { return <div><label className="label">{label}</label><input required minLength={type === 'password' ? 8 : undefined} className="input" type={type} value={value} onChange={(e) => onChange(e.target.value)} /></div> }
