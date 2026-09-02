import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from '../../../lib/react-router-dom.jsx'
import { motion } from '../../../lib/framer-motion.jsx'
import { ChevronRight, Filter, Search } from 'lucide-react'
import { AppLayout } from '../layouts/AppLayout.jsx'
import { Avatar, EmptyState, Loader, PageTransition, Pagination } from '../components/ui.jsx'
import { api } from '../api/client.js'
import { formatDate, formatMoney, formatNumber, patientCode } from '../lib/format.js'

export default function PatientsPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const initial = params.get('q') || ''
  const [search, setSearch] = useState(initial)
  const [applied, setApplied] = useState(initial)
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [minVisits, setMinVisits] = useState('')
  const [showFilter, setShowFilter] = useState(false)
  const pageSize = 8

  useEffect(() => {
    const t = setTimeout(() => setApplied(search), 250)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    let live = true
    async function load() {
      setLoading(true)
      setError('')
      try {
        const res = await api.patients(applied)
        if (live) {
          setPatients(res.data || [])
          setPage(1)
        }
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
  }, [applied])

  const filtered = useMemo(() => {
    const min = Number(minVisits)
    if (!min) return patients
    return patients.filter((p) => (p.totalVisits || 0) >= min)
  }, [patients, minVisits])

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const slice = filtered.slice((page - 1) * pageSize, page * pageSize)

  return (
    <AppLayout
      searchPlaceholder="Search patients by name, phone, or ID..."
      onSearch={(value) => {
        setSearch(value)
        navigate(`/patients?q=${encodeURIComponent(value)}`)
      }}
    >
      <PageTransition>
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Patient Directory</h2>
          <p className="mt-1 text-sm text-gray-500">Search and manage clinic patient records.</p>
        </div>

        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patients by name, phone, or ID..."
              className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm focus:border-black"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilter((v) => !v)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium"
          >
            <Filter className="h-4 w-4" />
            Filter
          </button>
        </div>

        {showFilter && (
          <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4">
            <label className="text-sm font-medium">
              Minimum visits
              <input
                type="number"
                min="0"
                value={minVisits}
                onChange={(e) => {
                  setMinVisits(e.target.value)
                  setPage(1)
                }}
                className="mt-1 w-40 rounded-xl border border-gray-200 px-3 py-2 text-sm"
              />
            </label>
          </div>
        )}

        {error && <p className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
        {loading ? (
          <Loader />
        ) : slice.length === 0 ? (
          <EmptyState title="No patients found" body="Add a patient to start building the clinic directory." />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-gray-400">
                  <tr>
                    <th className="px-5 py-3 font-medium">Patient Name</th>
                    <th className="px-5 py-3 font-medium">Contact Number</th>
                    <th className="px-5 py-3 font-medium">Registered</th>
                    <th className="px-5 py-3 font-medium">Total Visits</th>
                    <th className="px-5 py-3 font-medium">Profit Generated</th>
                    <th className="px-5 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {slice.map((p, i) => (
                    <motion.tr
                      key={p._id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => navigate(`/patients/${p._id}`)}
                      className="clickable-row border-t border-gray-100"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={p.name} />
                          <div>
                            <p className="font-medium">{p.name}</p>
                            <p className="text-xs text-gray-400">ID: {patientCode(p._id)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-600">{p.phone}</td>
                      <td className="px-5 py-3 text-gray-600">{formatDate(p.createdAt)}</td>
                      <td className="px-5 py-3">{formatNumber(p.totalVisits)}</td>
                      <td className="px-5 py-3 font-medium">{formatMoney(p.totalProfit)}</td>
                      <td className="px-5 py-3">
                        <Link
                          to={`/patients/${p._id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-sm font-medium text-black transition-colors hover:underline"
                        >
                          View record
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} pages={pages} total={filtered.length} pageSize={pageSize} onPage={setPage} />
          </div>
        )}
      </PageTransition>
    </AppLayout>
  )
}
