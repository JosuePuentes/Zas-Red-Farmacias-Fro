import type { Producto } from '../types'

/**
 * Normaliza un ítem del backend (puede venir en snake_case o con nombres distintos)
 * a Producto con descripcion e imagen. Usado por Catálogo, Recordatorios y Recetas
 * para que todos busquen y muestren los mismos datos del catálogo.
 */
export function normalizarProducto(raw: Record<string, unknown>): Producto {
  const descripcion =
    (raw.descripcion as string) ??
    (raw.descripcion_catalogo as string) ??
    (raw.descripcionCatalogo as string) ??
    (raw.nombre as string) ??
    (raw.codigo as string) ??
    ''
  const imagen =
    (raw.imagen as string) ??
    (raw.imagen_url as string) ??
    (raw.imagenUrl as string) ??
    (raw.image as string) ??
    ''
  return {
    id: String(raw.id ?? raw.codigo ?? ''),
    codigo: String(raw.codigo ?? ''),
    descripcion,
    principioActivo: String(raw.principioActivo ?? raw.principio_activo ?? ''),
    presentacion: String(raw.presentacion ?? ''),
    marca: String(raw.marca ?? ''),
    precio: typeof raw.precio === 'number' ? raw.precio : 0,
    descuentoPorcentaje:
      typeof raw.descuentoPorcentaje === 'number'
        ? raw.descuentoPorcentaje
        : (raw.descuento_porcentaje as number) ?? undefined,
    precioConPorcentaje:
      typeof raw.precioConPorcentaje === 'number'
        ? raw.precioConPorcentaje
        : (raw.precio_con_porcentaje as number) ?? undefined,
    imagen: imagen || undefined,
    categoria: (raw.categoria as string) ?? undefined,
    farmaciaId: String(raw.farmaciaId ?? raw.farmacia_id ?? ''),
    existencia: typeof raw.existencia === 'number' ? raw.existencia : undefined,
    disponible: raw.disponible as boolean | undefined,
    existenciaGlobal: typeof raw.existenciaGlobal === 'number' ? raw.existenciaGlobal : undefined,
    productosSolicitados: typeof raw.productosSolicitados === 'number' ? raw.productosSolicitados : undefined,
  }
}

/** Obtiene los items normalizados desde la respuesta de catalogoApi.listar (soporta res o res.data). */
export function itemsDesdeRespuestaCatalogo(res: Record<string, unknown>): Producto[] {
  const data = (res as { data?: Record<string, unknown> }).data ?? res
  const rawItems = (data as { items?: unknown[] }).items ?? []
  return rawItems.map((p) => normalizarProducto(p as Record<string, unknown>))
}
