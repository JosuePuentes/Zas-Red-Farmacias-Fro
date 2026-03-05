import { useState } from 'react'
import { Link } from 'react-router-dom'
import { solicitudFarmaciaApi } from '../api'
import { ESTADOS_VENEZUELA } from '../constants/estados'
import './Auth.css'

export default function RegisterFarmacia() {
  const [form, setForm] = useState({
    rif: '',
    nombreFarmacia: '',
    direccion: '',
    nombreEncargado: '',
    telefono: '',
    email: '',
    password: '',
    estadoUbicacion: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await solicitudFarmaciaApi.enviar({
        rif: form.rif.trim(),
        nombreFarmacia: form.nombreFarmacia.trim(),
        direccion: form.direccion.trim(),
        nombreEncargado: form.nombreEncargado.trim(),
        telefono: form.telefono.trim(),
        email: form.email.trim(),
        password: form.password,
        estadoUbicacion: form.estadoUbicacion.trim() || undefined,
      })
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar solicitud')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card card container">
          <h1>Solicitud enviada</h1>
          <p className="auth-hint">
            Tu solicitud de registro como farmacia está siendo verificada por el administrador. Podrás acceder al panel cuando sea aprobada.
          </p>
          <Link to="/" className="btn btn-primary btn-block">Volver al inicio</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-card card container">
        <h1>Registrarse como farmacia</h1>
        <p className="auth-hint">RIF, nombre de la farmacia, dirección, encargado, teléfono, correo y contraseña.</p>
        <form onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}
          <div className="form-group">
            <label>RIF</label>
            <input name="rif" placeholder="RIF" value={form.rif} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Nombre de la farmacia</label>
            <input name="nombreFarmacia" placeholder="Nombre de la farmacia" value={form.nombreFarmacia} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Dirección</label>
            <input name="direccion" placeholder="Dirección" value={form.direccion} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Nombre del encargado o gerente</label>
            <input name="nombreEncargado" placeholder="Nombre del encargado o gerente" value={form.nombreEncargado} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Teléfono</label>
            <input name="telefono" type="tel" placeholder="Teléfono" value={form.telefono} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Correo electrónico</label>
            <input name="email" type="email" placeholder="Correo electrónico" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Estado (opcional)</label>
            <select name="estadoUbicacion" value={form.estadoUbicacion} onChange={handleChange}>
              <option value="">Seleccionar estado</option>
              {ESTADOS_VENEZUELA.map((est) => (
                <option key={est} value={est}>{est}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Contraseña (mín. 6 caracteres)</label>
            <input name="password" type="password" placeholder="Contraseña" value={form.password} onChange={handleChange} minLength={6} required />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar solicitud'}
          </button>
        </form>
        <Link to="/" className="auth-back">← Volver al inicio</Link>
      </div>
    </div>
  )
}
