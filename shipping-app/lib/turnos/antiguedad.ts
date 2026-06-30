const ANTIQUEDAD_LABELS: Record<string, string> = {
  BRAND_NEW: 'A estrenar',
  UNDER_CONSTRUCTION: 'En construcción',
  LESS_THAN_10: 'Menos de 10 años',
  BETWEEN_10_AND_20: 'Entre 10 y 20 años',
  MORE_THAN_20: 'Más de 20 años',
}

const CONDICION_LABELS: Record<string, string> = {
  VERY_GOOD: 'Muy buena',
  EXCELLENT: 'Excelente',
  GOOD: 'Buena',
  TO_RENOVATE: 'A refaccionar',
}

export function formatAntiguedad(value: string | null | undefined) {
  if (!value) return '-'

  return ANTIQUEDAD_LABELS[value] ?? value
}

export function formatCondicion(value: string | null | undefined) {
  if (!value) return '-'

  return CONDICION_LABELS[value] ?? value
}