import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { solicitudDeliveryApi } from '../api'
import './Auth.css'

export default function RegisterDelivery() {
  const [tipoVehiculo, setTipoVehiculo] = useState<'moto' | 'carro'>('moto')
  const [cedula, setCedula] = useState('')
  const [nombresCompletos, setNombresCompletos] = useState('')
  const [direccion, setDireccion] = useState('')
  const [telefono, setTelefono] = useState('')
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [numeroLicencia, setNumeroLicencia] = useState('')
  const [matriculaVehiculo, setMatriculaVehiculo] = useState('')
  const [fotoLicencia, setFotoLicencia] = useState<File | null>(null)
  const [carnetCirculacion, setCarnetCirculacion] = useState<File | null>(null)
  const [fotoCarnet, setFotoCarnet] = useState<File | null>(null)
  const [fotoVehiculo, setFotoVehiculo] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!password || password.length < 6) {
      setError('Debes indicar una contraseña de al menos 6 caracteres.')
      return
    }
    if (password !== password2) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (!fotoLicencia || !carnetCirculacion || !fotoCarnet || !fotoVehiculo) {
      setError('Debes subir foto de licencia, carnet de circulación, foto tipo carnet y foto del vehículo.')
      return
    }
    if (!matriculaVehiculo.trim()) {
      setError('Debes indicar la matrícula del vehículo.')
      return
    }
    try {
      setLoading(true)
      await solicitudDeliveryApi.enviar({
        tipoVehiculo,
        cedula,
        nombresCompletos,
        direccion,
        telefono,
        correo,
        password,
        numeroLicencia,
        matriculaVehiculo,
        fotoLicencia,
        carnetCirculacion,
        fotoCarnet,
        fotoVehiculo,
      })
      navigate('/login')
    } catch (e) {
      console.error('Error al enviar solicitud de delivery', e)
      setError(e instanceof Error ? e.message : 'No se pudo enviar la solicitud. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card card container">
        <h1>Registro como repartidor</h1>
        <p className="auth-hint">Completa los datos. Un administrador validará tu solicitud.</p>
        <form onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}
          <div className="form-group">
            <label>Tipo de vehículo</label>
            <select value={tipoVehiculo} onChange={(e) => setTipoVehiculo(e.target.value as 'moto' | 'carro')}>
              <option value="moto">Moto</option>
              <option value="carro">Carro</option>
            </select>
          </div>
          <div className="form-group">
            <label>Cédula</label>
            <input value={cedula} onChange={(e) => setCedula(e.target.value)} placeholder="V-12345678" required />
          </div>
          <div className="form-group">
            <label>Nombres completos</label>
            <input value={nombresCompletos} onChange={(e) => setNombresCompletos(e.target.value)} placeholder="Nombre y apellido" required />
          </div>
          <div className="form-group">
            <label>Dirección</label>
            <input value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Tu dirección" required />
          </div>
          <div className="form-group">
            <label>Teléfono</label>
            <input type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="04121234567" required />
          </div>
          <div className="form-group">
            <label>Correo electrónico</label>
            <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="tu@correo.com" required />
          </div>
          <div className="form-group">
            <label>Contraseña para tu cuenta de delivery</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
            />
          </div>
          <div className="form-group">
            <label>Repetir contraseña</label>
            <input
              type="password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              placeholder="Repite la contraseña"
              required
            />
          </div>
          <div className="form-group">
            <label>Número de licencia de conducir</label>
            <input value={numeroLicencia} onChange={(e) => setNumeroLicencia(e.target.value)} placeholder="Número de licencia" required />
          </div>
          <div className="form-group">
            <label>Matrícula del vehículo</label>
            <input
              value={matriculaVehiculo}
              onChange={(e) => setMatriculaVehiculo(e.target.value)}
              placeholder="Placa / matrícula del vehículo"
              required
            />
          </div>
          <div className="form-group">
            <label>Foto de la licencia</label>
            <input type="file" accept="image/*" onChange={(e) => setFotoLicencia(e.target.files?.[0] ?? null)} required />
          </div>
          <div className="form-group">
            <label>Carnet de circulación del vehículo</label>
            <input type="file" accept="image/*" onChange={(e) => setCarnetCirculacion(e.target.files?.[0] ?? null)} required />
          </div>
          <div className="form-group">
            <label>Foto tipo carnet</label>
            <input type="file" accept="image/*" onChange={(e) => setFotoCarnet(e.target.files?.[0] ?? null)} required />
          </div>
          <div className="form-group">
            <label>Foto del vehículo</label>
            <input type="file" accept="image/*" onChange={(e) => setFotoVehiculo(e.target.files?.[0] ?? null)} required />
          </div>
          <button type="submit" className="btn btn-primary btn-block">
            {loading ? 'Enviando...' : 'Enviar solicitud'}
          </button>
        </form>
        <Link to="/" className="auth-back">← Volver al inicio</Link>
      </div>
    </div>
  )
}
