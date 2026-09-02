import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../api/client'
import { clearToken, decodeToken, getStoredToken, isTokenExpired, storeToken } from '../lib/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const stored = getStoredToken()
    if (!stored || isTokenExpired(stored)) {
      clearToken()
      setToken(null)
    } else {
      setToken(stored)
    }
    setIsReady(true)
  }, [])

  const value = useMemo(() => {
    const payload = token ? decodeToken(token) : null
    return {
      token,
      email: payload?.email || '',
      isAuthenticated: Boolean(token),
      isReady,
      async login(email, password, remember) {
        const res = await api.login(email, password)
        const next = res.data.token
        storeToken(next, remember)
        setToken(next)
        return next
      },
      logout() {
        clearToken()
        setToken(null)
      },
    }
  }, [token, isReady])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
