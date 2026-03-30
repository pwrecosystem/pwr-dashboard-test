'use client'

import { useEffect, useState } from 'react'
import Sidebar from '../../components/layout/Sidebar'
import Loading from '../../components/ui/Loading'
import Badge from '../../components/ui/Badge'
import { formatCurrency, formatDate } from '../../lib/utils'

export default function VencimientosPage() {
  const [vencimientos, setVencimientos] = useState([])
  const [loading, setLoading] = useState(true)
  const [dias, setDias] = useState(7)

  useEffect(() => {
    loadVencimientos()
  }, [dias])

  async function loadVencimientos() {
    setLoading(true)
    try {
      const res = await fetch(`/api/vencimientos?dias=${dias}`)
      const data = await res.json()
      setVencimientos(data.detalle || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  function getStatus(diasRestantes) {
    if (diasRestantes < 0) return { label: 'Vencido', variant: 'danger' }
    if (diasRestantes <= 3) return { label: `Vence en ${diasRestantes} días`, variant: 'danger' }
    if (diasRestantes <= 7) return { label: `Vence en ${diasRestantes} días`, variant: 'warning' }
    return { label: `Vence en ${diasRestantes} días`, variant: 'info' }
  }

  return (
    <>
      <Sidebar />
      <main className="flex-1 p-8 bg-gray-50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-black">⚠️ Vencimientos</h2>
          <select
            value={dias}
            onChange={(e) => setDias(parseInt(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600"
          >
            <option value={7}>Próximos 7 días</option>
            <option value={15}>Próximos 15 días</option>
            <option value={30}>Próximos 30 días</option>
          </select>
        </div>

        {loading ? (
          <Loading text="Cargando vencimientos..." />
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <p className="text-xs text-gray-500 font-semibold uppercase">Total por vencer</p>
                <p className="text-3xl font-bold text-black mt-2">{vencimientos.length}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <p className="text-xs text-gray-500 font-semibold uppercase">Valor total</p>
                <p className="text-3xl font-bold text-black mt-2">
                  {formatCurrency(vencimientos.reduce((a, b) => a + (b.total || 0), 0))}
                </p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <p className="text-xs text-gray-500 font-semibold uppercase">Período</p>
                <p className="text-2xl font-bold text-black mt-2">{dias} días</p>
              </div>
            </div>

            {/* Tabla */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Cliente</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Vencimiento</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Días</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Valor</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Contacto</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Sede</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vencimientos.map((f) => {
                      const status = getStatus(f.diasRestantes)
                      return (
                        <tr key={f.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <p className="font-semibold text-black">{f.nombre_completo || f.nombre_cliente}</p>
                            <p className="text-xs text-gray-400 font-mono">ID: {f.identificacion_cliente}</p>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-800">{formatDate(f.fecha_vencimiento)}</span>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={status.variant}>{status.label}</Badge>
                          </td>
                          <td className="py-3 px-4 font-semibold text-black">
                            {formatCurrency(f.total)}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <p className="text-gray-800">{f.celular || '-'}</p>
                            <p className="text-gray-500 text-xs">{f.correo || '-'}</p>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant="info">Sede {f.sucursal_codigo}</Badge>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                {vencimientos.length === 0 && (
                  <p className="text-center py-8 text-gray-500">
                    No hay vencimientos en los próximos {dias} días
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </>
  )
}
