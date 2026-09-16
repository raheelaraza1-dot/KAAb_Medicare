import { Fragment } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Trash2 } from 'lucide-react'
import { MedicineAutocomplete } from './MedicineAutocomplete.jsx'
import { formatMoney, lineProfit } from '../lib/format.js'

export const emptyMed = () => ({
  medicineName: '',
  tradePrice: '',
  sellingPrice: '',
  quantity: '1',
  morning: false,
  noon: false,
  night: false,
})

export function medFromVisit(m) {
  return {
    medicineName: m.medicineName,
    tradePrice: String(m.tradePrice),
    sellingPrice: String(m.sellingPrice),
    quantity: String(m.quantity),
    morning: !!m.morning,
    noon: !!m.noon,
    night: !!m.night,
  }
}

export function medToPayload(m) {
  return {
    medicineName: m.medicineName.trim(),
    tradePrice: Number(m.tradePrice) || 0,
    sellingPrice: Number(m.sellingPrice) || 0,
    quantity: Number(m.quantity) || 1,
    morning: !!m.morning,
    noon: !!m.noon,
    night: !!m.night,
  }
}

const inputClass =
  'w-full min-w-0 rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-black'

function ScheduleChecks({ med, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
      <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">Take</span>
      {[
        { key: 'morning', label: 'Morning' },
        { key: 'noon', label: 'Noon' },
        { key: 'night', label: 'Night' },
      ].map(({ key, label }) => (
        <label key={key} className="inline-flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={!!med[key]}
            onChange={(e) => onChange(key, e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
          />
          {label}
        </label>
      ))}
    </div>
  )
}

function MobileMedicineCard({ m, i, updateMed, applySelection, onRemove }) {
  return (
    <div className="space-y-3 rounded-xl border border-gray-100 p-3">
      <div className="min-w-0">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Medicine name</p>
        <MedicineAutocomplete
          value={m.medicineName}
          onChange={(v) => updateMed(i, 'medicineName', v)}
          onSelect={(selected) => applySelection(i, selected)}
          placeholder="e.g. Amoxicillin 500mg"
          className="min-w-0"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="min-w-0">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Trade price</p>
          <input
            type="number"
            min="0"
            step="0.01"
            value={m.tradePrice}
            onChange={(e) => updateMed(i, 'tradePrice', e.target.value)}
            placeholder="0.00"
            className={inputClass}
          />
        </div>
        <div className="min-w-0">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Selling price</p>
          <input
            type="number"
            min="0"
            step="0.01"
            value={m.sellingPrice}
            onChange={(e) => updateMed(i, 'sellingPrice', e.target.value)}
            placeholder="0.00"
            className={inputClass}
          />
        </div>
        <div className="min-w-0">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Qty</p>
          <input
            type="number"
            min="0"
            value={m.quantity}
            onChange={(e) => updateMed(i, 'quantity', e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="min-w-0">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Profit</p>
          <p className="flex h-[42px] items-center text-sm font-medium text-gray-900">
            {formatMoney(lineProfit(m.sellingPrice, m.tradePrice, m.quantity))}
          </p>
        </div>
      </div>
      <ScheduleChecks med={m} onChange={(key, value) => updateMed(i, key, value)} />
      <button
        type="button"
        onClick={onRemove}
        className="text-sm font-medium text-rose-600 hover:text-rose-700"
      >
        Remove medicine
      </button>
    </div>
  )
}

export function MedicineFormRows({ meds, setMeds, compact = false }) {
  function updateMed(i, key, value) {
    setMeds((rows) => rows.map((row, idx) => (idx === i ? { ...row, [key]: value } : row)))
  }

  function applySelection(i, selected) {
    setMeds((rows) =>
      rows.map((row, idx) =>
        idx === i
          ? {
              ...row,
              medicineName: selected.medicineName,
              tradePrice: selected.tradePrice,
              sellingPrice: selected.sellingPrice,
            }
          : row,
      ),
    )
  }

  function removeRow(i) {
    setMeds((rows) => (rows.length === 1 ? [emptyMed()] : rows.filter((_, idx) => idx !== i)))
  }

  if (compact) {
    return (
      <div className="space-y-3">
        {meds.map((m, i) => (
          <MobileMedicineCard
            key={i}
            m={m}
            i={i}
            updateMed={updateMed}
            applySelection={applySelection}
            onRemove={() => removeRow(i)}
          />
        ))}
        <button type="button" onClick={() => setMeds((rows) => [...rows, emptyMed()])} className="text-sm font-medium text-gray-900">
          + Add medicine
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[760px] table-fixed border-separate border-spacing-x-2 border-spacing-y-0">
          <colgroup>
            <col className="w-[34%]" />
            <col className="w-[14%]" />
            <col className="w-[14%]" />
            <col className="w-[10%]" />
            <col className="w-[14%]" />
            <col className="w-[48px]" />
          </colgroup>
          <thead>
            <tr className="text-left text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              <th className="pb-2 font-semibold">Medicine name</th>
              <th className="pb-2 font-semibold">Trade price</th>
              <th className="pb-2 font-semibold">Selling price</th>
              <th className="pb-2 font-semibold">Qty</th>
              <th className="pb-2 font-semibold">Profit</th>
              <th className="pb-2" aria-hidden="true" />
            </tr>
          </thead>
          <tbody>
            {meds.map((m, i) => (
              <Fragment key={i}>
                <tr className="align-top">
                  <td className="min-w-0 pb-1 pt-2">
                    <MedicineAutocomplete
                      value={m.medicineName}
                      onChange={(v) => updateMed(i, 'medicineName', v)}
                      onSelect={(selected) => applySelection(i, selected)}
                      placeholder="e.g. Amoxicillin 500mg"
                      className="min-w-0"
                    />
                  </td>
                  <td className="min-w-0 pb-1 pt-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={m.tradePrice}
                      onChange={(e) => updateMed(i, 'tradePrice', e.target.value)}
                      placeholder="0.00"
                      className={inputClass}
                    />
                  </td>
                  <td className="min-w-0 pb-1 pt-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={m.sellingPrice}
                      onChange={(e) => updateMed(i, 'sellingPrice', e.target.value)}
                      placeholder="0.00"
                      className={inputClass}
                    />
                  </td>
                  <td className="min-w-0 pb-1 pt-2">
                    <input
                      type="number"
                      min="0"
                      value={m.quantity}
                      onChange={(e) => updateMed(i, 'quantity', e.target.value)}
                      className={inputClass}
                    />
                  </td>
                  <td className="min-w-0 pb-1 pt-2">
                    <div className="flex h-[42px] items-center px-1 text-sm font-medium text-gray-900">
                      {formatMoney(lineProfit(m.sellingPrice, m.tradePrice, m.quantity))}
                    </div>
                  </td>
                  <td className="pb-1 pt-2">
                    <button
                      type="button"
                      onClick={() => removeRow(i)}
                      className="grid h-10 w-10 place-items-center rounded-xl text-gray-400 hover:bg-rose-50 hover:text-rose-600"
                      aria-label="Remove medicine"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
                <tr>
                  <td colSpan={6} className="pb-4 pt-1">
                    <ScheduleChecks med={m} onChange={(key, value) => updateMed(i, key, value)} />
                  </td>
                </tr>
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-2 space-y-3 lg:hidden">
        <AnimatePresence>
          {meds.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
            >
              <MobileMedicineCard
                m={m}
                i={i}
                updateMed={updateMed}
                applySelection={applySelection}
                onRemove={() => removeRow(i)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <button
        type="button"
        onClick={() => setMeds((rows) => [...rows, emptyMed()])}
        className="mt-4 inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50"
      >
        <Plus className="h-4 w-4" /> Add another medicine
      </button>
    </>
  )
}
