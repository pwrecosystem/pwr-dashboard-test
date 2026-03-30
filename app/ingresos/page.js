'use client'

import { useEffect, useState } from 'react'
import Loading from '../../components/ui/Loading'
import { formatCurrency } from '../../lib/utils'
import { SUCURSALES } from '../../lib/constants'

export default function IngresosPage() {
  const [ingresos, setIngresos] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filtroSede, setFiltroSede] = useState('')

  useEffect(() => {
    loadIngresos()
  }, [filtroSede])

  async function loadIngresos() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filtroSede) params.set('sede', filtroSede)
      const res = await fetch(`/api/ingresos?${params}`)
      const data = await res.json()
      setIngresos(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 bg-gray-50">
        <Loading text="Cargando ingresos..." />
      </div>
    )
  }

  return (
    <div className="p-8 bg-gray-50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-black">💰 Ingresos</h2>
        <select
          value={filtroSede}
          onChange={(e) => setFiltroSede(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600"
        >
          <option value="">Todas las sedes</option>
          {SUCURSALES.map(s => (
            <option key={s.codigo} value={s.codigo}>{s.nombre}</option>
          ))}
        </select>
      </div>

      {/* Total */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <p className="text-xs text-gray-500 font-semibold uppercase">Total del período</p>
        <p className="text-4xl font-bold text-black mt-2">{formatCurrency(ingresos?.total || 0)}</p>
        <p className="text-xs text-gray-400 mt-2">
          {ingresos?.periodo?.desde} - {ingresos?.periodo?.hasta}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Por Sucursal */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-black mb-4">📊 Por Sucursal</h3>
          <div className="space-y-4">
            {ingresos?.porSucursal?.map((s) => (
              <div key={s.sucursal} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-semibold text-black">{s.nombre}</p>
                </div>
                <p className="text-lg font-bold text-black">{formatCurrency(s.valor)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top Vendedores */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-black mb-4">🏆 Top Vendedores</h3>
          <div className="space-y-4">
            {ingresos?.topVendedores?.slice(0, 5).map((v, i) => (
              <div key={v.vendedor} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    i === 0 ? 'bg-red-600 text-white' : 
                    i === 1 ? 'bg-gray-800 text-white' : 
                    i === 2 ? 'bg-gray-600 text-white' : 
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {i + 1}
                  </span>
                  <p className="font-semibold text-black">{v.vendedor}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-black">{formatCurrency(v.valor)}</p>
                  <p className="text-xs text-gray-400">{v.ventas} ventas</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
