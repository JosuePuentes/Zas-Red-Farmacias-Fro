import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Auth.css'
import { authApi } from '../api'
import { useAuth } from '../context/AuthContext'
import { useGeolocation } from '../context/GeolocationContext'
import { ESTADOS_VENEZUELA } from '../constants/estados'
import { getMunicipiosByEstado } from '../constants/municipios'

export default function RegisterCliente() {
  const [cedula, setCedula] = useState('')
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [direccion, setDireccion] = useState('')
  const [estado, setEstado] = useState('')
  const [municipio, setMunicipio] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setAuth } = useAuth()
  const { requestLocation, loading: gpsLoading, error: gpsError, clearError: clearGpsError } = useGeolocation()

  const municipios = useMemo(() => getMunicipiosByEstado(estado), [estado])

  async function handleUsarUbicacion() {
    clearGpsError()
    const pos = await requestLocation()
    if (pos) setCoords(pos)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { ok, data } = await authApi.registerCliente({
        cedula: cedula.trim(),
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        direccion: direccion.trim(),
        telefono: telefono.trim(),
        email: email.trim(),
        password,
        ...(estado && { estado }),
        ...(municipio && { municipio }),
        ...(coords && { lat: coords.lat, lng: coords.lng }),
      })
      if (ok && (data as { token?: string }).token && (data as { user?: unknown }).user) {
        const d = data as { token: string; user: { role?: string; email?: string; id?: string; nombre?: string; apellido?: string } }
        setAuth(d.token, {
          id: d.user.id || '',
          email: d.user.email || email,
          role: 'cliente',
          nombre: d.user.nombre || nombre,
          apellido: d.user.apellido || apellido,
        })
        navigate('/cliente', { replace: true })
        return
      }
      setError(
        (data as { error?: string; message?: string }).error ||
        (data as { message?: string }).message ||
        'No se pudo crear la cuenta. Inténtalo nuevamente.',
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la cuenta de cliente')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card card container">
        <h1>Crear cuenta (Cliente)</h1>
        <form onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}
          <div className="form-group">
            <label>Cédula</label>
            <input value={cedula} onChange={(e) => setCedula(e.target.value)} placeholder="V-12345678" required />
          </div>
          <div className="form-group">
            <label>Nombre</label>
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Tu nombre" required />
          </div>
          <div className="form-group">
            <label>Apellido</label>
            <input value={apellido} onChange={(e) => setApellido(e.target.value)} placeholder="Tu apellido" required />
          </div>
          <div className="form-group">
            <label>Estado</label>
            <select value={estado} onChange={(e) => { setEstado(e.target.value); setMunicipio(''); }} required>
              <option value="">Selecciona estado</option>
              {ESTADOS_VENEZUELA.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Municipio</label>
            <select value={municipio} onChange={(e) => setMunicipio(e.target.value)} required disabled={!estado}>
              <option value="">Selecciona municipio</option>
              {municipios.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Dirección</label>
            <input value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Dirección de entrega" required />
          </div>
          <div className="form-group">
            <button type="button" className="btn btn-secondary btn-block" onClick={handleUsarUbicacion} disabled={gpsLoading}>
              {gpsLoading ? 'Obteniendo ubicación…' : 'Usar mi ubicación (GPS)'}
            </button>
            {gpsError && <p className="auth-error" style={{ marginTop: 4 }}>{gpsError}</p>}
            {coords && <p className="muted" style={{ marginTop: 4 }}>Coordenadas guardadas: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}</p>}
          </div>
          <div className="form-group">
            <label>Teléfono</label>
            <input
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="Ej: 0412-0000000"
              required
            />
          </div>
          <div className="form-group">
            <label>Correo electrónico</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" required />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Registrarme'}
          </button>
        </form>
        <Link to="/" className="auth-back">← Volver al inicio</Link>
      </div>
    </div>
  )
}
