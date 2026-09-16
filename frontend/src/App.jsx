import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useAuth } from './context/AuthContext.jsx'

const LoginPage = lazy(() => import('./pages/LoginPage.jsx'))
const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'))
const PatientsPage = lazy(() => import('./pages/PatientsPage.jsx'))
const AddPatientPage = lazy(() => import('./pages/AddPatientPage.jsx'))
const PatientProfilePage = lazy(() => import('./pages/PatientProfilePage.jsx'))
const PrescriptionPrintPage = lazy(() => import('./pages/PrescriptionPrintPage.jsx'))
const ReportsPage = lazy(() => import('./pages/ReportsPage.jsx'))
const SettingsPage = lazy(() => import('./pages/SettingsPage.jsx'))

function PageLoader() {
  return (
    <div className="grid min-h-[50vh] place-items-center text-sm text-gray-500">
      Loading…
    </div>
  )
}

function Protected({ children }) {
  const { isAuthenticated, isReady } = useAuth()
  if (!isReady) return <PageLoader />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

function withSuspense(page) {
  return <Suspense fallback={<PageLoader />}>{page}</Suspense>
}

export default function App() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/login" element={withSuspense(<LoginPage />)} />
        <Route
          path="/"
          element={
            <Protected>
              {withSuspense(<DashboardPage />)}
            </Protected>
          }
        />
        <Route
          path="/patients"
          element={
            <Protected>
              {withSuspense(<PatientsPage />)}
            </Protected>
          }
        />
        <Route
          path="/patients/new"
          element={
            <Protected>
              {withSuspense(<AddPatientPage />)}
            </Protected>
          }
        />
        <Route
          path="/patients/:id/prescription/:visitId"
          element={
            <Protected>
              {withSuspense(<PrescriptionPrintPage />)}
            </Protected>
          }
        />
        <Route
          path="/patients/:id"
          element={
            <Protected>
              {withSuspense(<PatientProfilePage />)}
            </Protected>
          }
        />
        <Route
          path="/reports"
          element={
            <Protected>
              {withSuspense(<ReportsPage />)}
            </Protected>
          }
        />
        <Route
          path="/settings"
          element={
            <Protected>
              {withSuspense(<SettingsPage />)}
            </Protected>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}
