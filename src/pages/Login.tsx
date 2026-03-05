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
    const role = result.user.role
    if (role === 'admin') navigate('/admin')
    else if (role === 'farmacia') navigate('/farmacia')
    else if (role === 'delivery') navigate('/delivery')
    else navigate('/cliente')
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
