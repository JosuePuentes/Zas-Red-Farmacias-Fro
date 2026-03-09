import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authApi } from '../api'
import './Auth.css'

export default function RecuperarPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setToken(null)
    setLoading(true)
    try {
      const { ok, data } = await authApi.recuperarPassword(email)
      if (!ok) {
        setError(
          (data as { error?: string; message?: string }).error ||
            (data as { message?: string }).message ||
            'No se pudo iniciar la recuperación de contraseña.',
        )
        return
      }
      const d = data as { token?: string }
      if (d.token) {
        setToken(d.token)
      }
    } catch (e) {
      console.error(e)
      setError('Error de red al solicitar recuperación.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card card container">
        <h1>¿Olvidaste tu contraseña?</h1>
        <p className="auth-hint">Ingresa tu correo y te daremos un token de recuperación (en producción se enviaría por correo).</p>
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
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Enviando…' : 'Enviar enlace/token'}
          </button>
        </form>

        {token && (
          <div className="card" style={{ marginTop: '1rem' }}>
            <p className="auth-hint">
              Token de prueba (solo visible en desarrollo). Úsalo en la pantalla de restablecer contraseña.
            </p>
            <code style={{ display: 'block', wordBreak: 'break-all' }}>{token}</code>
          </div>
        )}

        <Link to="/restablecer" className="auth-back">
          Ya tengo un token →
        </Link>
        <br />
        <Link to="/" className="auth-back">
          ← Volver al inicio
        </Link>
      </div>
    </div>
  )
}

