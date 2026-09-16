import { motion } from 'framer-motion'

export const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
}

export const stagger = {
  animate: { transition: { staggerChildren: 0.07 } },
}

export function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

export function StatCard({ icon, label, value, badge, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
      className="rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-shadow"
    >
      {icon && (
        <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-gray-100 text-gray-800">
          {icon}
        </div>
      )}
      <p className="text-xs font-semibold tracking-wide text-gray-500">{label}</p>
      <div className="mt-1.5 flex items-end justify-between gap-3">
        <p className="text-2xl font-extrabold tracking-tight text-gray-900">{value}</p>
        {badge}
      </div>
    </motion.div>
  )
}

export function Avatar({ name, size = 'md' }) {
  const sizes = { sm: 'h-8 w-8 text-[11px]', md: 'h-10 w-10 text-sm', lg: 'h-16 w-16 text-xl' }
  const initials = String(name || 'P')
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
  return (
    <span className={`grid shrink-0 place-items-center rounded-full bg-gray-200 font-semibold text-gray-700 ${sizes[size]}`}>
      {initials || 'P'}
    </span>
  )
}

export function Badge({ children, tone = 'gray' }) {
  const tones = {
    gray: 'bg-gray-100 text-gray-700',
    green: 'bg-emerald-50 text-emerald-700',
    red: 'bg-rose-50 text-rose-700',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  )
}

export function EmptyState({ title, body }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-14 text-center">
      <p className="font-semibold text-gray-900">{title}</p>
      <p className="mt-1 text-sm text-gray-500">{body}</p>
    </div>
  )
}

export function Loader() {
  return (
    <div className="flex items-center justify-center py-16">
      <motion.div
        className="h-8 w-8 rounded-full border-2 border-gray-200 border-t-black"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  )
}

export function Pagination({ page, pages, total, pageSize, onPage }) {
  if (total === 0) return null
  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)
  const nums = Array.from({ length: pages }, (_, i) => i + 1).slice(0, 5)
  return (
    <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
      <p>
        Showing {start} to {end} of {total.toLocaleString()} entries
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page === 1}
          onClick={() => onPage(page - 1)}
          className="rounded-lg px-3 py-1.5 hover:bg-gray-100 disabled:opacity-40"
        >
          Prev
        </button>
        {nums.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onPage(n)}
            className={`h-8 w-8 rounded-lg text-sm font-medium ${n === page ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          disabled={page === pages}
          onClick={() => onPage(page + 1)}
          className="rounded-lg px-3 py-1.5 hover:bg-gray-100 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  )
}
