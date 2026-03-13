import { clienteApi, type AnalisisReceta } from '../api'

/**
 * Ahora el análisis de la imagen del récipe se hace 100% en el backend.
 * El frontend sólo envía el archivo al endpoint /api/cliente/recetas/analizar-imagen.
 */
export async function analizarRecetaDesdeImagen(file: File): Promise<AnalisisReceta> {
  return clienteApi.recetasAnalizarImagen(file)
}

