import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Auth.css'

export default function RegisterCliente() {
  const [cedula, setCedula] = useState('')
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [direccion, setDireccion] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    // TODO: POST /api/registro/cliente
    console.log({ cedula, nombre, apellido, direccion, email, password })
    navigate('/login')
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
            <label>Dirección</label>
            <input value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Dirección de entrega" required />
          </div>
          <div className="form-group">
            <label>Correo electrónico</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" required />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <button type="submit" className="btn btn-primary btn-block">
            Registrarme
          </button>
        </form>
        <Link to="/" className="auth-back">← Volver al inicio</Link>
      </div>
    </div>
  )
}
