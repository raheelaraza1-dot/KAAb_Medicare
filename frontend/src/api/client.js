import { clearToken, getStoredToken, isTokenExpired } from '../lib/auth'

function resolveApiUrl() {
  const fromVite =
    typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL !== undefined
      ? String(import.meta.env.VITE_API_URL)
      : undefined
  const fromNext =
    typeof process !== 'undefined' && process.env && process.env.NEXT_PUBLIC_API_URL !== undefined
      ? String(process.env.NEXT_PUBLIC_API_URL)
      : undefined

  if (fromVite !== undefined) return fromVite.replace(/\/$/, '')
  if (fromNext !== undefined) return fromNext.replace(/\/$/, '')
  return 'http://localhost:4000'
}

export const API_URL = resolveApiUrl()

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
    response = await fetch(`${API_URL}${path}`, {
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
  patients: (search = '') => {
    const q = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : ''
    return request(`/api/patients${q}`)
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
