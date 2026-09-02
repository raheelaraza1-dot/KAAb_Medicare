import { NavLink, useLocation, useNavigate } from '../../../lib/react-router-dom.jsx'
import { AnimatePresence, motion } from '../../../lib/framer-motion.jsx'
import {
  BarChart3,
  Bell,
  CalendarPlus,
  CircleHelp,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import { Logo } from '../components/Logo.jsx'
import { MonthlyProfitSidebar } from '../components/MonthlyProfitSidebar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useState } from 'react'

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/patients', label: 'Patients', icon: Users },
  { to: '/patients/new', label: 'Add Patient', icon: UserPlus },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
]

function NavItems({ onNavigate }) {
  return (
    <nav className="flex flex-1 flex-col gap-1 px-3">
      {nav.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
              isActive ? 'bg-gray-100 text-black shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-black'
            }`
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.span
                  layoutId="nav-pill"
                  className="absolute inset-y-1 left-0 w-[3px] rounded-full bg-black"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <item.icon className="h-4 w-4" />
              {item.label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}

export function AppLayout({ children, onSearch, searchPlaceholder = 'Search patients, reports...' }) {
  const { logout, email } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  function submitSearch(e) {
    e.preventDefault()
    if (onSearch) onSearch(query)
    else navigate(`/patients?q=${encodeURIComponent(query)}`)
    setOpen(false)
  }

  return (
    <div className="min-h-screen bg-[#f6f7f9]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] flex-col border-r border-gray-200 bg-white lg:flex">
        <div className="px-5 py-5">
          <Logo />
        </div>
        <NavItems />
        <div className="mt-auto border-t border-gray-100 pt-3">
          <MonthlyProfitSidebar />
        </div>
        <button
          type="button"
          onClick={() => {
            logout()
            navigate('/login')
          }}
          className="m-4 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </aside>

      <div className="lg:pl-[260px]">
        <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-3 lg:px-8">
            <button
              type="button"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-gray-200 transition-colors hover:bg-gray-50 lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5 text-gray-900" />
            </button>
            <div className="min-w-0 lg:hidden">
              <h1 className="truncate text-base font-bold tracking-tight text-gray-900">KAAB Medicare</h1>
            </div>
            <h1 className="hidden text-lg font-bold tracking-tight text-gray-900 lg:block">KAAB Medicare</h1>
            <form onSubmit={submitSearch} className="relative mx-auto hidden max-w-xl flex-1 md:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full rounded-full border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-black focus:bg-white focus:shadow-sm"
              />
            </form>
            <div className="ml-auto flex shrink-0 items-center gap-2">
              <button type="button" className="grid h-10 w-10 place-items-center rounded-full text-gray-600 transition-colors hover:bg-gray-100" aria-label="Notifications">
                <Bell className="h-5 w-5" />
              </button>
              <button type="button" className="hidden h-10 w-10 place-items-center rounded-full text-gray-600 transition-colors hover:bg-gray-100 sm:grid" aria-label="Help">
                <CircleHelp className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  logout()
                  navigate('/login')
                }}
                className="hidden text-sm font-medium text-gray-600 transition-colors hover:text-black sm:block"
              >
                Logout
              </button>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-black text-xs font-semibold text-white shadow-sm" title={email}>
                {(email?.[0] || 'A').toUpperCase()}
              </span>
            </div>
          </div>
          <form onSubmit={submitSearch} className="relative border-t border-gray-100 px-4 py-2 md:hidden">
            <Search className="pointer-events-none absolute left-7 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-black focus:bg-white"
            />
          </form>
        </header>

        <main className="px-4 py-6 pb-24 lg:px-8 lg:pb-8">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-gray-200 bg-white/95 px-2 py-2 backdrop-blur lg:hidden">
        {nav.slice(0, 4).map((item) => {
          const active = item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={`flex flex-col items-center gap-1 rounded-xl py-2 text-[11px] transition-colors ${active ? 'bg-gray-100 font-semibold text-black' : 'text-gray-500'}`}
            >
              <item.icon className="h-4 w-4" />
              {item.label.replace('Add Patient', 'Add')}
            </NavLink>
          )
        })}
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-40 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button type="button" className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} aria-label="Close menu" />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 380, damping: 34 }}
              className="absolute inset-y-0 left-0 flex w-[270px] flex-col bg-white shadow-xl"
            >
              <div className="flex items-center justify-between px-4 py-4">
                <Logo compact />
                <button type="button" onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-gray-100">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <NavItems onNavigate={() => setOpen(false)} />
              <div className="mt-auto border-t border-gray-100 pt-3">
                <MonthlyProfitSidebar />
              </div>
              <NavLink to="/settings" onClick={() => setOpen(false)} className="mx-3 mb-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-gray-600 transition-colors hover:bg-gray-50">
                <Settings className="h-4 w-4" />
                Settings
              </NavLink>
              <NavLink to="/patients/new" onClick={() => setOpen(false)} className="mx-3 mb-4 flex items-center gap-3 rounded-xl bg-black px-3 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90">
                <CalendarPlus className="h-4 w-4" />
                New visit
              </NavLink>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
