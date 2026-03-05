import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const result = await login(email, password)
    if ('error' in result) {
      setError(result.error)
      return
    }
    const role = (result.user.role || '').toString().toLowerCase()
    const emailNorm = (result.user.email || email || '').toString().toLowerCase().trim()
    const esMaster = role === 'master' || role === 'admin' || emailNorm === 'admin@zas.com'
    if (esMaster) {
      navigate('/admin', { replace: true })
    } else if (role === 'farmacia') {
      navigate('/farmacia', { replace: true })
    } else if (role === 'delivery') {
      navigate('/delivery', { replace: true })
    } else {
      navigate('/cliente', { replace: true })
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card card container">
        <h1>Iniciar sesión</h1>
        <p className="auth-hint">Ingresa con tu correo. Serás redirigido a tu panel según tu tipo de usuario.</p>
        <form onSubmit={handleSubmit}>
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
          <button type="submit" className="btn btn-primary btn-block">
            Entrar
          </button>
        </form>
        <Link to="/" className="auth-back">← Volver al inicio</Link>
      </div>
    </div>
  )
}
