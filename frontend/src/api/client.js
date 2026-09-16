import { clearToken, getStoredToken, isTokenExpired } from '../lib/auth'

function readEnv(name) {
  try {
    const vite = import.meta.env?.[name]
    if (vite !== undefined && vite !== '') return String(vite)
  } catch {
    // Vite env is unavailable when this file is bundled by Next.js.
  }
  try {
    const next = typeof process !== 'undefined' ? process.env?.[name] : undefined
    if (next !== undefined && next !== '') return String(next)
  } catch {
    // process.env is unavailable in some browser builds.
  }
  return undefined
}

function isLocalHost(hostname) {
  return hostname === 'localhost' || hostname === '127.0.0.1'
}

function isLocalUrl(url) {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(url)
}

function resolveApiUrl() {
  const fromEnv = readEnv('VITE_API_URL') ?? readEnv('NEXT_PUBLIC_API_URL')
  let url = (fromEnv ?? '').replace(/\/$/, '')

  const onDeployedHost =
    typeof window !== 'undefined' && !isLocalHost(window.location.hostname)

  // Deployed Vercel UI must use same-origin /api — never the developer's machine.
  if (onDeployedHost && (!url || isLocalUrl(url))) {
    return ''
  }

  if (url) return url

  const prod =
    (typeof import.meta !== 'undefined' && import.meta.env?.PROD) ||
    (typeof process !== 'undefined' && process.env?.NODE_ENV === 'production')

  return prod ? '' : 'http://localhost:4000'
}

export function getApiUrl() {
  const url = resolveApiUrl()
  if (url) return url
  if (typeof window !== 'undefined') return window.location.origin
  return ''
}

export const API_URL = getApiUrl()

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message)
    this.status = status
    this.payload = payload
  }
}

async function request(path, { method = 'GET', body, token } = {}) {
  const authToken = token ?? getStoredToken()
  if (authToken && isTokenExpired(authToken)) {
    clearToken()
    throw new ApiError('Session expired. Please sign in again.', 401)
  }

  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (authToken) headers.Authorization = `Bearer ${authToken}`

  let response
  try {
    response = await fetch(`${resolveApiUrl()}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('Unable to reach the KAAB Medicare API. Confirm the backend is running.', 0)
  }

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new ApiError(payload?.error?.message || 'Request failed', response.status, payload)
  }
  return payload
}

export const api = {
  health: () => request('/health', { token: null }),
  login: (email, password) =>
    request('/api/auth/login', { method: 'POST', body: { email, password }, token: null }),
  patients: (search = '', { limit } = {}) => {
    const params = new URLSearchParams()
    if (search.trim()) params.set('search', search.trim())
    if (limit) params.set('limit', String(limit))
    const q = params.toString()
    return request(`/api/patients${q ? `?${q}` : ''}`)
  },
  createPatient: (data) => request('/api/patients', { method: 'POST', body: data }),
  patient: (id) => request(`/api/patients/${id}`),
  updatePatient: (id, data) => request(`/api/patients/${id}`, { method: 'PUT', body: data }),
  deletePatient: (id) => request(`/api/patients/${id}`, { method: 'DELETE' }),
  createVisit: (id, data) => request(`/api/patients/${id}/visits`, { method: 'POST', body: data }),
  updateVisit: (patientId, visitId, data) =>
    request(`/api/patients/${patientId}/visits/${visitId}`, { method: 'PUT', body: data }),
  deleteVisit: (patientId, visitId) =>
    request(`/api/patients/${patientId}/visits/${visitId}`, { method: 'DELETE' }),
  searchMedicines: (q) => {
    const term = String(q || '').trim()
    if (!term) return Promise.resolve({ data: [] })
    return request(`/api/medicines/search?q=${encodeURIComponent(term)}`)
  },
  summary: (from, to) => {
    const params = new URLSearchParams()
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    const q = params.toString()
    return request(`/api/reports/summary${q ? `?${q}` : ''}`)
  },
}
