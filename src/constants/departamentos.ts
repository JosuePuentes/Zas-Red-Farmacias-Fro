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

