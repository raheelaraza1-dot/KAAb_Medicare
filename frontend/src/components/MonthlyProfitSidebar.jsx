import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from '../../../lib/framer-motion.jsx'
import { ChevronRight, TrendingUp, X } from 'lucide-react'
import { api } from '../api/client.js'
import { formatMoney, getCompletedMonths, isoDate } from '../lib/format.js'

export function MonthlyProfitSidebar() {
  const [open, setOpen] = useState(false)
  const [months, setMonths] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return undefined
    let live = true
    async function load() {
      setLoading(true)
      try {
        const ranges = getCompletedMonths(12)
        const results = await Promise.all(
          ranges.map(async (m) => {
            const res = await api.summary(isoDate(m.start), isoDate(m.end))
            return { label: m.label, profit: res.data?.summary?.totalProfit || 0 }
          }),
        )
        if (live) setMonths(results)
      } catch {
        if (live) setMonths([])
      } finally {
        if (live) setLoading(false)
      }
    }
    load()
    return () => {
      live = false
    }
  }, [open])

  const total = months.reduce((sum, m) => sum + m.profit, 0)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mx-3 mb-2 flex w-[calc(100%-1.5rem)] items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 transition-all duration-200 hover:bg-gray-50 hover:text-black"
      >
        <TrendingUp className="h-4 w-4 text-emerald-600" />
        Monthly Profit
        <ChevronRight className="ml-auto h-4 w-4 text-gray-400" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-end bg-black/40 p-4 backdrop-blur-sm sm:place-items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button type="button" className="absolute inset-0" onClick={() => setOpen(false)} aria-label="Close" />
            <motion.div
              initial={{ y: 40, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <div className="flex items-center gap-2">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-50">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Monthly Profit</h3>
                    <p className="text-xs text-gray-500">Last 12 completed months</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-black"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto px-5 py-4">
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-10 animate-pulse rounded-xl bg-gray-100" />
                    ))}
                  </div>
                ) : months.length === 0 ? (
                  <p className="py-6 text-center text-sm text-gray-500">No profit data available yet.</p>
                ) : (
                  <ul className="space-y-1">
                    {months.map((m, i) => (
                      <motion.li
                        key={m.label}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="flex items-center justify-between rounded-xl px-3 py-2.5 transition-colors hover:bg-gray-50"
                      >
                        <span className="text-sm text-gray-600">{m.label}</span>
                        <span className="text-sm font-semibold text-emerald-700">{formatMoney(m.profit)}</span>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </div>

              {!loading && months.length > 0 && (
                <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/80 px-5 py-3">
                  <span className="text-sm font-medium text-gray-600">Total</span>
                  <span className="text-base font-bold text-emerald-700">{formatMoney(total)}</span>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
