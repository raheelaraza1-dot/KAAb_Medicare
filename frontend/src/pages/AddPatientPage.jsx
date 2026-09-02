import { useMemo, useState } from 'react'
import { useNavigate } from '../../../lib/react-router-dom.jsx'
import { AnimatePresence, motion } from '../../../lib/framer-motion.jsx'
import { Plus, Save, Trash2 } from 'lucide-react'
import { AppLayout } from '../layouts/AppLayout.jsx'
import { PageTransition } from '../components/ui.jsx'
import { api } from '../api/client.js'
import { formatMoney, lineProfit } from '../lib/format.js'

const emptyMed = () => ({ medicineName: '', tradePrice: '', sellingPrice: '', quantity: '1' })

export default function AddPatientPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', phone: '', age: '', gender: '', address: '', diagnosis: '', notes: '' })
  const [meds, setMeds] = useState([emptyMed()])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const totalProfit = useMemo(
    () => meds.reduce((sum, m) => sum + lineProfit(m.sellingPrice, m.tradePrice, m.quantity), 0),
    [meds],
  )

  function updateMed(i, key, value) {
    setMeds((rows) => rows.map((row, idx) => (idx === i ? { ...row, [key]: value } : row)))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const body = {
        name: form.name.trim(),
        phone: form.phone.trim(),
      }
      if (form.age !== '') body.age = Number(form.age)
      if (form.gender) body.gender = form.gender
      if (form.address) body.address = form.address.trim()

      const created = await api.createPatient(body)
      const id = created.data._id
      const medicines = meds
        .filter((m) => m.medicineName.trim())
        .map((m) => ({
          medicineName: m.medicineName.trim(),
          tradePrice: Number(m.tradePrice) || 0,
          sellingPrice: Number(m.sellingPrice) || 0,
          quantity: Number(m.quantity) || 1,
        }))

      if (medicines.length || form.diagnosis.trim() || form.notes.trim()) {
        await api.createVisit(id, {
          diagnosis: form.diagnosis.trim() || undefined,
          notes: form.notes.trim() || undefined,
          medicines,
        })
      }
      navigate(`/patients/${id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppLayout>
      <PageTransition>
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Add New Patient</h2>
          <p className="mt-1 text-sm text-gray-500">Register a new patient and prescribe medication.</p>
        </div>

        {error && <p className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

        <form onSubmit={onSubmit} className="space-y-6">
          <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
            <h3 className="mb-4 text-lg font-semibold">Patient Information</h3>
            <label className="block text-sm font-medium">
              Full Name
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Jane Doe"
                className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-black"
              />
            </label>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <label className="text-sm font-medium">
                Phone Number
                <input
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-black"
                />
              </label>
              <label className="text-sm font-medium">
                Age
                <input
                  type="number"
                  min="0"
                  max="150"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  placeholder="Years"
                  className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-black"
                />
              </label>
              <label className="text-sm font-medium">
                Gender
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-black"
                >
                  <option value="">Select</option>
                  <option value="F">Female</option>
                  <option value="M">Male</option>
                  <option value="Other">Other</option>
                </select>
              </label>
            </div>
            <label className="mt-4 block text-sm font-medium">
              Address
              <textarea
                rows={3}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Street address, City, ZIP"
                className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-black"
              />
            </label>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-semibold">Prescribed Medicine</h3>
              <div className="rounded-xl bg-gray-100 px-3 py-2 text-xs font-semibold tracking-wide text-gray-700">
                TOTAL EST. PROFIT {formatMoney(totalProfit)}
              </div>
            </div>
            <div className="mb-4 grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium">
                Diagnosis
                <input
                  value={form.diagnosis}
                  onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
                  placeholder="e.g. Routine checkup"
                  className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
                />
              </label>
              <label className="text-sm font-medium">
                Notes
                <input
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Optional clinical notes"
                  className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
                />
              </label>
            </div>
            <div className="hidden grid-cols-[1.4fr_repeat(4,0.7fr)_auto] gap-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400 lg:grid">
              <span>Medicine name</span>
              <span>Trade price ($)</span>
              <span>Selling price ($)</span>
              <span>Qty</span>
              <span>Profit</span>
              <span />
            </div>
            <div className="mt-2 space-y-3">
              <AnimatePresence>
                {meds.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid gap-2 rounded-xl border border-gray-100 p-3 lg:grid-cols-[1.4fr_repeat(4,0.7fr)_auto] lg:border-0 lg:p-0"
                  >
                    <input
                      value={m.medicineName}
                      onChange={(e) => updateMed(i, 'medicineName', e.target.value)}
                      placeholder="e.g. Amoxicillin 500mg"
                      className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={m.tradePrice}
                      onChange={(e) => updateMed(i, 'tradePrice', e.target.value)}
                      placeholder="0.00"
                      className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={m.sellingPrice}
                      onChange={(e) => updateMed(i, 'sellingPrice', e.target.value)}
                      placeholder="0.00"
                      className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
                    />
                    <input
                      type="number"
                      min="0"
                      value={m.quantity}
                      onChange={(e) => updateMed(i, 'quantity', e.target.value)}
                      className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
                    />
                    <div className="flex items-center px-1 text-sm font-medium">
                      {formatMoney(lineProfit(m.sellingPrice, m.tradePrice, m.quantity))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setMeds((rows) => (rows.length === 1 ? [emptyMed()] : rows.filter((_, idx) => idx !== i)))}
                      className="grid h-10 w-10 place-items-center rounded-xl text-gray-400 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <button
              type="button"
              onClick={() => setMeds((rows) => [...rows, emptyMed()])}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium hover:bg-gray-50"
            >
              <Plus className="h-4 w-4" /> Add another medicine
            </button>
          </section>

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => navigate(-1)} className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium">
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={saving}
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving…' : 'Save Patient Record'}
            </motion.button>
          </div>
        </form>
      </PageTransition>
    </AppLayout>
  )
}
