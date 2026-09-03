import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from '../../../lib/react-router-dom.jsx'
import { AnimatePresence, motion } from '../../../lib/framer-motion.jsx'
import {
  ArrowLeft,
  Calendar,
  Clock,
  Filter,
  MapPin,
  Pencil,
  Phone,
  Pill,
  Plus,
  Save,
  Trash2,
  UserRound,
} from 'lucide-react'
import { AppLayout } from '../layouts/AppLayout.jsx'
import { Avatar, EmptyState, Loader, PageTransition } from '../components/ui.jsx'
import { api } from '../api/client.js'
import { formatDate, formatDateTime, formatMoney, formatTime, lineProfit, patientCode } from '../lib/format.js'

const emptyMed = () => ({ medicineName: '', tradePrice: '', sellingPrice: '', quantity: '1' })

export default function PatientProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('')
  const [showVisit, setShowVisit] = useState(false)
  const [editingVisit, setEditingVisit] = useState(null)
  const [showEdit, setShowEdit] = useState(false)
  const [visitForm, setVisitForm] = useState({ diagnosis: '', notes: '' })
  const [meds, setMeds] = useState([emptyMed()])
  const [edit, setEdit] = useState({ name: '', phone: '', age: '', gender: '', address: '' })
  const [saving, setSaving] = useState(false)

  async function reload() {
    const res = await api.patient(id)
    setData(res.data)
    const p = res.data.patient
    setEdit({
      name: p.name || '',
      phone: p.phone || '',
      age: p.age ?? '',
      gender: p.gender || '',
      address: p.address || '',
    })
  }

  useEffect(() => {
    let live = true
    async function load() {
      setLoading(true)
      setError('')
      try {
        await reload()
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
  }, [id])

  const visits = useMemo(() => {
    const list = data?.visits || []
    const term = filter.trim().toLowerCase()
    if (!term) return list
    return list.filter(
      (v) =>
        (v.diagnosis || '').toLowerCase().includes(term) ||
        (v.notes || '').toLowerCase().includes(term) ||
        (v.medicines || []).some((m) => m.medicineName.toLowerCase().includes(term)),
    )
  }, [data, filter])

  async function saveVisit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        diagnosis: visitForm.diagnosis.trim() || undefined,
        notes: visitForm.notes.trim() || undefined,
        medicines: meds
          .filter((m) => m.medicineName.trim())
          .map((m) => ({
            medicineName: m.medicineName.trim(),
            tradePrice: Number(m.tradePrice) || 0,
            sellingPrice: Number(m.sellingPrice) || 0,
            quantity: Number(m.quantity) || 1,
          })),
      }
      if (editingVisit) {
        await api.updateVisit(id, editingVisit._id, payload)
        setEditingVisit(null)
      } else {
        await api.createVisit(id, payload)
        setShowVisit(false)
      }
      setVisitForm({ diagnosis: '', notes: '' })
      setMeds([emptyMed()])
      await reload()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  function openEditVisit(visit) {
    setEditingVisit(visit)
    setVisitForm({
      diagnosis: visit.diagnosis || '',
      notes: visit.notes || '',
    })
    setMeds(
      (visit.medicines || []).length > 0
        ? visit.medicines.map((m) => ({
            medicineName: m.medicineName,
            tradePrice: String(m.tradePrice),
            sellingPrice: String(m.sellingPrice),
            quantity: String(m.quantity),
          }))
        : [emptyMed()],
    )
  }

  function closeVisitModal() {
    setShowVisit(false)
    setEditingVisit(null)
    setVisitForm({ diagnosis: '', notes: '' })
    setMeds([emptyMed()])
  }

  async function removeVisit(visit) {
    if (!window.confirm('Delete this visit? This cannot be undone.')) return
    setSaving(true)
    setError('')
    try {
      await api.deleteVisit(id, visit._id)
      await reload()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function saveEdit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const body = { name: edit.name.trim(), phone: edit.phone.trim() }
      if (edit.age !== '') body.age = Number(edit.age)
      if (edit.gender) body.gender = edit.gender
      body.address = edit.address
      await api.updatePatient(id, body)
      setShowEdit(false)
      await reload()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const patient = data?.patient

  return (
    <AppLayout>
      <PageTransition>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <h2 className="text-center text-lg font-bold tracking-tight text-gray-900 sm:flex-1">Patient Record</h2>
          <button
            type="button"
            onClick={() => setShowEdit(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            <Pencil className="h-4 w-4" /> Edit patient
          </button>
        </div>

        {error && <p className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
        {loading || !patient ? (
          <Loader />
        ) : (
          <div className="space-y-6">
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
            >
              <div className="bg-gradient-to-br from-gray-900 to-gray-700 px-6 py-8 text-white sm:px-10">
                <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                  <Avatar name={patient.name} size="lg" />
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-3xl font-extrabold tracking-tight">{patient.name}</h3>
                    <p className="mt-1 text-sm text-white/70">ID: {patientCode(patient._id)}</p>
                    <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                      <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-sm text-white backdrop-blur">
                        <UserRound className="mr-1 inline h-3.5 w-3.5" />
                        {patient.age != null ? `${patient.age} yrs` : 'Age n/a'}
                      </span>
                      <span className="rounded-full bg-white/15 px-3 py-1 text-sm text-white backdrop-blur">
                        {patient.gender || 'Gender n/a'}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-sm text-white backdrop-blur">
                        <Phone className="mr-1 inline h-3.5 w-3.5" />
                        {patient.phone || 'Phone n/a'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid gap-0 sm:grid-cols-3">
                <div className="border-b border-gray-100 p-6 sm:border-b-0 sm:border-r">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Registered</p>
                  <p className="mt-2 flex items-center gap-2 text-lg font-semibold">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {formatDate(patient.createdAt)}
                  </p>
                </div>
                <div className="border-b border-gray-100 p-6 sm:border-b-0 sm:border-r">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Total visits</p>
                  <p className="mt-2 text-3xl font-extrabold text-gray-900">{patient.totalVisits || 0}</p>
                </div>
                <div className="p-6">
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400">Profit generated</p>
                  <p className="mt-2 text-3xl font-extrabold text-emerald-700">{formatMoney(patient.totalProfit)}</p>
                </div>
              </div>
              {patient.address && (
                <div className="border-t border-gray-100 px-6 py-4 sm:px-10">
                  <p className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                    {patient.address}
                  </p>
                </div>
              )}
            </motion.section>

            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Visit History</h3>
                  <p className="mt-0.5 text-sm text-gray-500">{visits.length} visit{visits.length !== 1 ? 's' : ''} on record</p>
                </div>
                <div className="relative">
                  <Filter className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                  <input
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    placeholder="Filter visits..."
                    className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm text-gray-900 transition-all focus:border-black sm:w-56"
                  />
                </div>
              </div>

              {visits.length === 0 ? (
                <div className="p-6">
                  <EmptyState title="No visits recorded" body="Add a visit to start this patient's clinical timeline." />
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  <AnimatePresence>
                    {visits.map((v, i) => (
                      <motion.article
                        key={v._id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="p-5 transition-colors hover:bg-gray-50/80 sm:p-6"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                              <span className="rounded-full bg-gray-100 px-3 py-1 font-medium">{formatDate(v.visitDate)}</span>
                              <span className="inline-flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {formatTime(v.visitDate)}
                              </span>
                              <span className="text-gray-400">·</span>
                              <span>{formatDateTime(v.visitDate)}</span>
                            </div>
                            <h4 className="mt-3 text-lg font-bold text-gray-900">{v.diagnosis || 'Clinic visit'}</h4>
                            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-gray-600">
                              {v.notes || 'No additional notes recorded for this visit.'}
                            </p>
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-2">
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => openEditVisit(v)}
                                className="grid h-9 w-9 place-items-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50"
                                aria-label="Edit visit"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeVisit(v)}
                                disabled={saving}
                                className="grid h-9 w-9 place-items-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 transition-colors hover:bg-rose-100 disabled:opacity-50"
                                aria-label="Delete visit"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="rounded-xl bg-emerald-50 px-4 py-2 text-right">
                              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Visit profit</p>
                              <p className="text-xl font-extrabold text-emerald-700">{formatMoney(v.visitTotalProfit)}</p>
                            </div>
                          </div>
                        </div>

                        {(v.medicines || []).length > 0 && (
                          <div className="mt-4 overflow-x-auto rounded-xl border border-gray-100">
                            <table className="min-w-full text-left text-sm">
                              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-400">
                                <tr>
                                  <th className="px-4 py-2.5 font-medium">Medicine</th>
                                  <th className="px-4 py-2.5 font-medium">Qty</th>
                                  <th className="px-4 py-2.5 font-medium">Trade</th>
                                  <th className="px-4 py-2.5 font-medium">Selling</th>
                                  <th className="px-4 py-2.5 font-medium">Profit</th>
                                </tr>
                              </thead>
                              <tbody>
                                {v.medicines.map((m) => (
                                  <tr key={m.medicineName + m.profit} className="border-t border-gray-100">
                                    <td className="px-4 py-2.5 font-medium">
                                      <span className="inline-flex items-center gap-1.5">
                                        <Pill className="h-3.5 w-3.5 text-gray-400" />
                                        {m.medicineName}
                                      </span>
                                    </td>
                                    <td className="px-4 py-2.5 text-gray-600">{m.quantity}</td>
                                    <td className="px-4 py-2.5 text-gray-600">{formatMoney(m.tradePrice)}</td>
                                    <td className="px-4 py-2.5 text-gray-600">{formatMoney(m.sellingPrice)}</td>
                                    <td className="px-4 py-2.5 font-semibold text-emerald-700">{formatMoney(m.profit)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </motion.article>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </section>
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={() => setShowVisit(true)}
          className="fixed bottom-24 right-5 z-20 grid h-14 w-14 place-items-center rounded-full bg-black text-white shadow-lg transition-shadow hover:shadow-xl lg:bottom-8"
          aria-label="Add visit"
        >
          <Plus className="h-6 w-6" />
        </motion.button>

        <AnimatePresence>
          {(showVisit || editingVisit) && (
            <Modal title={editingVisit ? 'Edit visit' : 'Add visit'} onClose={closeVisitModal}>
              <form onSubmit={saveVisit} className="space-y-3">
                <input
                  value={visitForm.diagnosis}
                  onChange={(e) => setVisitForm({ ...visitForm, diagnosis: e.target.value })}
                  placeholder="Diagnosis / visit type"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900"
                />
                <textarea
                  value={visitForm.notes}
                  onChange={(e) => setVisitForm({ ...visitForm, notes: e.target.value })}
                  placeholder="Clinical notes"
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900"
                />
                {meds.map((m, i) => (
                  <div key={i} className="grid grid-cols-2 gap-2">
                    <input
                      value={m.medicineName}
                      onChange={(e) => setMeds((rows) => rows.map((r, idx) => (idx === i ? { ...r, medicineName: e.target.value } : r)))}
                      placeholder="Medicine"
                      className="col-span-2 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900"
                    />
                    <input
                      type="number"
                      value={m.tradePrice}
                      onChange={(e) => setMeds((rows) => rows.map((r, idx) => (idx === i ? { ...r, tradePrice: e.target.value } : r)))}
                      placeholder="Trade"
                      className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900"
                    />
                    <input
                      type="number"
                      value={m.sellingPrice}
                      onChange={(e) => setMeds((rows) => rows.map((r, idx) => (idx === i ? { ...r, sellingPrice: e.target.value } : r)))}
                      placeholder="Selling"
                      className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900"
                    />
                    <input
                      type="number"
                      value={m.quantity}
                      onChange={(e) => setMeds((rows) => rows.map((r, idx) => (idx === i ? { ...r, quantity: e.target.value } : r)))}
                      className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900"
                    />
                    <p className="self-center text-sm text-gray-900">{formatMoney(lineProfit(m.sellingPrice, m.tradePrice, m.quantity))}</p>
                  </div>
                ))}
                <button type="button" onClick={() => setMeds((rows) => [...rows, emptyMed()])} className="text-sm font-medium text-gray-900">
                  + Add medicine
                </button>
                <button disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-xl bg-black py-2.5 text-sm font-semibold text-white">
                  <Save className="h-4 w-4" /> {saving ? 'Saving…' : editingVisit ? 'Update visit' : 'Save visit'}
                </button>
              </form>
            </Modal>
          )}
          {showEdit && (
            <Modal title="Edit patient details" onClose={() => setShowEdit(false)}>
              <form onSubmit={saveEdit} className="space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400">Full name</label>
                <input required value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} placeholder="Patient name" className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900" />
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400">Phone</label>
                <input value={edit.phone} onChange={(e) => setEdit({ ...edit, phone: e.target.value })} placeholder="Phone number (optional)" className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900" />
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400">Age</label>
                <input type="number" value={edit.age} onChange={(e) => setEdit({ ...edit, age: e.target.value })} placeholder="Age" className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900" />
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400">Gender</label>
                <select value={edit.gender} onChange={(e) => setEdit({ ...edit, gender: e.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900">
                  <option value="">Select gender</option>
                  <option value="F">Female</option>
                  <option value="M">Male</option>
                  <option value="Other">Other</option>
                </select>
                <label className="block text-xs font-semibold uppercase tracking-wide text-gray-400">Address</label>
                <textarea value={edit.address} onChange={(e) => setEdit({ ...edit, address: e.target.value })} placeholder="Address" rows={3} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900" />
                <button disabled={saving} className="w-full rounded-xl bg-black py-2.5 text-sm font-semibold text-white">
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
                <Link to="/patients/new" className="block text-center text-sm text-gray-500">
                  Register another patient
                </Link>
              </form>
            </Modal>
          )}
        </AnimatePresence>
      </PageTransition>
    </AppLayout>
  )
}

function Modal({ title, children, onClose }) {
  return (
    <motion.div className="fixed inset-0 z-40 grid place-items-end bg-black/30 p-4 sm:place-items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <button type="button" className="absolute inset-0" onClick={onClose} aria-label="Close" />
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="relative w-full max-w-md rounded-2xl bg-white p-5 shadow-xl sm:max-h-[90vh] sm:overflow-y-auto"
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <button type="button" onClick={onClose} className="text-sm text-gray-500 transition-colors hover:text-black">
            Close
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  )
}
