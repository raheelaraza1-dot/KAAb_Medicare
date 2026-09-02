const TOKEN_KEY = 'cab_medicare_token'
const REMEMBER_KEY = 'cab_medicare_remember'

function canUseStorage() {
  return typeof window !== 'undefined'
}

export function getStoredToken() {
  if (!canUseStorage()) return null
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)
}

export function storeToken(token, remember) {
  if (!canUseStorage()) return
  clearToken()
  const storage = remember ? localStorage : sessionStorage
  storage.setItem(TOKEN_KEY, token)
  localStorage.setItem(REMEMBER_KEY, remember ? '1' : '0')
}

export function clearToken() {
  if (!canUseStorage()) return
  localStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
}

export function decodeToken(token) {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
  } catch {
    return null
  }
}

export function isTokenExpired(token) {
  const payload = decodeToken(token)
  if (!payload?.exp) return false
  return payload.exp * 1000 <= Date.now()
}
