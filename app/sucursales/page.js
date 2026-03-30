'use client'

import { useEffect, useState } from 'react'
import Sidebar from '../../components/layout/Sidebar'
import Loading from '../../components/ui/Loading'
import { formatCurrency } from '../../lib/utils'

export default function SucursalesPage() {
  const [sucursales, setSucursales] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSucursales()
  }, [])

  async function loadSucursales() {
    setLoading(true)
    try {
      const res = await fetch('/api/sucursales')
      const data = await res.json()
      setSucursales(data.sucursales || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <Sidebar />
        <main className="flex-1 p-8 bg-gray-50">
          <Loading text="Cargando sucursales..." />
        </main>
      </>
    )
  }

  const totalClientes = sucursales.reduce((a, b) => a + (b.clientes || 0), 0)
  const totalIngresos = sucursales.reduce((a, b) => a + (b.ingresos || 0), 0)

  return (
    <>
      <Sidebar />
      <main className="flex-1 p-8 bg-gray-50">
        <h2 className="text-2xl font-bold text-black mb-6">🏢 Sucursales</h2>

        {/* Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <p className="text-xs text-gray-500 font-semibold uppercase">Total Clientes</p>
            <p className="text-4xl font-bold text-black mt-2">{totalClientes}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <p className="text-xs text-gray-500 font-semibold uppercase">Ingresos Mes</p>
            <p className="text-4xl font-bold text-black mt-2">{formatCurrency(totalIngresos)}</p>
          </div>
        </div>

        {/* Cards por Sucursal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sucursales.map((suc) => {
            const porcentaje = totalClientes > 0 ? ((suc.clientes / totalClientes) * 100).toFixed(1) : 0
            return (
              <div key={suc.codigo} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-black">{suc.nombre}</h3>
                  <span className="text-xs bg-black text-white px-2 py-1 rounded font-semibold">
                    Sede {suc.codigo}
                  </span>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase">Clientes</p>
                    <p className="text-3xl font-bold text-black mt-1">{suc.clientes}</p>
                    <div className="mt-3 bg-gray-100 rounded-full h-2">
                      <div 
                        className="bg-red-600 h-2 rounded-full transition-all" 
                        style={{ width: `${porcentaje}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-2">{porcentaje}% del total</p>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 font-semibold uppercase">Clientes Activos</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{suc.clientesActivos}</p>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 font-semibold uppercase">Ingresos Mes</p>
                    <p className="text-xl font-bold text-black mt-1">{formatCurrency(suc.ingresos)}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {sucursales.length === 0 && (
          <p className="text-center py-8 text-gray-500">No hay datos de sucursales</p>
        )}
      </main>
    </>
  )
}
