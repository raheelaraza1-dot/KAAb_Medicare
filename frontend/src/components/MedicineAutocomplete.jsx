import { useEffect, useRef, useState } from 'react'
import { Pill } from 'lucide-react'
import { api } from '../api/client.js'
import { formatMoney } from '../lib/format.js'

export function MedicineAutocomplete({ value, onChange, onSelect, placeholder = 'e.g. Amoxicillin 500mg', className = '' }) {
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const wrapRef = useRef(null)
  const debounceRef = useRef(null)

  useEffect(() => {
    function onDocClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false)
        setActiveIndex(-1)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    const term = String(value || '').trim()
    if (term.length < 1) {
      setSuggestions([])
      setOpen(false)
      setLoading(false)
      return
    }
    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.searchMedicines(term)
        setSuggestions(res.data || [])
        setOpen((res.data || []).length > 0)
        setActiveIndex(-1)
      } catch {
        setSuggestions([])
        setOpen(false)
      } finally {
        setLoading(false)
      }
    }, 250)
    return () => clearTimeout(debounceRef.current)
  }, [value])

  function pick(item) {
    onChange(item.medicineName)
    onSelect?.({
      medicineName: item.medicineName,
      tradePrice: String(item.tradePrice ?? ''),
      sellingPrice: String(item.sellingPrice ?? ''),
    })
    setOpen(false)
    setActiveIndex(-1)
  }

  function onKeyDown(e) {
    if (!open || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => (i + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      pick(suggestions[activeIndex])
    } else if (e.key === 'Escape') {
      setOpen(false)
      setActiveIndex(-1)
    }
  }

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-black"
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
          {suggestions.map((item, i) => (
            <li key={item.medicineName}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(item)}
                className={`flex w-full items-start gap-2 px-3 py-2.5 text-left text-sm transition-colors hover:bg-gray-50 ${
                  i === activeIndex ? 'bg-gray-50' : ''
                }`}
              >
                <Pill className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-gray-900">{item.medicineName}</span>
                  <span className="mt-0.5 block text-xs text-gray-500">
                    Trade {formatMoney(item.tradePrice)} · Selling {formatMoney(item.sellingPrice)}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {loading && value.trim().length > 0 && (
        <p className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">Searching…</p>
      )}
    </div>
  )
}
