import { useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { api, type Account, type CreateUserPayload } from '../lib/api'

const staffRoles = ['ADMIN', 'MAINTENANCE', 'SERVICE'] as const

export function StaffPage() {
  const { role } = useAuth()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [filter, setFilter] = useState<'ALL' | 'STAFF' | 'CUSTOMER'>('ALL')
  const [selected, setSelected] = useState<Account | null>(null)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [createForm, setCreateForm] = useState<CreateUserPayload>({ displayName: '', username: '', email: '', password: '', role: 'SERVICE' })

  const load = async () => {
    try { setAccounts(await api.accounts()) }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not load accounts.') }
  }

  useEffect(() => { void load() }, [])
  const visibleAccounts = useMemo(() => filter === 'ALL' ? accounts : accounts.filter((account) => account.type === filter), [accounts, filter])
  if (role !== 'OWNER') return <Navigate to="/" replace />

  async function createStaff(event: React.FormEvent) {
    event.preventDefault(); setError(''); setNotice('')
    try {
      const created = await api.createUser(createForm)
      setAccounts((current) => [...current, { ...created, type: 'STAFF', phone: null }])
      setCreateForm({ displayName: '', username: '', email: '', password: '', role: 'SERVICE' })
      setNotice('Staff account created and ready to sign in.')
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not create the staff account.') }
  }

  async function saveAccount(event: React.FormEvent) {
    event.preventDefault(); if (!selected) return
    setError(''); setNotice('')
    try {
      const updated = await api.updateAccount(selected, selected)
      setAccounts((current) => current.map((account) => account.id === updated.id && account.type === updated.type ? updated : account))
      setSelected(updated); setNotice('Account details saved.')
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not save account details.') }
  }

  async function changeStatus(account: Account) {
    try {
      const updated = await api.updateAccount(account, { active: !account.active })
      setAccounts((current) => current.map((item) => item.id === updated.id && item.type === updated.type ? updated : item))
      if (selected?.id === updated.id && selected.type === updated.type) setSelected(updated)
      setNotice(`${updated.displayName} is now ${updated.active ? 'Active' : 'Suspended'}.`)
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not update account status.') }
  }

  return (
    <div className="page-container">
      <div className="page-header"><div><p className="eyebrow">Owner controls</p><h1 className="page-title">Accounts and access</h1><p className="page-sub">View every customer and staff account, edit contact details and roles, and control who can sign in.</p></div></div>
      {(notice || error) && <p className={error ? 'rounded-xl bg-red-50 p-3 text-sm text-red-700' : 'rounded-xl bg-mist p-3 text-sm font-medium text-forest'}>{error || notice}</p>}
      <div className="mt-6 grid gap-6 xl:grid-cols-[360px_1fr]">
        <form className="card space-y-4" onSubmit={(event) => void createStaff(event)}>
          <div><h2 className="section-title">Create staff account</h2><p className="section-subtitle">Staff accounts use the role-based access rules set by the owner.</p></div>
          <TextField label="Staff name" value={createForm.displayName} onChange={(displayName) => setCreateForm({ ...createForm, displayName })} />
          <TextField label="Username" value={createForm.username} onChange={(username) => setCreateForm({ ...createForm, username })} />
          <TextField label="Work email" type="email" value={createForm.email} onChange={(email) => setCreateForm({ ...createForm, email })} />
          <TextField label="Temporary password" type="password" value={createForm.password} onChange={(password) => setCreateForm({ ...createForm, password })} />
          <RoleSelect value={createForm.role} onChange={(role) => setCreateForm({ ...createForm, role })} />
          <button className="btn-primary w-full">Create staff account</button>
        </form>
        <section className="card">
          <div className="card-header"><div><h2 className="section-title">All accounts</h2><p className="section-subtitle">{accounts.length} accounts across customers and your internal team.</p></div><div className="flex flex-wrap gap-2">{(['ALL', 'STAFF', 'CUSTOMER'] as const).map((item) => <button key={item} type="button" className={filter === item ? 'btn-primary !min-h-0 !px-3 !py-2 text-xs' : 'btn-outline !min-h-0 !px-3 !py-2 text-xs'} onClick={() => setFilter(item)}>{item === 'ALL' ? 'All' : item[0] + item.slice(1).toLowerCase()}</button>)}</div></div>
          <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">{visibleAccounts.map((account) => <AccountCard key={`${account.type}-${account.id}`} account={account} onEdit={setSelected} onStatus={changeStatus} />)}</div>
        </section>
      </div>
      {selected && <EditAccount account={selected} onChange={setSelected} onClose={() => setSelected(null)} onSave={saveAccount} />}
    </div>
  )
}

function AccountCard({ account, onEdit, onStatus }: { account: Account; onEdit: (account: Account) => void; onStatus: (account: Account) => void }) {
  return <article className="rounded-2xl border border-leaf/10 bg-white p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-soil">{account.displayName || account.username}</p><p className="mt-1 text-xs text-stone-500">{account.type === 'CUSTOMER' ? account.phone : account.username}</p></div><Status active={account.active} /></div><p className="mt-3 text-xs font-semibold uppercase tracking-wide text-leaf">{account.type === 'STAFF' ? account.role : 'Customer'}</p><p className="mt-2 min-h-10 text-xs text-stone-600">{account.email || 'No email on file'}</p><div className="mt-4 flex gap-2"><button type="button" className="btn-outline flex-1 !min-h-0 !px-3 !py-2 text-xs" onClick={() => onEdit(account)}>Edit details</button><button type="button" className={account.active ? 'btn-danger !min-h-0 !px-3 !py-2 text-xs' : 'btn-primary !min-h-0 !px-3 !py-2 text-xs'} onClick={() => void onStatus(account)}>{account.active ? 'Suspend' : 'Activate'}</button></div></article>
}

function EditAccount({ account, onChange, onClose, onSave }: { account: Account; onChange: (account: Account) => void; onClose: () => void; onSave: (event: React.FormEvent) => Promise<void> }) {
  return <div className="dialog-backdrop" role="presentation"><form className="dialog-panel" onSubmit={(event) => void onSave(event)}><div className="card-header"><div><h2 className="section-title">Edit {account.type === 'STAFF' ? 'staff' : 'customer'} account</h2><p className="section-subtitle">Account status changes apply immediately.</p></div><button type="button" className="btn-icon" aria-label="Close" onClick={onClose}>×</button></div><div className="form-grid"><TextField label="Full name" value={account.displayName} onChange={(displayName) => onChange({ ...account, displayName })} /><TextField label="Email" type="email" value={account.email ?? ''} onChange={(email) => onChange({ ...account, email })} />{account.type === 'CUSTOMER' ? <TextField label="Mobile number" value={account.phone ?? ''} onChange={(phone) => onChange({ ...account, phone })} /> : <RoleSelect value={account.role} onChange={(role) => onChange({ ...account, role })} />}</div><div className="dialog-footer"><button type="button" className="btn-outline" onClick={onClose}>Cancel</button><button className="btn-primary">Save account details</button></div></form></div>
}

function TextField({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) { return <div className="form-group"><label className="label">{label}</label><input required className="input" type={type} minLength={type === 'password' ? 8 : undefined} value={value} onChange={(event) => onChange(event.target.value)} /></div> }
function RoleSelect({ value, onChange }: { value: string; onChange: (value: string) => void }) { return <div className="form-group"><label className="label">Role and access</label><select className="input" value={value} onChange={(event) => onChange(event.target.value)}>{staffRoles.map((role) => <option key={role}>{role}</option>)}</select></div> }
function Status({ active }: { active: boolean }) { return <span className={active ? 'rounded-full bg-mist px-2 py-1 text-xs font-bold text-forest' : 'rounded-full bg-red-50 px-2 py-1 text-xs font-bold text-red-700'}>{active ? 'Active' : 'Suspended'}</span> }
