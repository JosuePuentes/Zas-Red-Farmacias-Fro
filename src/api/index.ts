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
  farmaciaId?: { nombreFarmacia?: string }
}

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
}
