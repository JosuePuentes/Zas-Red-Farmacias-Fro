// Tipos para sincronizar con el backend cuando esté listo

export type UserRole = 'admin' | 'cliente' | 'farmacia' | 'delivery'

export interface User {
  id: string
  email: string
  role: UserRole
  nombre?: string
  apellido?: string
  cedula?: string
  direccion?: string
  telefono?: string
}

export interface Farmacia {
  id: string
  nombre: string
  rif: string
  direccion: string
  telefono: string
  gerenteEncargado: string
  porcentajePrecio: number
  estado?: string
  usuarioId: string
}

export interface Producto {
  id: string
  codigo: string
  descripcion: string
  principioActivo: string
  presentacion: string
  marca: string
  precio: number
  precioConPorcentaje?: number
  imagen?: string
  farmaciaId: string
  existencia?: number
}

export interface CarritoItem {
  producto: Producto
  cantidad: number
  farmaciaId: string
}

export type MetodoPago = 'pago_movil' | 'transferencia' | 'zelle' | 'binance'

export interface Pedido {
  id: string
  clienteId: string
  farmaciaId: string
  items: { productoId: string; cantidad: number; precio: number }[]
  total: number
  costoDelivery: number
  totalFinal: number
  metodoPago: MetodoPago
  comprobanteUrl?: string
  estado: 'pendiente' | 'validado' | 'denegado' | 'en_camino' | 'entregado'
  direccionEntrega: string
  deliveryId?: string
  createdAt: string
}

export interface SolicitudDelivery {
  id: string
  tipoVehiculo: 'moto' | 'carro'
  cedula: string
  nombresCompletos: string
  direccion: string
  telefono: string
  correo: string
  numeroLicencia: string
  fotoLicenciaUrl: string
  carnetCirculacionUrl: string
  fotoCarnetUrl: string
  estado: 'pendiente' | 'aprobado' | 'denegado'
  createdAt: string
}
