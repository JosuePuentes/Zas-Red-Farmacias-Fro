import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

// Públicas
import Home from './pages/Home'
import Login from './pages/Login'
import RegisterCliente from './pages/RegisterCliente'
import RegisterDelivery from './pages/RegisterDelivery'

// Portales por rol
import AdminLayout from './layouts/AdminLayout'
import ClienteLayout from './layouts/ClienteLayout'
import FarmaciaLayout from './layouts/FarmaciaLayout'
import DeliveryLayout from './layouts/DeliveryLayout'

function RedirectByRole() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/" replace />
  switch (user.role) {
    case 'admin':
      return <Navigate to="/admin" replace />
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
  if (!roles.includes(user.role)) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<RegisterCliente />} />
        <Route path="/registro-delivery" element={<RegisterDelivery />} />
        <Route path="/dashboard" element={<RedirectByRole />} />

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
            <ProtectedRoute roles={['cliente']}>
              <ClienteLayout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/farmacia/*"
          element={
            <ProtectedRoute roles={['farmacia']}>
              <FarmaciaLayout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/delivery/*"
          element={
            <ProtectedRoute roles={['delivery']}>
              <DeliveryLayout />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
