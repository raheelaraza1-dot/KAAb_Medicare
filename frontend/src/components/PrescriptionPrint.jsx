import { Link } from 'react-router-dom'
import { Printer } from 'lucide-react'

export function PrintPrescriptionButton({ patient, visit, className = '', disabled = false }) {
  const hasMedicines = (visit?.medicines || []).some((m) => m.medicineName?.trim())
  const isDisabled = disabled || !hasMedicines || !patient?._id || !visit?._id

  const defaultClassName =
    'inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40'

  if (isDisabled) {
    return (
      <button
        type="button"
        disabled
        title="No medicines to print"
        className={className || defaultClassName}
      >
        <Printer className="h-3.5 w-3.5" />
        Print
      </button>
    )
  }

  return (
    <Link
      to={`/patients/${patient._id}/prescription/${visit._id}`}
      title="View and print prescription"
      className={className || defaultClassName}
    >
      <Printer className="h-3.5 w-3.5" />
      Print
    </Link>
  )
}
