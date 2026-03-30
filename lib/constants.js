/**
 * Mapeo de sucursales PWR Club
 * Nombres reales obtenidos de la tabla sucursales en Supabase
 */
export const SUCURSALES = [
  { codigo: '1', nombre: 'POWERCLUB AGUACATALA' },
  { codigo: '2', nombre: 'POWERCLUB CIUDAD DEL RIO' },
  { codigo: '3', nombre: 'POWERCLUB LAURELES' },
  { codigo: '4', nombre: 'POWERCLUB ENVIGADO' },
  { codigo: '5', nombre: 'POWERCLUB WAKE' },
  { codigo: '6', nombre: 'SUCURSAL 6' },
  { codigo: '7', nombre: 'POWERCLUB ENVIGADO 2' },
  { codigo: '8', nombre: 'SUCURSAL 8' },
  { codigo: '9', nombre: 'SUCURSAL 9' },
  { codigo: '10', nombre: 'BOX CIUDAD DEL RIO' },
  { codigo: '11', nombre: 'SUCURSAL 11' },
  { codigo: '12', nombre: 'BOX LA 93' },
  { codigo: '13', nombre: 'SUCURSAL 13' },
  { codigo: '14', nombre: 'SUCURSAL 14' },
  { codigo: '15', nombre: 'SUCURSAL 15' },
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
