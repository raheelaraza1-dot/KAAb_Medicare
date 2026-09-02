'use client'

import { BrowserRouter } from '../lib/react-router-dom.jsx'
import App from '../frontend/src/App.jsx'
import { AuthProvider } from '../frontend/src/context/AuthContext.jsx'

export function ClinicApp() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  )
}
