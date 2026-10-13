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
  login: (u: string, p: string) => Promise<void>
  logout: () => void
}

const Ctx = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTok] = useState<string | null>(() => getToken())
  const [username, setUsername] = useState<string | null>(
    () => localStorage.getItem('dripgrow-admin-user'),
  )

  const value = useMemo<AuthCtx>(
    () => ({
      token,
      username,
      async login(u, p) {
        const res = await api.login(u, p)
        setToken(res.token)
        setTok(res.token)
        localStorage.setItem('dripgrow-admin-user', res.username)
        setUsername(res.username)
      },
      logout() {
        setToken(null)
        setTok(null)
        localStorage.removeItem('dripgrow-admin-user')
        setUsername(null)
      },
    }),
    [token, username],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth requires AuthProvider')
  return ctx
}
