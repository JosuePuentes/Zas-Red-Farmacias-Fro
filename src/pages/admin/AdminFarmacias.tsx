import { useEffect, useMemo, useState } from 'react'
import { masterApi, type FarmaciaMaster } from '../../api'

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

  const [farmacias, setFarmacias] = useState<FarmaciaMaster[]>([])
  const [loadingLista, setLoadingLista] = useState(true)
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    setLoadingLista(true)
    masterApi.farmacias()
      .then(setFarmacias)
      .catch(() => setFarmacias([]))
      .finally(() => setLoadingLista(false))
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // TODO: POST /api/admin/farmacias
    console.log({ gerente, rif, nombreFarmacia, direccion, telefono, porcentaje: Number(porcentaje), email, clave })
  }

  const farmaciasFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (!q) return farmacias
    return farmacias.filter((f) => {
      const nombre = (f.nombreFarmacia || '').toLowerCase()
      const rifF = (f.rif || '').toLowerCase()
      const direccionF = (f.direccion || '').toLowerCase()
      const telefonoF = (f.telefono || '').toLowerCase()
      const emailF = (f.email || '').toLowerCase()
      return (
        nombre.includes(q) ||
        rifF.includes(q) ||
        direccionF.includes(q) ||
        telefonoF.includes(q) ||
        emailF.includes(q)
      )
    })
  }, [farmacias, busqueda])

  return (
    <div className="container">
      <h2>Farmacias</h2>
      <p className="muted">Registro de farmacias y listado de todas las farmacias aprobadas.</p>

      <section className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginTop: 0 }}>Registrar farmacia (creación directa)</h3>
        <p className="muted">
          Uso interno del administrador. Las farmacias que se registran por el portal público siguen pasando por el flujo de solicitud.
        </p>
        <form onSubmit={handleSubmit}>
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
            <input
              type="number"
              min="0"
              step="0.01"
              value={porcentaje}
              onChange={(e) => setPorcentaje(e.target.value)}
              placeholder="Ej: 10"
              required
            />
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
      </section>

      <section>
        <h3>Farmacias registradas</h3>
        {loadingLista ? (
          <p className="muted">Cargando farmacias...</p>
        ) : (
          <>
            <div className="usr-m-toolbar" style={{ marginBottom: '0.75rem' }}>
              <input
                type="text"
                className="usr-m-search"
                placeholder="Buscar por nombre, RIF, dirección, teléfono o correo..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
              <span className="usr-m-total">
                Total de farmacias: <strong>{farmacias.length}</strong>
              </span>
            </div>
            {farmaciasFiltradas.length === 0 ? (
              <p className="muted">No se encontraron farmacias para los filtros aplicados.</p>
            ) : (
              <ul className="usr-m-list">
                {farmaciasFiltradas.map((f) => (
                  <li key={f._id} className="usr-m-item card">
                    <div className="usr-m-main">
                      <span className="usr-m-nombre">{f.nombreFarmacia}</span>
                      {f.email && <span className="usr-m-email">{f.email}</span>}
                    </div>
                    <div className="usr-m-extra">
                      <span className="usr-m-direccion">
                        RIF: {f.rif} — {f.direccion}
                      </span>
                      <span className="usr-m-telefono">{f.telefono}</span>
                      {f.estado && <span className="usr-m-role">Estado: {f.estado}</span>}
                      {f.lat != null && f.lng != null && (
                        <span className="usr-m-role" style={{ display: 'block', marginTop: 4 }}>
                          <a
                            href={`https://www.google.com/maps?q=${encodeURIComponent(`${f.nombreFarmacia} @ ${f.lat},${f.lng}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Ver ubicación en Google Maps
                          </a>
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>
    </div>
  )
}
