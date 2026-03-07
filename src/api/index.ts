// En producción (Vercel) no hay proxy: VITE_API_URL debe apuntar al backend real.
// En desarrollo, si no hay VITE_API_URL, usamos '/api' y el proxy de Vite lo reenvía.
const BASE = import.meta.env.VITE_API_URL || ''
const API = BASE ? `${BASE.replace(/\/$/, '')}/api` : '/api'

function getToken(): string | null {
  return localStorage.getItem('zas_token')
}

export async function request<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
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
    const data = await res.json().catch(() => ({})) as { token?: string; user?: unknown; error?: string; message?: string; code?: string }
    return { ok: res.ok, status: res.status, data }
  },
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
  }) => request('/solicitud-farmacia', { method: 'POST', body: JSON.stringify(body) }),
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
}

export interface ActualizarDescuentoItem {
  id: string
  descuentoPorcentaje: number
}

export const farmaciaApi = {
  inventario: () => request<ProductoApi[]>('/farmacia/inventario'),
  actualizarDescuentos: (items: ActualizarDescuentoItem[]) =>
    request<{ ok: boolean; updated?: number; message?: string }>('/farmacia/inventario/descuentos', {
      method: 'PATCH',
      body: JSON.stringify(items),
    }),
}

export const clienteApi = {
  catalogo: () => request<ProductoApi[]>('/cliente/catalogo'),
}
