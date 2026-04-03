import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { apiFetch, getToken, normalizeUser, setToken } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(() => getToken() == null)

  useEffect(() => {
    const token = getToken()
    if (!token) {
      return
    }
    let cancelled = false
    apiFetch('/api/user')
      .then((res) => {
        if (res.status === 401) {
          setToken(null)
          return null
        }
        if (!res.ok) {
          return null
        }
        return res.json()
      })
      .then((data) => {
        if (cancelled) {
          return
        }
        setUser(normalizeUser(data))
      })
      .catch(() => {
        if (!cancelled) {
          setUser(null)
        }
      })
      .finally(() => {
        if (!cancelled) {
          setReady(true)
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await apiFetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      const err = new Error(data.message ?? 'Login failed')
      err.payload = data
      throw err
    }
    setToken(data.token)
    setUser(normalizeUser(data.user))
  }, [])

  const register = useCallback(async (body) => {
    const res = await apiFetch('/api/register', {
      method: 'POST',
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      const err = new Error(data.message ?? 'Registration failed')
      err.payload = data
      throw err
    }
    setToken(data.token)
    setUser(normalizeUser(data.user))
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiFetch('/api/logout', { method: 'POST', body: '{}' })
    } catch {
      /* ignore */
    }
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      ready,
      login,
      register,
      logout,
      setUser,
    }),
    [user, ready, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
