// En producción: VITE_API_URL=https://zas-red-farmacias-back.onrender.com (sin /api al final).
// En desarrollo, si no hay VITE_API_URL, usamos '/api' y el proxy de Vite lo reenvía.
const BASE = import.meta.env.VITE_API_URL || ''
const API = BASE ? `${BASE.replace(/\/$/, '')}/api` : '/api'

/** Base URL del API para peticiones que no usan request() (ej. FormData). */
export function getApiBaseUrl(): string {
  return BASE ? `${BASE.replace(/\/$/, '')}/api` : (typeof window !== 'undefined' ? `${window.location.origin}/api` : '/api')
}

/** Base del backend sin /api (ej. para montar URLs de imágenes estáticas). Variable: VITE_API_URL. */
export function getBackendBaseUrl(): string {
  const b = BASE ? BASE.replace(/\/$/, '') : (typeof window !== 'undefined' ? window.location.origin : '')
  return b
}

/**
 * URL de imagen de catálogo/producto.
 * Si imagen viene (ej. "public/productos/7591127123626.jpg") y no empieza por http:
 *   url = base + "/" + imagen.replace(/^\/+/, '')
 * Si imagen es null o vacío → retorna null (usar placeholder).
 */
export function buildProductImageUrl(imagen: string | null | undefined): string | null {
  if (imagen == null || String(imagen).trim() === '') return null
  const raw = String(imagen).replace(/\\/g, '/').trim()
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw
  const base = getBackendBaseUrl()
  if (!base) return null
  return `${base}/${raw.replace(/^\/+/, '')}`
}

import { getMasterPortalHeaders } from '../lib/masterPortalStorage'

function getToken(): string | null {
  return localStorage.getItem('zas_token')
}

export async function request<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const portalHeaders = getMasterPortalHeaders(endpoint)
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...portalHeaders,
    ...(options.headers as Record<string, string>),
  }
  const res = await fetch(`${API}${endpoint}`, { ...options, headers })
  const data = await res.json().catch(() => ({})) as { error?: string; message?: string }
  if (!res.ok) throw new Error(data.error || data.message || 'Error en la solicitud')
  return data as T
}

// ===================== AUTENTICACIÓN =====================

export const authApi = {
  loginWithStatus: async (email: string, password: string) => {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json().catch(() => ({})) as {
      token?: string
      user?: unknown
      error?: string
      message?: string
      code?: string
    }
    return { ok: res.ok, status: res.status, data }
  },

  // Registro genérico según contrato nuevo: POST /auth/registro
  register: async (body: { email: string; password: string }) => {
    const res = await fetch(`${API}/auth/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({})) as { token?: string; user?: unknown; error?: string; message?: string }
    return { ok: res.ok, status: res.status, data }
  },

  // Registro específico de cliente que ya usaba el frontend
  registerCliente: async (body: {
    cedula: string
    nombre: string
    apellido: string
    direccion: string
    telefono?: string
    email: string
    password: string
    estado?: string
    municipio?: string
    lat?: number
    lng?: number
  }) => {
    const res = await fetch(`${API}/auth/register/cliente`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({})) as { token?: string; user?: unknown; error?: string; message?: string }
    return { ok: res.ok, status: res.status, data }
  },

  // Flujo de recuperación de contraseña
  recuperarPassword: async (email: string) => {
    const res = await fetch(`${API}/auth/recuperar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const data = await res.json().catch(() => ({})) as { token?: string; error?: string; message?: string }
    return { ok: res.ok, status: res.status, data }
  },

  restablecerPassword: async (token: string, nuevaPassword: string) => {
    const res = await fetch(`${API}/auth/restablecer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, nueva_password: nuevaPassword }),
    })
    const data = await res.json().catch(() => ({})) as { ok?: boolean; error?: string; message?: string }
    return { ok: res.ok, status: res.status, data }
  },
}

export const solicitudFarmaciaApi = {
  enviar: (body: {
    rif: string
    nombreFarmacia: string
    direccion: string
    nombreEncargado: string
    telefono: string
    email: string
    password: string
    estadoUbicacion?: string
    lat: number
    lng: number
  }) => request('/solicitud-farmacia', { method: 'POST', body: JSON.stringify(body) }),
}

export const solicitudDeliveryApi = {
  enviar: async (body: {
    tipoVehiculo: 'moto' | 'carro'
    cedula: string
    nombresCompletos: string
    direccion: string
    telefono: string
    correo: string
    password: string
    numeroLicencia: string
    matriculaVehiculo: string
    fotoLicencia: File
    carnetCirculacion: File
    fotoCarnet: File
    fotoVehiculo: File
  }) => {
    const formData = new FormData()
    formData.append('tipoVehiculo', body.tipoVehiculo)
    formData.append('cedula', body.cedula)
    formData.append('nombresCompletos', body.nombresCompletos)
    formData.append('direccion', body.direccion)
    formData.append('telefono', body.telefono)
    formData.append('correo', body.correo)
    formData.append('password', body.password)
    formData.append('numeroLicencia', body.numeroLicencia)
    formData.append('matriculaVehiculo', body.matriculaVehiculo)
    formData.append('fotoLicencia', body.fotoLicencia)
    formData.append('carnetCirculacion', body.carnetCirculacion)
    formData.append('fotoCarnet', body.fotoCarnet)
    formData.append('fotoVehiculo', body.fotoVehiculo)

    const token = getToken()
    const base = getApiBaseUrl()
    const res = await fetch(`${base}/solicitud-delivery`, {
      method: 'POST',
      headers: { ...(token && { Authorization: `Bearer ${token}` }) },
      body: formData,
    })
    const data = await res.json().catch(() => ({})) as { ok?: boolean; error?: string; message?: string }
    if (!res.ok) throw new Error(data.error || data.message || 'Error al enviar solicitud de delivery')
    return data
  },
}

// ===================== TIPOS MASTER =====================

export interface SolicitudFarmacia {
  _id: string
  rif: string
  nombreFarmacia: string
  direccion: string
  nombreEncargado: string
  telefono: string
  email: string
  estado: string
  estadoUbicacion?: string
}

export interface EstadisticasMaster {
  totalPedidos: number
  pedidosProcesados: number
  pedidosEntregados: number
  totalProductosVendidos: number
  totalClientes: number
  totalVentas: number
  totalDelivery: number
}

export interface PedidoMaster {
  _id: string
  clienteId?: { nombre?: string; apellido?: string; email?: string }
  farmaciaId?: { nombreFarmacia?: string }
  deliveryId?: { nombre?: string }
  total: number
  estado: string
  createdAt?: string
}

export interface UsuarioMaster {
  _id: string
  email: string
  role: string
  nombre?: string
  apellido?: string
  cedula?: string
  direccion?: string
  telefono?: string
  farmaciaId?: { nombreFarmacia?: string }
}

export interface FarmaciaMaster {
  _id: string
  nombreFarmacia: string
  rif: string
  direccion: string
  telefono: string
  email?: string
  estado?: string
}

export interface DeliveryMaster {
  _id: string
  email: string
  nombre?: string
  apellido?: string
  cedula?: string
  telefono?: string
}

export interface SolicitudDeliveryMaster {
  _id: string
  tipoVehiculo: string
  cedula: string
  nombresCompletos: string
  direccion: string
  telefono: string
  correo: string
  numeroLicencia: string
  estado: string
}

// ===================== API MASTER =====================
export const masterApi = {
  estadisticas: (params?: { fechaDesde?: string; fechaHasta?: string }) => {
    const search = new URLSearchParams()
    if (params?.fechaDesde) search.set('fechaDesde', params.fechaDesde)
    if (params?.fechaHasta) search.set('fechaHasta', params.fechaHasta)
    const qs = search.toString()
    return request<EstadisticasMaster>(`/master/estadisticas${qs ? `?${qs}` : ''}`)
  },
  pedidos: (params?: { fechaDesde?: string; fechaHasta?: string }) => {
    const search = new URLSearchParams()
    if (params?.fechaDesde) search.set('fechaDesde', params.fechaDesde)
    if (params?.fechaHasta) search.set('fechaHasta', params.fechaHasta)
    const qs = search.toString()
    return request<PedidoMaster[]>(`/master/pedidos${qs ? `?${qs}` : ''}`)
  },
  usuarios: () => request<UsuarioMaster[]>('/master/usuarios'),
  solicitudesFarmacia: () => request<SolicitudFarmacia[]>('/master/solicitudes-farmacia'),
  aprobarFarmacia: (id: string) => request(`/master/solicitudes-farmacia/${id}/aprobar`, { method: 'POST' }),
  denegarFarmacia: (id: string) => request(`/master/solicitudes-farmacia/${id}/denegar`, { method: 'POST' }),
  farmacias: () => request<FarmaciaMaster[]>('/master/farmacias'),
  delivery: () => request<DeliveryMaster[]>('/master/delivery'),
  solicitudesDelivery: () => request<SolicitudDeliveryMaster[]>('/master/solicitudes-delivery'),
  solicitudesPlanPro: () => request<SolicitudPlanProMaster[]>('/master/solicitudes-plan-pro'),
  aprobarPlanPro: (id: string) => request(`/master/solicitudes-plan-pro/${id}/aprobar`, { method: 'POST' }),
  denegarPlanPro: (id: string) => request(`/master/solicitudes-plan-pro/${id}/denegar`, { method: 'POST' }),
}

// ===================== PLAN PRO (FARMACIA) =====================
export interface SolicitudPlanProMaster {
  _id: string
  farmaciaId: string
  nombreFarmacia?: string
  email?: string
  bancoEmisor: string
  numeroReferencia: string
  comprobanteUrl?: string
  estado: 'pendiente' | 'aprobado' | 'denegado'
  createdAt?: string
}

export const planProApi = {
  getSubscription: () => request<{ activo: boolean; farmaciaId?: string }>('/farmacia/plan-pro/estado'),
  enviarSolicitud: (body: { bancoEmisor: string; numeroReferencia: string; comprobanteBase64?: string }) =>
    request<{ ok: boolean; solicitudId?: string }>('/farmacia/plan-pro/solicitud', { method: 'POST', body: JSON.stringify(body) }),
}

// ===================== API FARMACIA / CLIENTE (PRODUCTOS) =====================

// Nota: estos tipos deben estar alineados con el backend
export interface ProductoApi {
  id: string
  codigo: string
  descripcion: string
  principioActivo: string
  presentacion: string
  marca: string
  precio: number
  descuentoPorcentaje?: number
  precioConPorcentaje?: number
  imagen?: string
  categoria?: string
  farmaciaId: string
  existencia?: number
  /** Si es false o existencia === 0 → mostrar "Sin stock" y no permitir agregar al carrito */
  disponible?: boolean
  /** Plan Full: suma de existencia por código en todas las farmacias */
  existenciaGlobal?: number
  /** Plan Full: cantidad de solicitudes de clientes para ese código */
  productosSolicitados?: number
}

export interface ActualizarDescuentoItem {
  id: string
  descuentoPorcentaje: number
}

// ===================== CATÁLOGO CLIENTE (INSTRUCCIONES_FRONTEND_IA.md) =====================

export interface CatalogoQuery {
  q?: string
  farmacia_id?: string
  page?: number
  page_size?: number
  /** Tras confirmar ubicación: filtrar productos por comercios más cercanos */
  lat?: number
  lng?: number
}

export interface CatalogoResponse {
  items: ProductoApi[]
  page: number
  page_size: number
  total: number
  total_pages: number
}

/** GET /api/cliente/catalogo — Lista catálogo con q, farmacia_id, page, page_size, lat, lng (cercanía). */
export const catalogoApi = {
  listar: (params?: CatalogoQuery) => {
    const search = new URLSearchParams()
    if (params?.q) search.set('q', params.q)
    if (params?.farmacia_id) search.set('farmacia_id', params.farmacia_id)
    if (params?.page != null) search.set('page', String(params.page))
    if (params?.page_size != null) search.set('page_size', String(params.page_size))
    if (params?.lat != null) search.set('lat', String(params.lat))
    if (params?.lng != null) search.set('lng', String(params.lng))
    const qs = search.toString()
    return request<CatalogoResponse>(`/cliente/catalogo${qs ? `?${qs}` : ''}`)
  },
}

/** GET /api/cliente/delivery/estimado?lat=&lng= — Estimación costo delivery (backend puede usar items del carrito por sesión). */
export interface PedidoDeliveryApi {
  _id: string
  clienteNombre: string
  clienteCedula: string
  direccionEntrega: string
  direccionFarmacia?: string
  items: { descripcion: string; precioUnidad: number; cantidad: number; total: number }[]
  total: number
  estado: string
  createdAt?: string
  /** Coordenadas farmacia y entrega para el mapa del delivery. */
  coordsFarmacia?: { lat: number; lng: number }
  coordsEntrega?: { lat: number; lng: number }
}

export const deliveryApi = {
  /** GET /api/cliente/delivery/estimado?lat=&lng= — costo estimado del delivery. */
  estimado: (lat: number, lng: number) =>
    request<{ costo: number; message?: string }>(`/cliente/delivery/estimado?lat=${lat}&lng=${lng}`),

  /** GET /api/delivery/pedidos — pedidos asignados o pendientes para el repartidor autenticado. */
  pedidos: () => request<PedidoDeliveryApi[]>('/delivery/pedidos'),

  /** POST /api/delivery/estado — marcar delivery activo/inactivo (y opcionalmente su última ubicación). */
  setEstado: (body: { activo: boolean; lat?: number; lng?: number }) =>
    request<{ ok?: boolean; message?: string }>('/delivery/estado', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  /** POST /api/delivery/pedidos/:id/aceptar — el primero que acepta se queda con el pedido. */
  aceptarPedido: (id: string) =>
    request<{ ok?: boolean; message?: string }>(`/delivery/pedidos/${id}/aceptar`, {
      method: 'POST',
    }),
}

/** GET /api/cliente/productos — Endpoint alternativo/detalle de productos (mismo formato que catálogo). */
export const productosApi = {
  listar: (params?: CatalogoQuery) => {
    const search = new URLSearchParams()
    if (params?.q) search.set('q', params.q)
    if (params?.farmacia_id) search.set('farmacia_id', params.farmacia_id)
    if (params?.page != null) search.set('page', String(params.page))
    if (params?.page_size != null) search.set('page_size', String(params.page_size))
    const qs = search.toString()
    return request<ProductoApi[]>(`/cliente/productos${qs ? `?${qs}` : ''}`)
  },
}

// ===================== CARRITO CLIENTE =====================

export interface CarritoAgregarBody {
  cliente_id: string
  producto_id: string
  cantidad: number
}

export interface CarritoAgregarResponse {
  status?: string
  message?: string
  // campos adicionales según backend (total, carrito, etc.)
  [key: string]: unknown
}

export const carritoApi = {
  agregar: (body: CarritoAgregarBody) =>
    request<CarritoAgregarResponse>('/carrito/agregar', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  cambiarFarmacia: (body: { cliente_id: string; farmacia_id: string }) =>
    request<{ ok?: boolean; status?: string; message?: string }>('/carrito/cambiar-farmacia', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  confirmar: (clienteId: string) =>
    request<{ ok: boolean; pedido_id?: string; message?: string }>(
      `/carrito/confirmar?cliente_id=${encodeURIComponent(clienteId)}`,
      { method: 'POST' },
    ),
}

// ===================== INVENTARIO FARMACIA (Excel + conflictos descripción) =====================

export interface ConflictoDescripcion {
  codigo: string
  descripcionSistema: string
  descripcionArchivo: string
}

export interface CargarExcelResponse {
  creados?: number
  actualizados?: number
  vinculadosCatalogo?: number
  conflictosDescripcion?: ConflictoDescripcion[]
  message?: string
}

export interface DecisionDescripcion {
  codigo: string
  usar: 'catalogo' | 'farmacia'
}

/** Estadísticas del dashboard para farmacias (todos pueden ver). */
export interface DashboardFarmaciaStats {
  totalUsuariosApp?: number
  totalClientesFarmacia?: number
  ventasMesActual?: number
  ventasMesAnterior?: number
  totalPedidosMes?: number
  inventarioVariacionPct?: number
  usuariosCrecimientoPct?: number
  clientesCrecimientoPct?: number
  [key: string]: unknown
}

export interface PedidoFarmaciaApi {
  _id: string
  clienteNombre: string
  clienteCedula?: string
  clienteTelefono?: string
  direccionEntrega: string
  items: { descripcion: string; cantidad: number; precioUnidad: number; total: number }[]
  total: number
  estado: string
  createdAt?: string
}

export const farmaciaApi = {
  /** GET /api/farmacia/dashboard — Total usuarios app, ventas, inventario, etc. (solo números, sin datos personales). */
  dashboard: async () => {
    try {
      return await request<DashboardFarmaciaStats>('/farmacia/dashboard')
    } catch {
      return {} as DashboardFarmaciaStats
    }
  },
  inventario: () => request<ProductoApi[]>('/farmacia/inventario'),
  actualizarDescuentos: (items: ActualizarDescuentoItem[]) =>
    request<{ ok: boolean; updated?: number; message?: string }>('/farmacia/inventario/descuentos', {
      method: 'PATCH',
      body: JSON.stringify(items),
    }),
  /** POST /api/farmacia/inventario/resolver-descripciones — Body: { decisiones: [ { codigo, usar: 'catalogo' | 'farmacia' } ] } */
  resolverDescripciones: (decisiones: DecisionDescripcion[]) =>
    request<{ ok?: boolean; message?: string }>('/farmacia/inventario/resolver-descripciones', {
      method: 'POST',
      body: JSON.stringify({ decisiones }),
    }),

  /** GET /api/farmacia/pedidos — pedidos dirigidos a esta farmacia. */
  pedidos: () => request<PedidoFarmaciaApi[]>('/farmacia/pedidos'),

  /** POST /api/farmacia/pedidos/:id/validar — farmacia valida el pedido (descuenta inventario y lo pasa a delivery). */
  validarPedido: (id: string) =>
    request<{ ok?: boolean; message?: string }>(`/farmacia/pedidos/${id}/validar`, { method: 'POST' }),

  /** POST /api/farmacia/pedidos/:id/denegar — farmacia rechaza el pedido. */
  denegarPedido: (id: string) =>
    request<{ ok?: boolean; message?: string }>(`/farmacia/pedidos/${id}/denegar`, { method: 'POST' }),
}

// ===================== PROVEEDORES (Plan Full) =====================

export interface ProveedorApi {
  id: string
  farmaciaId: string
  rif: string
  nombreProveedor: string
  telefono?: string
  nombreAsesorVentas?: string
  direccion?: string
  condicionesComercialesPct?: number
  prontoPagoPct?: number
  [key: string]: unknown
}

export interface ProveedorBody {
  rif: string
  nombreProveedor: string
  telefono?: string
  nombreAsesorVentas?: string
  direccion?: string
  condicionesComercialesPct?: number
  prontoPagoPct?: number
}

export interface ListaComparativaItem {
  codigo: string
  descripcion?: string
  marca?: string
  ofertas: { proveedorId: string; proveedorNombre?: string; precio: number; existencia: number }[]
  /** Existencia global (suma en todas las farmacias). */
  existenciaGlobal?: number
  /** Cantidad de solicitudes de clientes para este código. */
  productosSolicitados?: number
}

export const proveedoresApi = {
  listar: () => request<ProveedorApi[]>('/farmacia/proveedores'),
  crear: (body: ProveedorBody) =>
    request<ProveedorApi>('/farmacia/proveedores', { method: 'POST', body: JSON.stringify(body) }),
  actualizar: (id: string, body: Partial<ProveedorBody>) =>
    request<ProveedorApi>(`/farmacia/proveedores/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  eliminar: (id: string) =>
    request<{ ok?: boolean }>(`/farmacia/proveedores/${id}`, { method: 'DELETE' }),
  /** POST FormData: archivo (Excel), proveedorId. Columnas: codigo, descripcion, marca, precio, existencia */
  listaPrecio: async (proveedorId: string, file: File) => {
    const formData = new FormData()
    formData.append('archivo', file)
    formData.append('proveedorId', proveedorId)
    const token = getToken()
    const base = getApiBaseUrl()
    const res = await fetch(`${base}/farmacia/proveedores/lista-precio`, {
      method: 'POST',
      headers: { ...(token && { Authorization: `Bearer ${token}` }) },
      body: formData,
    })
    const data = await res.json().catch(() => ({})) as { creados?: number; actualizados?: number; error?: string; message?: string }
    if (!res.ok) throw new Error(data.error || data.message || 'Error al subir lista de precios')
    return data
  },
  listaComparativa: () =>
    request<ListaComparativaItem[]>('/farmacia/proveedores/lista-comparativa'),
}

export const clienteApi = {
  /** GET /api/cliente/catalogo — q, farmacia_id, page, page_size, lat, lng. Devuelve sólo items (Productos). */
  catalogo: async (params?: CatalogoQuery) => {
    const res = await catalogoApi.listar(params)
    return res.items
  },
  /** GET /api/cliente/productos — opcional; mismo formato que catálogo. */
  productos: (params?: CatalogoQuery) => productosApi.listar(params),
  /** GET /api/cliente/delivery/estimado?lat=&lng= — costo estimado del delivery. */
  estimacionDelivery: (lat: number, lng: number) => deliveryApi.estimado(lat, lng),
  /** PATCH /api/cliente/ubicacion — guarda ultimaLat/ultimaLng del cliente. */
  guardarUbicacion: (lat: number, lng: number) =>
    request<{ ok?: boolean; message?: string }>('/cliente/ubicacion', {
      method: 'PATCH',
      body: JSON.stringify({ lat, lng }),
    }),
  /** GET /api/cliente/checkout/resumen — subtotal, costoDelivery, total, numFarmacias, direccion. */
  checkoutResumen: () =>
    request<{ subtotal: number; costoDelivery: number; total: number; numFarmacias: number; direccion: string }>(
      '/cliente/checkout/resumen',
    ),

  /** GET /api/cliente/notificaciones — lista de notificaciones (incl. tipo producto_solicitado_disponible). Si el backend no expone el endpoint, devuelve []. */
  notificaciones: async () => {
    try {
      return await request<NotificacionClienteItem[]>('/cliente/notificaciones')
    } catch {
      return []
    }
  },

  /** GET /api/cliente/pedidos — pedidos del cliente (en curso e históricos). */
  misPedidos: () => request<PedidoClienteApi[]>('/cliente/pedidos'),

  /** POST /api/cliente/solicitar-producto — Body: { codigo }. 201: ok; 400: ya disponible o cooldown 7 días (proximaDisponible). */
  solicitarProducto: async (codigo: string): Promise<{ ok: boolean; message?: string; proximaDisponible?: string }> => {
    const res = await fetch(`${API}/cliente/solicitar-producto`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(getToken() && { Authorization: `Bearer ${getToken()}` }),
      },
      body: JSON.stringify({ codigo }),
    })
    const data = await res.json().catch(() => ({})) as { error?: string; message?: string; proximaDisponible?: string }
    if (res.ok) return { ok: true, message: 'Solicitud registrada. Te avisaremos cuando esté disponible.' }
    return { ok: false, message: data.error || data.message || 'No se pudo enviar la solicitud', proximaDisponible: data.proximaDisponible }
  },

  // ===================== RECORDATORIOS =====================
  /** GET /api/cliente/recordatorios — lista de recordatorios del cliente. */
  recordatorios: () => request<RecordatorioItem[]>('/cliente/recordatorios'),
  /** POST /api/cliente/recordatorios — crear recordatorio (codigo, descripcion, imagen?, precioReferencia?). */
  crearRecordatorio: (body: { codigo: string; descripcion: string; imagen?: string; precioReferencia?: number }) =>
    request<{ id?: string; ok?: boolean }>('/cliente/recordatorios', { method: 'POST', body: JSON.stringify(body) }),

  // ===================== RECETAS =====================
  /** GET /api/cliente/recetas/buscar?q= — búsqueda por texto (o texto de OCR). Backend no hace OCR; solo recibe q. */
  recetasBuscar: (q: string) => request<RecetaBuscarItem[]>(`/cliente/recetas/buscar?q=${encodeURIComponent(q)}`),
  /** POST /api/cliente/recetas/agregar-al-carrito — agregar producto elegido al carrito. */
  recetasAgregarAlCarrito: (body: { productoId: string; cantidad: number } | { codigo: string; cantidad: number }) =>
    request<{ ok?: boolean; message?: string }>('/cliente/recetas/agregar-al-carrito', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
}

// Tipos usados por recordatorios/recetas (ajustar según respuesta real del backend)
export interface RecordatorioItem {
  id: string
  codigo?: string
  descripcion?: string
  imagen?: string
  precioReferencia?: number
  proximaFecha?: string
  [key: string]: unknown
}

export interface RecetaBuscarItem {
  id: string
  codigo?: string
  descripcion?: string
  precio?: number
  farmaciaId?: string
  existencia?: number
  [key: string]: unknown
}

/** Notificación del cliente (ej. producto_solicitado_disponible cuando un producto que solicitó tiene stock). */
export interface NotificacionClienteItem {
  id: string
  tipo: 'producto_solicitado_disponible' | string
  texto?: string
  codigo?: string
  descripcion?: string
  fecha?: string
  [key: string]: unknown
}

export interface PedidoClienteApi {
  _id: string
  estado: string
  total: number
  direccionEntrega?: string
  latEntrega?: number
  lngEntrega?: number
  deliveryLat?: number
  deliveryLng?: number
  etaMinutos?: number
  etaHoraLlegada?: string
  createdAt?: string
}
