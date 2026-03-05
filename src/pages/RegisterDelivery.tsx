import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Auth.css'

export default function RegisterDelivery() {
  const [tipoVehiculo, setTipoVehiculo] = useState<'moto' | 'carro'>('moto')
  const [cedula, setCedula] = useState('')
  const [nombresCompletos, setNombresCompletos] = useState('')
  const [direccion, setDireccion] = useState('')
  const [telefono, setTelefono] = useState('')
  const [correo, setCorreo] = useState('')
  const [numeroLicencia, setNumeroLicencia] = useState('')
  const [fotoLicencia, setFotoLicencia] = useState<File | null>(null)
  const [carnetCirculacion, setCarnetCirculacion] = useState<File | null>(null)
  const [fotoCarnet, setFotoCarnet] = useState<File | null>(null)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!fotoLicencia || !carnetCirculacion || !fotoCarnet) {
      setError('Debes subir foto de licencia, carnet de circulación y foto tipo carnet.')
      return
    }
    // TODO: POST /api/registro/delivery con FormData
    console.log({ tipoVehiculo, cedula, nombresCompletos, direccion, telefono, correo, numeroLicencia })
    navigate('/')
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
            <label>Número de licencia de conducir</label>
            <input value={numeroLicencia} onChange={(e) => setNumeroLicencia(e.target.value)} placeholder="Número de licencia" required />
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
          <button type="submit" className="btn btn-primary btn-block">
            Enviar solicitud
          </button>
        </form>
        <Link to="/" className="auth-back">← Volver al inicio</Link>
      </div>
    </div>
  )
}
