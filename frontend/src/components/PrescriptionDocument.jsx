import { Logo } from './Logo.jsx'

import { medicineScheduleLabel } from '../lib/format.js'

export function formatPrescriptionDate(date = new Date()) {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function PrescriptionDocument({ patient, visit, printDate = new Date() }) {
  const medicines = (visit?.medicines || []).filter((m) => m.medicineName?.trim())

  return (
    <article className="prescription-sheet mx-auto max-w-2xl rounded-2xl border border-gray-200 bg-white p-8 shadow-sm sm:p-12 print:max-w-none print:rounded-none print:border-0 print:p-0 print:shadow-none">
      <header className="border-b-2 border-gray-900 pb-6 text-center">
        <div className="mb-4 flex justify-center">
          <Logo />
        </div>
        <p className="text-sm tracking-wide text-gray-500">Medical Prescription</p>
      </header>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:justify-between sm:gap-8">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Patient Name</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">{patient?.name || '—'}</p>
        </div>
        <div className="sm:text-right">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Date</p>
          <p className="mt-1 text-lg font-semibold text-gray-900">{formatPrescriptionDate(printDate)}</p>
        </div>
      </div>

      <p className="mt-8 text-4xl font-bold text-gray-900" aria-hidden="true">℞</p>

      <div className="mt-4 overflow-hidden rounded-xl border border-gray-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500">
            <tr>
              <th className="w-12 px-4 py-3 text-center font-semibold">#</th>
              <th className="px-4 py-3 font-semibold">Medicine</th>
              <th className="w-20 px-4 py-3 text-center font-semibold">Qty</th>
              <th className="px-4 py-3 font-semibold">Schedule</th>
            </tr>
          </thead>
          <tbody>
            {medicines.length > 0 ? (
              medicines.map((m, i) => (
                <tr key={`${m.medicineName}-${i}`} className="border-t border-gray-100">
                  <td className="px-4 py-3 text-center text-gray-500">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{m.medicineName}</td>
                  <td className="px-4 py-3 text-center text-gray-700">{m.quantity ?? 1}</td>
                  <td className="px-4 py-3 text-gray-700">{medicineScheduleLabel(m)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                  No medicines prescribed
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {visit?.diagnosis && (
        <p className="mt-6 text-sm text-gray-700">
          <span className="font-semibold text-gray-500">Diagnosis:</span> {visit.diagnosis}
        </p>
      )}

      <footer className="mt-12 border-t border-gray-200 pt-6 text-center text-xs text-gray-400">
        This is a computer-generated prescription from KAAB Medicare.
      </footer>
    </article>
  )
}
