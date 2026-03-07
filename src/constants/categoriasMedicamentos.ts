// Categorías/tipos de medicamentos para lista comparativa y alertas de inventario
export const CATEGORIAS_MEDICAMENTOS = [
  'Antialérgico',
  'Antibiótico',
  'Analgésico',
  'Antigripal',
  'Antiinflamatorio',
  'Antiséptico',
  'Antitusivo',
  'Vitaminas y suplementos',
  'Dermatológico',
  'Gastrointestinal',
  'Cardiovascular',
  'Diabetes',
  'Otro',
] as const

export type CategoriaMedicamento = (typeof CATEGORIAS_MEDICAMENTOS)[number]

export function getCategoriaLabel(cat: string): string {
  return cat || 'Otro'
}
