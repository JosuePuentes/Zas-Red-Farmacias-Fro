export const DEPARTAMENTOS_ZAS = [
  'Analgésicos y Antipiréticos',
  'Antibióticos',
  'Antiinflamatorios',
  'Antigripales y Tos',
  'Cuidados Especializados',
  'Cardiovascular',
  'Gastrointestinal',
  'Salud Visual',
  'Diabetes',
  'Salud y Bienestar',
  'Vitaminas y Suplementos',
  'Cuidado Personal',
  'Primeros Auxilios',
  'Mamá y Bebé',
  'Maternidad',
  'Infantil',
] as const

export type DepartamentoZas = (typeof DEPARTAMENTOS_ZAS)[number]

/** Orden para el catálogo: primero medicamentos (por principio activo/descripción A–Z), luego el resto. */
export const ORDER_DEPARTAMENTOS_CATALOGO: DepartamentoZas[] = [
  'Analgésicos y Antipiréticos',
  'Antibióticos',
  'Antiinflamatorios',
  'Antigripales y Tos',
  'Cardiovascular',
  'Diabetes',
  'Gastrointestinal',
  'Salud Visual',
  'Cuidados Especializados',
  'Salud y Bienestar',
  'Primeros Auxilios',
  'Vitaminas y Suplementos',
  'Mamá y Bebé',
  'Maternidad',
  'Infantil',
  'Cuidado Personal',
]

