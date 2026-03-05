import { useState } from 'react'

// Formulario para crear usuario de farmacia: gerente, RIF, nombre farmacia, dirección, teléfono, %, email, clave
export default function AdminFarmacias() {
  const [gerente, setGerente] = useState('')
  const [rif, setRif] = useState('')
  const [nombreFarmacia, setNombreFarmacia] = useState('')
  const [direccion, setDireccion] = useState('')
  const [telefono, setTelefono] = useState('')
  const [porcentaje, setPorcentaje] = useState('')
  const [email, setEmail] = useState('')
  const [clave, setClave] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // TODO: POST /api/admin/farmacias
    console.log({ gerente, rif, nombreFarmacia, direccion, telefono, porcentaje: Number(porcentaje), email, clave })
  }

  return (
    <div className="container">
      <h2>Registrar farmacia</h2>
      <p className="muted">Crea el usuario de la farmacia. El porcentaje se aplicará al precio de cada producto.</p>
      <form onSubmit={handleSubmit} className="card">
        <div className="form-group">
          <label>Nombre del gerente o encargado</label>
          <input value={gerente} onChange={(e) => setGerente(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>RIF de la farmacia</label>
          <input value={rif} onChange={(e) => setRif(e.target.value)} placeholder="J-12345678-9" required />
        </div>
        <div className="form-group">
          <label>Nombre de la farmacia</label>
          <input value={nombreFarmacia} onChange={(e) => setNombreFarmacia(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Dirección</label>
          <input value={direccion} onChange={(e) => setDireccion(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Número de contacto</label>
          <input type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Porcentaje sobre precios (%)</label>
          <input type="number" min="0" step="0.01" value={porcentaje} onChange={(e) => setPorcentaje(e.target.value)} placeholder="Ej: 10" required />
        </div>
        <div className="form-group">
          <label>Correo del usuario</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Contraseña del usuario</label>
          <input type="password" value={clave} onChange={(e) => setClave(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-primary">Crear usuario de farmacia</button>
      </form>
      <h3>Farmacias registradas</h3>
      <p className="muted">Listado desde backend.</p>
    </div>
  )
}
