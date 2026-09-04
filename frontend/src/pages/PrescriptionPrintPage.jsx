import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from '../../../lib/react-router-dom.jsx'
import { ArrowLeft, Printer } from 'lucide-react'
import { PrescriptionDocument } from '../components/PrescriptionDocument.jsx'
import { Loader, PageTransition } from '../components/ui.jsx'
import { api } from '../api/client.js'

export default function PrescriptionPrintPage() {
  const { id, visitId } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let live = true
    async function load() {
      setLoading(true)
      setError('')
      try {
        const res = await api.patient(id)
        if (!live) return
        const visit = (res.data.visits || []).find((v) => v._id === visitId)
        if (!visit) {
          setError('Visit not found.')
          setData(null)
          return
        }
        const hasMedicines = (visit.medicines || []).some((m) => m.medicineName?.trim())
        if (!hasMedicines) {
          setError('This visit has no medicines to print.')
          setData(null)
          return
        }
        setData({ patient: res.data.patient, visit })
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
  }, [id, visitId])

  function handlePrint() {
    window.print()
  }

  return (
    <div className="prescription-print-page min-h-screen bg-[#f6f7f9]">
      <div className="no-print sticky top-0 z-10 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={() => navigate(`/patients/${id}`)}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to record
          </button>
          <button
            type="button"
            onClick={handlePrint}
            disabled={!data}
            className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Printer className="h-4 w-4" />
            Print prescription
          </button>
        </div>
        <p className="mx-auto max-w-4xl px-4 pb-3 text-center text-xs text-gray-500 sm:px-6">
          No printer? In the print dialog, choose <strong>Save as PDF</strong> or{' '}
          <strong>Microsoft Print to PDF</strong> to test without a physical printer.
        </p>
      </div>

      <PageTransition>
        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
          {error && (
            <div className="no-print mb-6 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
              <Link to={`/patients/${id}`} className="ml-2 font-medium underline">
                Return to patient record
              </Link>
            </div>
          )}
          {loading ? (
            <Loader />
          ) : data ? (
            <PrescriptionDocument patient={data.patient} visit={data.visit} />
          ) : null}
        </main>
      </PageTransition>
    </div>
  )
}
