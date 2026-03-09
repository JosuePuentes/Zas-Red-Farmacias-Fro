import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authApi } from '../api'
import './Auth.css'

export default function RestablecerPassword() {
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    if (!token || !password) {
      setError('Token y nueva contraseña son requeridos.')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }
    setLoading(true)
    try {
      const { ok, data } = await authApi.restablecerPassword(token, password)
      if (!ok) {
        setError(
          (data as { error?: string; message?: string }).error ||
            (data as { message?: string }).message ||
            'No se pudo restablecer la contraseña.',
        )
        return
      }
      setSuccess('Contraseña restablecida correctamente. Ya puedes iniciar sesión.')
    } catch (e) {
      console.error(e)
      setError('Error de red al restablecer la contraseña.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card card container">
        <h1>Restablecer contraseña</h1>
        <p className="auth-hint">Introduce el token de recuperación y tu nueva contraseña.</p>
        <form onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-error" style={{ background: '#dcfce7', color: '#166534' }}>{success}</div>}
          <div className="form-group">
            <label>Token</label>
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Pega aquí tu token"
              required
            />
          </div>
          <div className="form-group">
            <label>Nueva contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Confirmar contraseña</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Guardando…' : 'Restablecer contraseña'}
          </button>
        </form>
        <Link to="/login" className="auth-back">
          Ir a iniciar sesión →
        </Link>
        <br />
        <Link to="/" className="auth-back">
          ← Volver al inicio
        </Link>
      </div>
    </div>
  )
}

