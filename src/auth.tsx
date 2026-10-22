import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { api, getToken, setToken } from './lib/api'

type AuthCtx = {
  token: string | null
  username: string | null
  role: string | null
  permissions: string[]
  login: (u: string, p: string) => Promise<void>
  logout: () => void
}

const Ctx = createContext<AuthCtx | null>(null)

function loadPermissions(): string[] {
  try {
    const saved = localStorage.getItem('dripgrow-admin-permissions')
    if (!saved) return []
    const parsed: unknown = JSON.parse(saved)
    return Array.isArray(parsed) && parsed.every((value) => typeof value === 'string') ? parsed : []
  } catch {
    return []
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTok] = useState<string | null>(() => getToken())
  const [username, setUsername] = useState<string | null>(
    () => localStorage.getItem('dripgrow-admin-user'),
  )
  const [role, setRole] = useState<string | null>(() => localStorage.getItem('dripgrow-admin-role'))
  const [permissions, setPermissions] = useState<string[]>(loadPermissions)

  const value = useMemo<AuthCtx>(
    () => ({
      token,
      username,
      role,
      permissions,
      async login(u, p) {
        const res = await api.login(u, p)
        setToken(res.token)
        setTok(res.token)
        localStorage.setItem('dripgrow-admin-user', res.username)
        localStorage.setItem('dripgrow-admin-role', res.role)
        localStorage.setItem('dripgrow-admin-permissions', JSON.stringify(res.permissions))
        setUsername(res.username)
        setRole(res.role)
        setPermissions(res.permissions)
      },
      logout() {
        setToken(null)
        setTok(null)
        localStorage.removeItem('dripgrow-admin-user')
        localStorage.removeItem('dripgrow-admin-role')
        localStorage.removeItem('dripgrow-admin-permissions')
        setUsername(null)
        setRole(null)
        setPermissions([])
      },
    }),
    [token, username, role, permissions],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth requires AuthProvider')
  return ctx
}
