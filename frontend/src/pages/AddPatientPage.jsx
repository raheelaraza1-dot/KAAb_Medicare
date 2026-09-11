import { useMemo, useState } from 'react'
import { useNavigate } from '../../../lib/react-router-dom.jsx'
import { Save } from 'lucide-react'
import { AppLayout } from '../layouts/AppLayout.jsx'
import { PageTransition } from '../components/ui.jsx'
import { emptyMed, medToPayload, MedicineFormRows } from '../components/MedicineFormRows.jsx'
import { PatientNameAutocomplete } from '../components/PatientNameAutocomplete.jsx'
import { api } from '../api/client.js'
import { formatMoney, lineProfit } from '../lib/format.js'

export default function AddPatientPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', phone: '', age: '', gender: '', address: '', diagnosis: '', notes: '' })
  const [meds, setMeds] = useState([emptyMed()])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [existingMatch, setExistingMatch] = useState(null)

  const totalProfit = useMemo(
    () => meds.reduce((sum, m) => sum + lineProfit(m.sellingPrice, m.tradePrice, m.quantity), 0),
    [meds],
  )

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const body = {
        name: form.name.trim(),
      }
      if (form.phone.trim()) body.phone = form.phone.trim()
      if (form.age !== '') body.age = Number(form.age)
      if (form.gender) body.gender = form.gender
      if (form.address) body.address = form.address.trim()

      const created = await api.createPatient(body)
      const id = created.data._id
      const medicines = meds.filter((m) => m.medicineName.trim()).map(medToPayload)

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
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Add New Patient</h2>
          <p className="mt-1 text-sm text-gray-500">Register a new patient and prescribe medication.</p>
        </div>

        {error && <p className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}

        <form onSubmit={onSubmit} className="space-y-6">
          <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Patient Information</h3>
            <label className="block text-sm font-medium text-gray-900">
              Full Name
              <PatientNameAutocomplete
                value={form.name}
                onChange={(name) => {
                  setForm({ ...form, name })
                  if (existingMatch && name.trim().toLowerCase() !== existingMatch.name.trim().toLowerCase()) {
                    setExistingMatch(null)
                  }
                }}
                onSelectExisting={(patient) => {
                  setExistingMatch(patient)
                  setForm({
                    name: patient.name || '',
                    phone: patient.phone || '',
                    age: patient.age != null ? String(patient.age) : '',
                    gender: patient.gender || '',
                    address: patient.address || '',
                    diagnosis: '',
                    notes: '',
                  })
                }}
              />
            </label>
            <p className="mt-1.5 text-xs text-gray-500">
              After 3 characters, matching names appear. Click a name to use that patient, or keep typing to add someone new.
            </p>
            {existingMatch && (
              <div className="mt-3 flex flex-col gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-emerald-900">
                  <span className="font-semibold">{existingMatch.name}</span> is already in the clinic. Open their record to add a visit.
                </p>
                <button
                  type="button"
                  onClick={() => navigate(`/patients/${existingMatch._id}`)}
                  className="shrink-0 rounded-xl bg-black px-3 py-2 text-sm font-semibold text-white"
                >
                  Open patient
                </button>
              </div>
            )}
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <label className="text-sm font-medium text-gray-900">
                Phone Number <span className="text-xs font-normal text-gray-400">(Optional)</span>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-black"
                />
              </label>
              <label className="text-sm font-medium text-gray-900">
                Age
                <input
                  type="number"
                  min="0"
                  max="150"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  placeholder="Years"
                  className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-black"
                />
              </label>
              <label className="text-sm font-medium text-gray-900">
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
            <label className="mt-4 block text-sm font-medium text-gray-900">
              Address
              <textarea
                rows={3}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Street address, City, ZIP"
                className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-black"
              />
            </label>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Prescribed Medicine</h3>
              <div className="rounded-xl bg-gray-100 px-3 py-2 text-xs font-semibold tracking-wide text-gray-700">
                TOTAL EST. PROFIT {formatMoney(totalProfit)}
              </div>
            </div>
            <div className="mb-4 grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium text-gray-900">
                Diagnosis
                <input
                  value={form.diagnosis}
                  onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
                  placeholder="e.g. Routine checkup"
                  className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900"
                />
              </label>
              <label className="text-sm font-medium text-gray-900">
                Notes
                <input
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Optional clinical notes"
                  className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900"
                />
              </label>
            </div>
            <MedicineFormRows meds={meds} setMeds={setMeds} />
          </section>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => navigate(-1)} className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-900">
              Cancel
            </button>
            <button
              disabled={saving}
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving…' : 'Save Patient Record'}
            </button>
          </div>
        </form>
      </PageTransition>
    </AppLayout>
  )
}
