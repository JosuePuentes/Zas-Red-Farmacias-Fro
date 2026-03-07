import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { GeolocationProvider } from './context/GeolocationContext'
import { MasterPortalProvider } from './context/MasterPortalContext'

// Públicas
import Home from './pages/Home'
import Login from './pages/Login'
import RegisterCliente from './pages/RegisterCliente'
import RegisterDelivery from './pages/RegisterDelivery'
import RegisterFarmacia from './pages/RegisterFarmacia'
import ElegirPortal from './pages/ElegirPortal'

// Portales por rol
import AdminLayout from './layouts/AdminLayout'
import ClienteLayout from './layouts/ClienteLayout'
import FarmaciaLayout from './layouts/FarmaciaLayout'
import DeliveryLayout from './layouts/DeliveryLayout'

function isMasterUser(user: { role?: string; email?: string } | null): boolean {
  if (!user) return false
  const role = (user.role || '').toString().toLowerCase()
  const emailNorm = (user.email || '').toString().toLowerCase().trim()
  return role === 'master' || role === 'admin' || emailNorm === 'admin@zas.com'
}

function RedirectByRole() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/" replace />
  if (isMasterUser(user)) return <Navigate to="/elegir-portal" replace />
  switch (user.role) {
    case 'farmacia':
      return <Navigate to="/farmacia" replace />
    case 'delivery':
      return <Navigate to="/delivery" replace />
    case 'cliente':
    default:
      return <Navigate to="/cliente" replace />
  }
}

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles: string[] }) {
  const { user, isAuthenticated } = useAuth()
  if (!isAuthenticated || !user) return <Navigate to="/" replace />
  const allowed = roles.includes(user.role) || (roles.includes('admin') && isMasterUser(user))
  if (!allowed) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <AuthProvider>
      <GeolocationProvider>
        <MasterPortalProvider>
          <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<RegisterCliente />} />
        <Route path="/registro-delivery" element={<RegisterDelivery />} />
        <Route path="/registro-farmacia" element={<RegisterFarmacia />} />
        <Route path="/dashboard" element={<RedirectByRole />} />
        <Route
          path="/elegir-portal"
          element={
            <ProtectedRoute roles={['admin']}>
              <ElegirPortal />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cliente/*"
          element={
            <ProtectedRoute roles={['cliente', 'admin']}>
              <ClienteLayout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/farmacia/*"
          element={
            <ProtectedRoute roles={['farmacia', 'admin']}>
              <FarmaciaLayout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/delivery/*"
          element={
            <ProtectedRoute roles={['delivery', 'admin']}>
              <DeliveryLayout />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MasterPortalProvider>
      </GeolocationProvider>
    </AuthProvider>
  )
}
