/**
 * Formatea un número como moneda COP
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(amount)
}

/**
 * Formatea una fecha como DD/MM/YYYY
 */
export function formatDate(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date)
}

/**
 * Calcula días restantes hasta una fecha
 */
export function daysUntil(dateString) {
  const today = new Date()
  const target = new Date(dateString)
  const diff = target - today
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

/**
 * Obtiene el estado visual según días restantes
 */
export function getVencimientoStatus(diasRestantes) {
  if (diasRestantes < 0) return { label: 'Vencido', variant: 'danger' }
  if (diasRestantes <= 3) return { label: `Vence en ${diasRestantes} días`, variant: 'danger' }
  if (diasRestantes <= 7) return { label: `Vence en ${diasRestantes} días`, variant: 'warning' }
  if (diasRestantes <= 15) return { label: `Vence en ${diasRestantes} días`, variant: 'info' }
  return { label: 'Al día', variant: 'success' }
}

/**
 * Formatea número de teléfono
 */
export function formatPhone(phone) {
  if (!phone) return '-'
  return phone.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3')
}
