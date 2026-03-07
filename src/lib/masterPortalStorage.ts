/** Claves de sessionStorage para portal elegido por master */
export const STORAGE_PORTAL = 'zas_portal_elegido'
export const STORAGE_FARMACIA_ID = 'zas_master_farmacia_id'
export const STORAGE_CLIENTE_ID = 'zas_master_cliente_id'
export const STORAGE_DELIVERY_ID = 'zas_master_delivery_id'

/** Cabeceras a enviar en peticiones cuando master entra como otro rol (usa sessionStorage) */
export function getMasterPortalHeaders(endpoint: string): Record<string, string> {
  const farmaciaId = sessionStorage.getItem(STORAGE_FARMACIA_ID)
  const clienteId = sessionStorage.getItem(STORAGE_CLIENTE_ID)
  const deliveryId = sessionStorage.getItem(STORAGE_DELIVERY_ID)
  const headers: Record<string, string> = {}
  if (endpoint.startsWith('/farmacia/') && farmaciaId) headers['X-Farmacia-Id'] = farmaciaId
  if (endpoint.startsWith('/cliente/') && clienteId) headers['X-Cliente-Id'] = clienteId
  if (endpoint.startsWith('/delivery/') && deliveryId) headers['X-Delivery-Id'] = deliveryId
  return headers
}
