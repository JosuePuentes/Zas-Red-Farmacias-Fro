import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../api'
import './Auth.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [solicitudPendiente, setSolicitudPendiente] = useState(false)
  const { login, setAuth } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSolicitudPendiente(false)
    setLoading(true)
    try {
      const { ok, status, data } = await authApi.loginWithStatus(email, password)
      if (status === 403) {
        const code = (data as { code?: string }).code
        if (code === 'SOLICITUD_FARMACIA_PENDIENTE') {
          setSolicitudPendiente(true)
          setError((data as { error?: string }).error || 'Tu solicitud de farmacia está siendo verificada por el administrador.')
          return
        }
        if (code === 'SOLICITUD_DELIVERY_PENDIENTE') {
          setSolicitudPendiente(true)
          setError((data as { error?: string }).error || 'Tu solicitud de delivery está siendo verificada por el administrador.')
          return
        }
      }
      if (ok && (data as { token?: string; user?: unknown }).token && (data as { user?: unknown }).user) {
        const d = data as { token: string; user: { role?: string; email?: string; id?: string; nombre?: string; apellido?: string } }
        setAuth(d.token, {
          id: d.user.id || '',
          email: d.user.email || email,
          role: d.user.role as 'admin' | 'cliente' | 'farmacia' | 'delivery' | 'master',
          nombre: d.user.nombre,
          apellido: d.user.apellido,
        })
        const role = (d.user.role || '').toString().toLowerCase()
        const emailNorm = (d.user.email || email || '').toString().toLowerCase().trim()
        const esMaster = role === 'master' || role === 'admin' || emailNorm === 'admin@zas.com'
        if (esMaster) navigate('/elegir-portal', { replace: true })
        else if (role === 'farmacia') navigate('/farmacia', { replace: true })
        else if (role === 'delivery') navigate('/delivery', { replace: true })
        else navigate('/cliente', { replace: true })
        return
      }
      setError((data as { error?: string; message?: string }).error || (data as { message?: string }).message || 'Error al iniciar sesión')
    } catch (_err) {
      const mockResult = await login(email, password)
      if ('error' in mockResult) {
        setError(mockResult.error)
        return
      }
      const role = (mockResult.user.role || '').toString().toLowerCase()
      const emailNorm = (mockResult.user.email || email || '').toString().toLowerCase().trim()
      const esMaster = role === 'master' || role === 'admin' || emailNorm === 'admin@zas.com'
      if (esMaster) navigate('/elegir-portal', { replace: true })
      else if (role === 'farmacia') navigate('/farmacia', { replace: true })
      else if (role === 'delivery') navigate('/delivery', { replace: true })
      else navigate('/cliente', { replace: true })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card card container">
        <h1>Iniciar sesión</h1>
        <p className="auth-hint">Ingresa con tu correo. Serás redirigido a tu panel según tu tipo de usuario.</p>
        <form onSubmit={handleSubmit}>
          {solicitudPendiente && (
            <p className="auth-info" style={{ color: 'var(--color-primary)', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
              Tu solicitud está siendo verificada. Podrás acceder cuando el administrador la apruebe.
            </p>
          )}
          {error && <div className="auth-error">{error}</div>}
          <div className="form-group">
            <label>Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <Link to="/recuperar" className="auth-back">
          ¿Olvidaste tu contraseña?
        </Link>
        <Link to="/" className="auth-back">← Volver al inicio</Link>
      </div>
    </div>
  )
}
