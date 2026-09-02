import { useEffect, useState } from 'react'
import { motion } from '../../../lib/framer-motion.jsx'
import { Download } from 'lucide-react'
import { AppLayout } from '../layouts/AppLayout.jsx'
import { EmptyState, Loader, PageTransition, StatCard } from '../components/ui.jsx'
import { api } from '../api/client.js'
import { downloadText, endOfDay, formatMoney, formatNumber, startOfMonth, toCsv, toLocalDateString } from '../lib/format.js'

export default function ReportsPage() {
  const [from, setFrom] = useState(() => toLocalDateString(startOfMonth()))
  const [to, setTo] = useState(() => toLocalDateString(endOfDay()))
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let live = true
    async function load() {
      setLoading(true)
      setError('')
      try {
        const res = await api.summary(new Date(from).toISOString(), new Date(`${to}T23:59:59`).toISOString())
        if (live) setData(res.data)
      } catch (err) {
        if (live) setError(err.message)
      } finally {
        if (live) setLoading(false)
      }
    }
    load()
    return () => {
      live = false
    }
  }, [from, to])

  const maxProfit = Math.max(1, ...(data?.byDay || []).map((d) => d.profit))

  function exportCsv() {
    const rows = [
      ['Date', 'Visits', 'Profit'],
      ...(data?.byDay || []).map((d) => [d._id, d.visits, d.profit]),
      [],
      ['Top medicines', 'Quantity', 'Profit'],
      ...(data?.topMedicines || []).map((m) => [m._id, m.quantity, m.profit]),
    ]
    downloadText(`kaab-medicare-report-${from}-to-${to}.csv`, toCsv(rows))
  }

  return (
    <AppLayout>
      <PageTransition>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Reports</h2>
            <p className="mt-1 text-sm text-gray-500">Profit, visit volume, and top medicines for the selected range.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900" />
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900" />
            <button type="button" onClick={exportCsv} className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white">
              <Download className="h-4 w-4" /> Export
            </button>
          </div>
        </div>

        {error && <p className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
        {loading ? (
          <Loader />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <StatCard label="Total visits" value={formatNumber(data?.summary?.totalVisits)} />
              <StatCard delay={0.05} label="Total profit" value={formatMoney(data?.summary?.totalProfit)} />
            </div>

            <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
              <h3 className="font-semibold text-gray-900">Daily profit</h3>
              {(data?.byDay || []).length === 0 ? (
                <div className="mt-4">
                  <EmptyState title="No activity in this range" body="Try a wider date range or add visits." />
                </div>
              ) : (
                <div className="mt-4 flex h-48 items-end gap-2 overflow-x-auto">
                  {(data.byDay || []).map((d, i) => (
                    <div key={d._id} className="flex min-w-8 flex-1 flex-col items-center gap-2">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(8, (d.profit / maxProfit) * 100)}%` }}
                        transition={{ delay: i * 0.03, duration: 0.4 }}
                        className="w-full rounded-t-lg bg-black"
                        title={`${d._id}: ${formatMoney(d.profit)}`}
                      />
                      <span className="text-[10px] text-gray-400">{d._id.slice(5)}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <div className="border-b border-gray-100 px-5 py-4">
                <h3 className="font-semibold text-gray-900">Top medicines</h3>
              </div>
              {(data?.topMedicines || []).length === 0 ? (
                <div className="p-5">
                  <EmptyState title="No medicines yet" body="Prescriptions will appear here once visits are recorded." />
                </div>
              ) : (
                <>
                <div className="divide-y divide-gray-100 md:hidden">
                  {data.topMedicines.map((m) => (
                    <div key={m._id} className="flex items-center justify-between gap-3 px-4 py-3">
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900">{m._id}</p>
                        <p className="text-sm text-gray-500">Qty: {m.quantity}</p>
                      </div>
                      <p className="font-semibold text-emerald-700">{formatMoney(m.profit)}</p>
                    </div>
                  ))}
                </div>
                <table className="hidden min-w-full text-left text-sm md:table">
                  <thead className="text-xs uppercase text-gray-400">
                    <tr>
                      <th className="px-5 py-3 font-medium">Medicine</th>
                      <th className="px-5 py-3 font-medium">Quantity</th>
                      <th className="px-5 py-3 font-medium">Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topMedicines.map((m) => (
                      <tr key={m._id} className="border-t border-gray-100">
                        <td className="px-5 py-3 font-medium text-gray-900">{m._id}</td>
                        <td className="px-5 py-3 text-gray-900">{m.quantity}</td>
                        <td className="px-5 py-3 text-gray-900">{formatMoney(m.profit)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </>
              )}
            </section>
          </>
        )}
      </PageTransition>
    </AppLayout>
  )
}
