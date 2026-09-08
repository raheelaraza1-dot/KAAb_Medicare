import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from '../../../lib/framer-motion.jsx'
import { ChevronRight, X } from 'lucide-react'
import { api } from '../api/client.js'
import { formatMoney, getMonthsOfYear, isoDate } from '../lib/format.js'

const REPORT_YEAR = 2026

const ACCENTS = {
  emerald: {
    icon: 'text-emerald-600',
    iconBg: 'bg-emerald-50',
    highlight: 'bg-emerald-50',
    highlightText: 'text-emerald-600',
    valueText: 'text-emerald-700',
    selected: 'bg-emerald-50 ring-1 ring-emerald-200',
    selectedValue: 'text-emerald-700',
    totalValue: 'text-emerald-700',
  },
  blue: {
    icon: 'text-blue-600',
    iconBg: 'bg-blue-50',
    highlight: 'bg-blue-50',
    highlightText: 'text-blue-600',
    valueText: 'text-blue-700',
    selected: 'bg-blue-50 ring-1 ring-blue-200',
    selectedValue: 'text-blue-700',
    totalValue: 'text-blue-700',
  },
  violet: {
    icon: 'text-violet-600',
    iconBg: 'bg-violet-50',
    highlight: 'bg-violet-50',
    highlightText: 'text-violet-600',
    valueText: 'text-violet-700',
    selected: 'bg-violet-50 ring-1 ring-violet-200',
    selectedValue: 'text-violet-700',
    totalValue: 'text-violet-700',
  },
}

export function MonthlyMetricSidebar({ label, title, metricKey, icon: Icon, accent = 'emerald' }) {
  const [open, setOpen] = useState(false)
  const [months, setMonths] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)
  const colors = ACCENTS[accent] || ACCENTS.emerald

  useEffect(() => {
    if (!open) return undefined
    let live = true
    async function load() {
      setLoading(true)
      setSelected(null)
      try {
        const ranges = getMonthsOfYear(REPORT_YEAR)
        const results = await Promise.all(
          ranges.map(async (m) => {
            const res = await api.summary(isoDate(m.start), isoDate(m.end))
            return { label: m.label, value: res.data?.summary?.[metricKey] || 0 }
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
  }, [open, metricKey])

  const total = months.reduce((sum, m) => sum + m.value, 0)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mx-3 mb-2 flex w-[calc(100%-1.5rem)] items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-600 transition-all duration-200 hover:bg-gray-50 hover:text-black"
      >
        <Icon className={`h-4 w-4 ${colors.icon}`} />
        {label}
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
                  <div className={`grid h-8 w-8 place-items-center rounded-lg ${colors.iconBg}`}>
                    <Icon className={`h-4 w-4 ${colors.icon}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{title}</h3>
                    <p className="text-xs text-gray-500">All months of {REPORT_YEAR}</p>
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
                {selected && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-4 rounded-xl px-4 py-3 ${colors.highlight}`}
                  >
                    <p className={`text-xs font-semibold uppercase tracking-wide ${colors.highlightText}`}>{selected.label}</p>
                    <p className={`mt-1 text-2xl font-bold ${colors.valueText}`}>{formatMoney(selected.value)}</p>
                  </motion.div>
                )}

                {loading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 12 }, (_, i) => (
                      <div key={i} className="h-10 animate-pulse rounded-xl bg-gray-100" />
                    ))}
                  </div>
                ) : months.length === 0 ? (
                  <p className="py-6 text-center text-sm text-gray-500">No data available yet.</p>
                ) : (
                  <ul className="space-y-1">
                    {months.map((m, i) => {
                      const isSelected = selected?.label === m.label
                      return (
                        <motion.li
                          key={m.label}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.02 }}
                        >
                          <button
                            type="button"
                            onClick={() => setSelected(m)}
                            className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-colors ${
                              isSelected ? colors.selected : 'hover:bg-gray-50'
                            }`}
                          >
                            <span className={`text-sm ${isSelected ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                              {m.label}
                            </span>
                            {isSelected && (
                              <span className={`text-sm font-semibold ${colors.selectedValue}`}>{formatMoney(m.value)}</span>
                            )}
                          </button>
                        </motion.li>
                      )
                    })}
                  </ul>
                )}
              </div>

              {!loading && months.length > 0 && (
                <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/80 px-5 py-3">
                  <span className="text-sm font-medium text-gray-600">{REPORT_YEAR} Total</span>
                  <span className={`text-base font-bold ${colors.totalValue}`}>{formatMoney(total)}</span>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
