import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react'
import { Logo, LogoMark } from '../components/Logo.jsx'
import { useAuth } from '../context/AuthContext.jsx'

function LoginLoader() {
  return (
    <div className="grid min-h-screen place-items-center text-sm text-gray-500">
      Loading…
    </div>
  )
}

export default function LoginPage() {
  const { isAuthenticated, isReady, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isReady) return <LoginLoader />
  if (isAuthenticated) return <Navigate to="/" replace />

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email.trim(), password, remember)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message || 'Unable to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page relative min-h-screen overflow-hidden">
      <div className="login-bg-image pointer-events-none absolute inset-0" />
      <div className="login-overlay pointer-events-none absolute inset-0" />
      <motion.div
        className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-white/10 blur-3xl"
        animate={{ y: [0, 18, 0], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pointer-events-none absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-black/20 blur-3xl"
        animate={{ y: [0, -16, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-4 py-10 lg:grid-cols-2 lg:px-8">
        <motion.div
          initial={{ opacity: 0, x: -32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="hidden lg:block"
        >
          <Logo light />
          <h1 className="mt-10 max-w-lg text-5xl font-extrabold leading-[1.08] tracking-tight text-white drop-shadow-sm lg:text-6xl">
            Care, records, and clinic profit — in one place.
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-white/80">
            Sign in to manage patients, prescribe medicines, and review daily performance with a calm, clinical workspace.
          </p>
          <div className="mt-10 grid max-w-md grid-cols-3 gap-3">
            {[
              ['Patients', 'Secure records'],
              ['Visits', 'Prescriptions'],
              ['Reports', 'Live profit'],
            ].map(([title, sub], i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md transition-shadow hover:shadow-lg"
              >
                <p className="text-sm font-bold text-white">{title}</p>
                <p className="mt-1 text-xs text-white/70">{sub}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto w-full max-w-[460px]"
        >
          <div className="rounded-3xl border border-white/30 bg-white/95 p-8 shadow-[0_32px_100px_rgba(0,0,0,0.25)] backdrop-blur-xl">
            <div className="flex justify-center">
              <motion.div
                whileHover={{ rotate: 5, scale: 1.05 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="grid h-16 w-16 place-items-center rounded-2xl bg-black text-white shadow-lg"
              >
                <LogoMark className="h-8 w-8" />
              </motion.div>
            </div>
            <div className="mt-4 text-center lg:hidden">
              <p className="text-base font-bold tracking-tight">KAAB Medicare</p>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-gray-900">Welcome Back</h2>
            <p className="mt-2 text-center text-base text-gray-500">
              Enter your credentials to access KAAB Medicare.
            </p>

            <div className="my-7 h-px bg-gray-100" />

            <form onSubmit={onSubmit} className="space-y-5">
              <label className="block text-sm font-semibold text-gray-800">
                Admin ID or Email
                <div className="relative mt-2">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@kaabmedicare.com"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/80 py-3.5 pl-11 pr-3 text-base transition-all duration-200 focus:border-black focus:bg-white focus:shadow-sm"
                  />
                </div>
              </label>

              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-gray-800">Password</span>
                  <button
                    type="button"
                    className="text-gray-500 transition-colors hover:text-black"
                    onClick={() => setError('Password resets are handled by IT Helpdesk. Contact your administrator.')}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative mt-2">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type={show ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50/80 py-3.5 pl-11 pr-11 text-base transition-all duration-200 focus:border-black focus:bg-white focus:shadow-sm"
                  />
                  <button
                    type="button"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-black"
                    onClick={() => setShow((v) => !v)}
                    aria-label={show ? 'Hide password' : 'Show password'}
                  >
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2.5 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                Remember me for 30 days
              </label>

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="rounded-xl bg-rose-50 px-3 py-2.5 text-sm text-rose-700"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <motion.button
                whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-black py-3.5 text-base font-semibold text-white transition-shadow disabled:opacity-60"
              >
                <ShieldCheck className="h-4 w-4" />
                {loading ? 'Signing in…' : 'Sign in to Dashboard'}
              </motion.button>
            </form>

            <p className="mt-7 text-center text-sm text-gray-500">
              Need technical support?{' '}
              <a href="mailto:it@kaabmedicare.com" className="font-semibold text-black transition-colors hover:underline">
                Contact IT Helpdesk
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
