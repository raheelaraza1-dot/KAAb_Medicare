import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from '../../../lib/react-router-dom.jsx'
import { AnimatePresence, motion } from '../../../lib/framer-motion.jsx'
import { CalendarDays, ChevronDown, Download, Pill, ShoppingBag, Tag, TrendingUp, UserPlus, Users, Wallet } from 'lucide-react'
import { AppLayout } from '../layouts/AppLayout.jsx'
import { Avatar, Badge, EmptyState, Loader, PageTransition, Pagination, StatCard } from '../components/ui.jsx'
import { api } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import {
  downloadText,
  endOfDay,
  formatDateTime,
  formatDayLabel,
  formatMoney,
  formatNumber,
  greeting,
  isoDate,
  isSameDay,
  startOfDay,
  startOfMonth,
  toCsv,
  toLocalDateString,
} from '../lib/format.js'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { email } = useAuth()
  const [patients, setPatients] = useState([])
  const [daySummary, setDaySummary] = useState(null)
  const [month, setMonth] = useState(null)
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const datePickerRef = useRef(null)
  const pageSize = 5

  const dateInputValue = toLocalDateString(selectedDate)

  useEffect(() => {
    function onClickOutside(e) {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target)) {
        setShowDatePicker(false)
      }
    }
    if (showDatePicker) document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [showDatePicker])

  useEffect(() => {
    let live = true
    async function load() {
      setLoading(true)
      setError('')
      try {
        const dayStart = startOfDay(selectedDate)
        const dayEnd = endOfDay(selectedDate)
        const monthStart = startOfMonth(selectedDate)
        const [plist, day, m] = await Promise.all([
          api.patients(),
          api.summary(isoDate(dayStart), isoDate(dayEnd)),
          api.summary(isoDate(monthStart), isoDate(dayEnd)),
        ])
        if (!live) return
        const list = plist.data || []
        setPatients(list)
        setDaySummary(day.data)
        setMonth(m.data)

        const withVisits = list.filter((p) => p.totalVisits > 0).slice(0, 12)
        const details = await Promise.all(withVisits.map((p) => api.patient(p._id).catch(() => null)))
        if (!live) return
        const dayStartMs = dayStart.getTime()
        const dayEndMs = dayEnd.getTime()
        const rows = details
          .filter(Boolean)
          .flatMap((d) =>
            (d.data.visits || [])
              .filter((v) => {
                const t = new Date(v.visitDate).getTime()
                return t >= dayStartMs && t <= dayEndMs
              })
              .map((v) => ({
                visit: v,
                patient: d.data.patient,
              })),
          )
          .sort((a, b) => new Date(b.visit.visitDate) - new Date(a.visit.visitDate))
        setRecent(rows)
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
  }, [selectedDate])

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return recent
    return recent.filter((row) => row.patient.name.toLowerCase().includes(term))
  }, [q, recent])

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const slice = filtered.slice((page - 1) * pageSize, page * pageSize)
  const displayName = email?.split('@')[0] || 'Doctor'
  const isToday = isSameDay(selectedDate, new Date())

  function goToToday() {
    setSelectedDate(new Date())
    setShowDatePicker(false)
  }

  function exportReport() {
    const rows = [
      ['Metric', 'Value'],
      ['Date', dateInputValue],
      ['Total patients', patients.length],
      ['Visits', daySummary?.summary?.totalVisits || 0],
      ['Profit', daySummary?.summary?.totalProfit || 0],
      ['Trading price', daySummary?.summary?.totalTradePrice || 0],
      ['Selling price', daySummary?.summary?.totalSellingPrice || 0],
      ['Monthly profit', month?.summary?.totalProfit || 0],
      ['Monthly trading price', month?.summary?.totalTradePrice || 0],
      ['Monthly selling price', month?.summary?.totalSellingPrice || 0],
    ]
    downloadText(`kaab-medicare-overview-${dateInputValue}.csv`, toCsv(rows))
  }

  return (
    <AppLayout onSearch={(value) => navigate(`/patients?q=${encodeURIComponent(value)}`)}>
      <PageTransition>
        <div className="relative -mx-4 -my-6 min-h-[calc(100dvh-3.5rem)] pb-24 lg:-mx-8 lg:pb-8">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: 'url(/img1.webp)' }}
            aria-hidden
          />
          <div className="absolute inset-0 bg-white/82 backdrop-blur-[2px]" aria-hidden />

          <div className="relative px-4 py-6 lg:px-8">
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm text-gray-500 lg:hidden">
                  {greeting()}, Dr. {displayName}
                </p>
                <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">Overview</h2>
                <p className="mt-1.5 text-sm text-gray-500 sm:text-base">
                  {isToday
                    ? "Here is the summary of your clinic's performance today."
                    : `Performance summary for ${formatDayLabel(selectedDate)}.`}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="relative" ref={datePickerRef}>
                  <button
                    type="button"
                    onClick={() => setShowDatePicker((v) => !v)}
                    className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium text-gray-900 transition-all duration-200 ${
                      showDatePicker
                        ? 'border-black bg-gray-50 shadow-sm'
                        : 'border-gray-200 bg-white/90 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <CalendarDays className="h-4 w-4" />
                    {formatDayLabel(selectedDate)}
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${showDatePicker ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {showDatePicker && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 z-30 mt-2 w-64 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl"
                      >
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Select date</p>
                        <input
                          type="date"
                          value={dateInputValue}
                          max={toLocalDateString()}
                          onChange={(e) => {
                            if (e.target.value) setSelectedDate(new Date(`${e.target.value}T12:00:00`))
                          }}
                          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-black"
                        />
                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            onClick={goToToday}
                            className="flex-1 rounded-xl bg-black py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                          >
                            Today
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowDatePicker(false)}
                            className="flex-1 rounded-xl border border-gray-200 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50"
                          >
                            Close
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={exportReport}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm transition-shadow hover:shadow-md sm:flex-none sm:px-4"
                >
                  <Download className="h-4 w-4" />
                  Export Report
                </motion.button>
              </div>
            </div>

        {error && <p className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
        {loading ? (
          <Loader />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              <StatCard
                icon={<Users className="h-5 w-5" />}
                label="Total Patients"
                value={formatNumber(patients.length)}
                badge={<Badge tone="green">Live</Badge>}
              />
              <StatCard
                delay={0.05}
                icon={<CalendarDays className="h-5 w-5" />}
                label={isToday ? "Today's Visits" : 'Visits'}
                value={formatNumber(daySummary?.summary?.totalVisits)}
                badge={<Badge>{formatDayLabel(selectedDate)}</Badge>}
              />
              <StatCard
                delay={0.1}
                icon={<Wallet className="h-5 w-5" />}
                label={isToday ? "Today's Profit" : 'Profit'}
                value={formatMoney(daySummary?.summary?.totalProfit)}
                badge={
                  <Badge tone="green">
                    <TrendingUp className="mr-1 inline h-3 w-3" />
                    {formatDayLabel(selectedDate)}
                  </Badge>
                }
              />
              <StatCard
                delay={0.12}
                icon={<ShoppingBag className="h-5 w-5" />}
                label={isToday ? "Today's Trading Price" : 'Trading Price'}
                value={formatMoney(daySummary?.summary?.totalTradePrice)}
                badge={<Badge>{formatDayLabel(selectedDate)}</Badge>}
              />
              <StatCard
                delay={0.14}
                icon={<Tag className="h-5 w-5" />}
                label={isToday ? "Today's Selling Price" : 'Selling Price'}
                value={formatMoney(daySummary?.summary?.totalSellingPrice)}
                badge={<Badge>{formatDayLabel(selectedDate)}</Badge>}
              />
              <StatCard
                delay={0.15}
                icon={<TrendingUp className="h-5 w-5" />}
                label="Monthly Profit"
                value={formatMoney(month?.summary?.totalProfit)}
                badge={<Badge tone="green">This month</Badge>}
              />
              <StatCard
                delay={0.17}
                icon={<ShoppingBag className="h-5 w-5" />}
                label="Monthly Trading Price"
                value={formatMoney(month?.summary?.totalTradePrice)}
                badge={<Badge tone="green">This month</Badge>}
              />
              <StatCard
                delay={0.19}
                icon={<Tag className="h-5 w-5" />}
                label="Monthly Selling Price"
                value={formatMoney(month?.summary?.totalSellingPrice)}
                badge={<Badge tone="green">This month</Badge>}
              />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 lg:hidden">
              <Link to="/patients/new" className="flex items-center justify-center gap-2 rounded-xl bg-black py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90">
                <UserPlus className="h-4 w-4" /> New Patient
              </Link>
              <Link to="/patients" className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50">
                <CalendarDays className="h-4 w-4" /> Patients
              </Link>
            </div>

            <section className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-gray-100 px-4 py-4 sm:px-5 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-bold text-gray-900">Recent Visits</h3>
                <input
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value)
                    setPage(1)
                  }}
                  placeholder="Quick search..."
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 transition-all focus:border-black sm:w-56"
                />
              </div>
              {slice.length === 0 ? (
                <div className="p-5">
                  <EmptyState
                    title={isToday ? 'No visits yet today' : 'No visits on this date'}
                    body="Register a patient and add a prescription to see activity here."
                  />
                </div>
              ) : (
                <>
                  <div className="divide-y divide-gray-100 md:hidden">
                    {slice.map((row) => (
                      <button
                        key={row.visit._id}
                        type="button"
                        onClick={() => navigate(`/patients/${row.patient._id}`)}
                        className="flex w-full items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-gray-50 active:bg-gray-100"
                      >
                        <Avatar name={row.patient.name} />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900">{row.patient.name}</p>
                          <p className="mt-0.5 text-xs text-gray-500">{formatDateTime(row.visit.visitDate)}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                              <Pill className="h-3 w-3" />
                              {row.visit.medicines?.length || 0} items
                            </span>
                            <span className="text-sm font-semibold text-emerald-700">{formatMoney(row.visit.visitTotalProfit)}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="hidden overflow-x-auto md:block">
                  <table className="min-w-full text-left text-sm">
                    <thead className="text-xs uppercase tracking-wide text-gray-400">
                      <tr>
                        <th className="px-5 py-3 font-medium">Patient Name</th>
                        <th className="px-5 py-3 font-medium">Date & Time</th>
                        <th className="px-5 py-3 font-medium">Medicine Count</th>
                        <th className="px-5 py-3 font-medium">Profit</th>
                        <th className="px-5 py-3 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence>
                        {slice.map((row) => (
                          <motion.tr
                            key={row.visit._id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            onClick={() => navigate(`/patients/${row.patient._id}`)}
                            className="clickable-row border-t border-gray-100"
                          >
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-3">
                                <Avatar name={row.patient.name} />
                                <span className="font-medium text-gray-900">{row.patient.name}</span>
                              </div>
                            </td>
                            <td className="px-5 py-3 text-gray-600">{formatDateTime(row.visit.visitDate)}</td>
                            <td className="px-5 py-3">
                              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                                <Pill className="h-3 w-3" />
                                {row.visit.medicines?.length || 0} items
                              </span>
                            </td>
                            <td className="px-5 py-3 font-medium text-gray-900">{formatMoney(row.visit.visitTotalProfit)}</td>
                            <td className="px-5 py-3">
                              <Link
                                to={`/patients/${row.patient._id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-sm font-medium text-black transition-colors hover:underline"
                              >
                                View record
                              </Link>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                  </div>
                  <Pagination
                    page={page}
                    pages={pages}
                    total={filtered.length}
                    pageSize={pageSize}
                    onPage={setPage}
                  />
                </>
              )}
            </section>
          </>
        )}
          </div>
        </div>
      </PageTransition>
    </AppLayout>
  )
}
