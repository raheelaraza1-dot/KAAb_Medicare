import { useEffect, useRef, useState } from 'react'
import { User } from 'lucide-react'
import { api } from '../api/client.js'

const MIN_SEARCH_CHARS = 3

export function PatientNameAutocomplete({ value, onChange, onSelectExisting, placeholder = 'e.g. Jane Doe', className = '' }) {
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
    if (term.length < MIN_SEARCH_CHARS) {
      setSuggestions([])
      setOpen(false)
      setLoading(false)
      return
    }
    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.patients(term, { limit: 12 })
        const list = res.data || []
        setSuggestions(list)
        setOpen(true)
        setActiveIndex(-1)
      } catch {
        setSuggestions([])
        setOpen(false)
      } finally {
        setLoading(false)
      }
    }, 200)
    return () => clearTimeout(debounceRef.current)
  }, [value])

  function pick(patient) {
    onChange(patient.name)
    onSelectExisting?.(patient)
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
    <div ref={wrapRef} className={`relative min-w-0 ${className}`}>
      <input
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => value.trim().length >= MIN_SEARCH_CHARS && setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        className="mt-1.5 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-black"
      />
      {open && value.trim().length >= MIN_SEARCH_CHARS && (
        <ul className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
          <li className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Matching names</li>
          {suggestions.length === 0 && !loading ? (
            <li className="px-3 py-2.5 text-sm text-gray-500">No matching patient. Continue to add a new record.</li>
          ) : (
            suggestions.map((patient, i) => (
              <li key={patient._id}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(patient)}
                  className={`flex w-full items-start gap-2 px-3 py-2.5 text-left text-sm transition-colors hover:bg-gray-50 ${
                    i === activeIndex ? 'bg-gray-50' : ''
                  }`}
                >
                  <User className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-gray-900">{patient.name}</span>
                    <span className="mt-0.5 block text-xs text-gray-500">
                      Click to use this patient
                      {patient.phone ? ` · ${patient.phone}` : ''}
                      {patient.totalVisits > 0 ? ` · ${patient.totalVisits} visit${patient.totalVisits === 1 ? '' : 's'}` : ''}
                    </span>
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
      {loading && value.trim().length >= MIN_SEARCH_CHARS && (
        <p className="pointer-events-none absolute right-3 top-[calc(50%+0.375rem)] -translate-y-1/2 text-xs text-gray-400">
          Searching…
        </p>
      )}
    </div>
  )
}
