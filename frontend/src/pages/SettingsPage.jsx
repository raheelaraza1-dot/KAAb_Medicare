import { useEffect, useState } from 'react'
import { useNavigate } from '../../../lib/react-router-dom.jsx'
import { AppLayout } from '../layouts/AppLayout.jsx'
import { PageTransition } from '../components/ui.jsx'
import { API_URL, api } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'

export default function SettingsPage() {
  const navigate = useNavigate()
  const { email, logout } = useAuth()
  const [health, setHealth] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .health()
      .then(setHealth)
      .catch((err) => setError(err.message))
  }, [])

  return (
    <AppLayout>
      <PageTransition>
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Settings</h2>
        <p className="mt-1 text-sm text-gray-500">Session, clinic API status, and workspace preferences.</p>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <section className="rounded-2xl border border-gray-200 bg-white p-5">
            <h3 className="font-semibold text-gray-900">Administrator</h3>
            <p className="mt-3 text-sm text-gray-500">Signed in as</p>
            <p className="mt-1 font-medium text-gray-900">{email || 'Admin'}</p>
            <p className="mt-4 text-sm text-gray-500">
              JWT sessions last 8 hours. Use remember-me on login to persist the token in this browser.
            </p>
            <button
              type="button"
              onClick={() => {
                logout()
                navigate('/login')
              }}
              className="mt-5 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
            >
              Sign out
            </button>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5">
            <h3 className="font-semibold text-gray-900">API connection</h3>
            <p className="mt-3 text-sm text-gray-500">Backend URL</p>
            <p className="mt-1 break-all font-medium text-gray-900">{API_URL}</p>
            {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
            {health && (
              <p className="mt-3 text-sm text-gray-900">
                Status: <span className="font-semibold">{health.status}</span> · Database:{' '}
                <span className="font-semibold">{health.database}</span>
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 lg:col-span-2">
            <h3 className="font-semibold text-gray-900">Clinic workspace</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              KAAB Medicare is a single-admin clinic system. Patient search uses the API text index on name and phone.
              Medicine profit is always calculated on the server as (selling price − trade price) × quantity.
            </p>
          </section>
        </div>
      </PageTransition>
    </AppLayout>
  )
}
