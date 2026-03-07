import { useState } from 'react'

const BENEFICIOS = [
  'Lista comparativa de precios: registra tus proveedores y sus condiciones; el sistema compara listas y te muestra el mejor precio del mercado.',
  'Carrito de compras: agrega cada producto que vayas seleccionando desde la lista comparativa.',
  'Órdenes de compra: agrupa productos por proveedor, arma órdenes de compra y exporta a Excel o PDF.',
  'Historial por proveedor: contador de compras por proveedor; sugerencias de compra según tus pedidos anteriores.',
  'Alertas de precio: notificación cuando un producto baja de precio respecto a tu último precio.',
  'Categorización automática: el sistema identifica tipo de medicamento (antialérgico, antibiótico, etc.) en las listas de precios.',
  'Notificaciones inteligentes: alertas según tu inventario (ej. pocos antialérgicos) y según demanda (pedidos masivos de algún tipo); medicamentos priorizados resaltados en la lista comparativa.',
]

interface PlanProModalProps {
  onClose: () => void
  onSolicitudEnviada?: () => void
}

export default function PlanProModal({ onClose, onSolicitudEnviada }: PlanProModalProps) {
  const [step, setStep] = useState<'explicativo' | 'pago'>('explicativo')
  const [bancoEmisor, setBancoEmisor] = useState('')
  const [numeroReferencia, setNumeroReferencia] = useState('')
  const [comprobante, setComprobante] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [enviado, setEnviado] = useState(false)

  function handleComprarPlan() {
    setStep('pago')
    setError('')
  }

  async function handlePagoRealizado(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!bancoEmisor.trim() || !numeroReferencia.trim()) {
      setError('Completa nombre del banco emisor y número de referencia.')
      return
    }
    if (!comprobante) {
      setError('Carga el comprobante de pago.')
      return
    }
    setLoading(true)
    try {
      // Convert file to base64 for API (backend can accept multipart instead)
      const reader = new FileReader()
      reader.readAsDataURL(comprobante)
      reader.onload = async () => {
        try {
          const base64 = (reader.result as string).split(',')[1]
          const { planProApi } = await import('../api')
          await planProApi.enviarSolicitud({
            bancoEmisor: bancoEmisor.trim(),
            numeroReferencia: numeroReferencia.trim(),
            comprobanteBase64: base64,
          })
          setEnviado(true)
          onSolicitudEnviada?.()
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Error al enviar. Reintenta.')
        } finally {
          setLoading(false)
        }
      }
      reader.onerror = () => {
        setError('Error al leer el comprobante.')
        setLoading(false)
      }
    } catch {
      setLoading(false)
      setError('Error al procesar.')
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content plan-pro-modal" onClick={(e) => e.stopPropagation()}>
        <div className="plan-pro-header">
          <h2>Plan Pro</h2>
          <button type="button" className="plan-pro-close" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </div>

        {enviado ? (
          <div className="plan-pro-success">
            <p><strong>Solicitud enviada</strong></p>
            <p>Tu pago está pendiente de aprobación. Cuando el administrador apruebe tu suscripción tendrás acceso completo al módulo Plan Pro.</p>
            <button type="button" className="btn btn-primary" onClick={onClose}>Entendido</button>
          </div>
        ) : step === 'explicativo' ? (
          <>
            <div className="plan-pro-price">
              <span className="plan-pro-amount">$ 4,99</span>
              <span className="plan-pro-period">/ mes</span>
            </div>
            <p className="plan-pro-intro">
              Con el Plan Pro tendrás acceso a herramientas de compras e inventario para optimizar costos y reposición.
            </p>
            <ul className="plan-pro-beneficios">
              {BENEFICIOS.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
            <div className="plan-pro-actions">
              <button type="button" className="btn btn-primary btn-block" onClick={handleComprarPlan}>
                Comprar plan — $ 4,99 mensual
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handlePagoRealizado}>
            <h3>Pago realizado</h3>
            <p className="muted">Indica los datos del pago para validar tu suscripción. El acceso se activará tras la aprobación del administrador.</p>
            <div className="form-group">
              <label>Nombre del banco emisor</label>
              <input
                value={bancoEmisor}
                onChange={(e) => setBancoEmisor(e.target.value)}
                placeholder="Ej. Banco de Venezuela"
                required
              />
            </div>
            <div className="form-group">
              <label>Número de referencia</label>
              <input
                value={numeroReferencia}
                onChange={(e) => setNumeroReferencia(e.target.value)}
                placeholder="Número de referencia del pago"
                required
              />
            </div>
            <div className="form-group">
              <label>Cargar comprobante</label>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setComprobante(e.target.files?.[0] ?? null)}
                required
              />
            </div>
            {error && <p className="auth-error">{error}</p>}
            <div className="plan-pro-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setStep('explicativo')}>
                Volver
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar solicitud'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
