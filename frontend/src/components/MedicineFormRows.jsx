import { AnimatePresence, motion } from '../../../lib/framer-motion.jsx'
import { Plus, Trash2 } from 'lucide-react'
import { MedicineAutocomplete } from './MedicineAutocomplete.jsx'
import { formatMoney, lineProfit } from '../lib/format.js'

export const emptyMed = () => ({ medicineName: '', tradePrice: '', sellingPrice: '', quantity: '1' })

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

  if (compact) {
    return (
      <div className="space-y-3">
        {meds.map((m, i) => (
          <div key={i} className="grid grid-cols-2 gap-2">
            <MedicineAutocomplete
              value={m.medicineName}
              onChange={(v) => updateMed(i, 'medicineName', v)}
              onSelect={(selected) => applySelection(i, selected)}
              placeholder="Medicine"
              className="col-span-2"
            />
            <input
              type="number"
              min="0"
              step="0.01"
              value={m.tradePrice}
              onChange={(e) => updateMed(i, 'tradePrice', e.target.value)}
              placeholder="Trade"
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900"
            />
            <input
              type="number"
              min="0"
              step="0.01"
              value={m.sellingPrice}
              onChange={(e) => updateMed(i, 'sellingPrice', e.target.value)}
              placeholder="Selling"
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900"
            />
            <input
              type="number"
              min="0"
              value={m.quantity}
              onChange={(e) => updateMed(i, 'quantity', e.target.value)}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900"
            />
            <p className="self-center text-sm text-gray-900">{formatMoney(lineProfit(m.sellingPrice, m.tradePrice, m.quantity))}</p>
          </div>
        ))}
        <button type="button" onClick={() => setMeds((rows) => [...rows, emptyMed()])} className="text-sm font-medium text-gray-900">
          + Add medicine
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="hidden grid-cols-[1.4fr_repeat(4,0.7fr)_auto] gap-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400 lg:grid">
        <span>Medicine name</span>
        <span>Trade price</span>
        <span>Selling price</span>
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
              <MedicineAutocomplete
                value={m.medicineName}
                onChange={(v) => updateMed(i, 'medicineName', v)}
                onSelect={(selected) => applySelection(i, selected)}
                placeholder="e.g. Amoxicillin 500mg"
              />
              <input
                type="number"
                min="0"
                step="0.01"
                value={m.tradePrice}
                onChange={(e) => updateMed(i, 'tradePrice', e.target.value)}
                placeholder="0.00"
                className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900"
              />
              <input
                type="number"
                min="0"
                step="0.01"
                value={m.sellingPrice}
                onChange={(e) => updateMed(i, 'sellingPrice', e.target.value)}
                placeholder="0.00"
                className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900"
              />
              <input
                type="number"
                min="0"
                value={m.quantity}
                onChange={(e) => updateMed(i, 'quantity', e.target.value)}
                className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900"
              />
              <div className="flex items-center px-1 text-sm font-medium text-gray-900">
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
        className="mt-4 inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-50"
      >
        <Plus className="h-4 w-4" /> Add another medicine
      </button>
    </>
  )
}
