import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { api } from '../lib/api'

export function Login() {
  const { token, login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('Admin@123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [recoveryOpen, setRecoveryOpen] = useState(false)
  const [recoveryEmail, setRecoveryEmail] = useState('')
  const [recoveryMessage, setRecoveryMessage] = useState('')

  if (token) return <Navigate to="/" replace />

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(username, password)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  async function submitRecovery(e: FormEvent) {
    e.preventDefault()
    if (!username.trim() || !recoveryEmail.trim()) { setRecoveryMessage('Enter your admin username and registered email address.'); return }
    try {
      await api.passwordRecovery(username.trim(), recoveryEmail.trim())
      setRecoveryMessage('Recovery request sent. The account owner will verify your identity before resetting access.')
    } catch (err) { setRecoveryMessage(err instanceof Error ? err.message : 'Could not submit your recovery request.') }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={(e) => void onSubmit(e)} className="card w-full max-w-md">
        <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-leaf text-sm font-bold text-white">
          DG
        </div>
        <p className="font-display text-3xl text-forest">DripGrow Admin</p>
        <p className="mt-1 text-sm text-stone-600">
          Manage catalog, orders, and media stored in MongoDB GridFS.
        </p>
        <div className="mt-6 space-y-4">
          <div>
            <label className="label">Username</label>
            <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-sm font-medium text-red-600">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
          <button type="button" className="w-full text-center text-sm font-semibold text-leaf hover:text-forest" onClick={() => { setRecoveryOpen(true); setRecoveryMessage('') }}>
            Forgot password?
          </button>
        </div>
      </form>
      {recoveryOpen && <div className="dialog-backdrop"><form className="dialog-panel" onSubmit={(event) => void submitRecovery(event)}><div className="dialog-header"><div><p className="text-xs font-semibold uppercase tracking-wide text-leaf">Admin recovery</p><h2 className="mt-1 font-display text-2xl text-forest">Recover admin access</h2></div><button type="button" className="text-2xl text-stone-400" onClick={() => setRecoveryOpen(false)}>×</button></div><p className="text-sm text-stone-600">Submit a support request. A reset code is not sent automatically; the owner verifies access first.</p><div className="mt-5 space-y-4"><div><label className="label">Admin username</label><input required className="input" value={username} onChange={(event) => setUsername(event.target.value)} /></div><div><label className="label">Registered email address</label><input required className="input" type="email" value={recoveryEmail} onChange={(event) => setRecoveryEmail(event.target.value)} /></div>{recoveryMessage && <p className="rounded-lg bg-mist px-3 py-2 text-sm text-forest">{recoveryMessage}</p>}<button className="btn-primary w-full">Send recovery request</button></div></form></div>}
    </div>
  )
}
