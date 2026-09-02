'use client'

import dynamic from 'next/dynamic'

const ClinicApp = dynamic(
  () => import('@/components/clinic-app.jsx').then((mod) => mod.ClinicApp),
  {
    ssr: false,
    loading: () => (
      <div className="grid min-h-screen place-items-center text-sm text-gray-500">
        Loading…
      </div>
    ),
  },
)

export function ClinicAppLoader() {
  return <ClinicApp />
}
