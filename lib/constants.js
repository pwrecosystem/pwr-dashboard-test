/**
 * Mapeo de sucursales PWR Club
 * Nombres reales obtenidos de la tabla sucursales en Supabase
 */
export const SUCURSALES = [
  { codigo: '1', nombre: 'POWERCLUB AGUACATALA' },
  { codigo: '2', nombre: 'POWERCLUB CIUDAD DEL RIO' },
  { codigo: '3', nombre: 'POWERCLUB LAURELES' },
  { codigo: '4', nombre: 'POWERCLUB ENVIGADO' },
  { codigo: '5', nombre: 'POWERCLUB VIZCAYA' },
  { codigo: '6', nombre: 'POWERCLUB SANTA BARBARA' },
  { codigo: '7', nombre: 'POWERCLUB ONLINE' },
  { codigo: '8', nombre: 'POWERCLUB LA 93' },
  { codigo: '9', nombre: 'BOX AGUACATALA' },
  { codigo: '10', nombre: 'BOX CIUDAD DEL RIO' },
  { codigo: '11', nombre: 'BOX LAURELES' },
  { codigo: '12', nombre: 'BOX LA 93' },
  { codigo: '13', nombre: 'BOX SANTA BARBARA' },
  { codigo: '14', nombre: 'BOX ENVIGADO' },
  { codigo: '15', nombre: 'POWERCLUB AMSTERDAM' },
  { codigo: '16', nombre: 'BOX AMSTERDAM / WELLNESS' },
]

/**
 * Obtiene el nombre de una sucursal por su código.
 * @param {string|number} codigo
 * @returns {string}
 */
export function getNombreSucursal(codigo) {
  const suc = SUCURSALES.find(s => s.codigo === String(codigo))
  return suc ? suc.nombre : `Sede ${codigo}`
}
