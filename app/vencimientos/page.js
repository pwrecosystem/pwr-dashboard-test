'use client'

import { useEffect, useState } from 'react'
import Loading from '../../components/ui/Loading'
import Badge from '../../components/ui/Badge'
import Pagination from '../../components/ui/Pagination'
import { formatCurrency, formatDate } from '../../lib/utils'
import { SUCURSALES, getNombreSucursal } from '../../lib/constants'

export default function VencimientosPage() {
  const [vencimientos, setVencimientos] = useState([])
  const [loading, setLoading] = useState(true)
  const [dias, setDias] = useState(7)
  const [sede, setSede] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(25)

  useEffect(() => {
    loadVencimientos()
    setPage(1)
  }, [dias, sede, busqueda])

  async function loadVencimientos() {
    setLoading(true)
    try {
      const params = new URLSearchParams({ dias })
      if (sede) params.set('sede', sede)
      if (busqueda) params.set('busqueda', busqueda)
      const res = await fetch(`/api/vencimientos?${params}`)
      const data = await res.json()
      setVencimientos(data.detalle || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const vencimientosPaginados = vencimientos.slice((page - 1) * perPage, page * perPage)

  function getStatus(diasRestantes) {
    if (diasRestantes < 0) return { label: 'Vencido', variant: 'danger' }
    if (diasRestantes <= 3) return { label: `Vence en ${diasRestantes} días`, variant: 'danger' }
    if (diasRestantes <= 7) return { label: `Vence en ${diasRestantes} días`, variant: 'warning' }
    return { label: `Vence en ${diasRestantes} días`, variant: 'info' }
  }

  function exportCSV() {
    if (!vencimientos.length) return
    const headers = ['ID Cliente', 'Nombre', 'Fecha Vencimiento', 'Días Restantes', 'Valor', 'Celular', 'Correo', 'Sede']
    const rows = vencimientos.map(f => [
      f.identificacion_cliente,
      f.nombre_completo || f.nombre_cliente,
      f.fecha_vencimiento,
      f.dias_restantes,
      f.total,
      f.celular || '',
      f.correo_electronico || f.correo || '',
      f.nombre_sucursal || getNombreSucursal(f.sucursal_codigo)
    ])
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `vencimientos_${dias}dias_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-4 lg:p-8 bg-gray-50">
      <div className="flex flex-col gap-4 mb-4 lg:mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl lg:text-2xl font-bold text-black">⚠️ Vencimientos</h2>
          <button
            onClick={exportCSV}
            className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            📥 Exportar CSV
          </button>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={dias}
            onChange={(e) => setDias(parseInt(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600"
          >
            <option value={7}>Próximos 7 días</option>
            <option value={15}>Próximos 15 días</option>
            <option value={30}>Próximos 30 días</option>
          </select>
          <select
            value={sede}
            onChange={(e) => setSede(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600"
          >
            <option value="">Todas las sedes</option>
            {SUCURSALES.map(s => (
              <option key={s.codigo} value={s.codigo}>{s.nombre}</option>
            ))}
          </select>
          <form onSubmit={(e) => { e.preventDefault(); setBusqueda(searchInput) }} className="flex gap-2">
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600 w-48"
            />
            <button type="submit" className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-2 rounded-lg transition-colors">Buscar</button>
            {busqueda && (
              <button type="button" onClick={() => { setBusqueda(''); setSearchInput('') }} className="text-sm text-gray-500 hover:text-gray-700 px-2">✕</button>
            )}
          </form>
        </div>
      </div>

      {loading ? (
        <Loading text="Cargando vencimientos..." />
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mb-4 lg:mb-6">
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
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase">Cliente</th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Vencimiento</th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase">Días</th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Valor</th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase hidden lg:table-cell">Contacto</th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Sede</th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase">WA</th>
                  </tr>
                </thead>
                <tbody>
                  {vencimientosPaginados.map((f) => {
                    const status = getStatus(f.dias_restantes)
                    return (
                      <tr key={f.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-3">
                          <p className="font-semibold text-black text-sm">{f.nombre_completo || f.nombre_cliente}</p>
                          <p className="text-xs text-gray-400 font-mono">ID: {f.identificacion_cliente}</p>
                        </td>
                        <td className="py-3 px-3 hidden sm:table-cell">
                          <span className="text-sm text-gray-800">{formatDate(f.fecha_vencimiento)}</span>
                        </td>
                        <td className="py-3 px-3">
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </td>
                        <td className="py-3 px-3 font-semibold text-black text-sm hidden sm:table-cell">
                          {formatCurrency(f.total)}
                        </td>
                        <td className="py-3 px-3 text-sm hidden lg:table-cell">
                          <p className="text-gray-800">{f.celular || '-'}</p>
                          <p className="text-gray-500 text-xs">{f.correo_electronico || f.correo || '-'}</p>
                        </td>
                        <td className="py-3 px-3 hidden md:table-cell">
                          <Badge variant="info">{f.nombre_sucursal || getNombreSucursal(f.sucursal_codigo)}</Badge>
                        </td>
                        <td className="py-3 px-3">
                          {f.celular ? (
                            <a href={`https://wa.me/57${f.celular}`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-800 text-lg" title="Enviar WhatsApp">
                              📱
                            </a>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
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
            {vencimientos.length > 0 && (
              <Pagination
                total={vencimientos.length}
                page={page}
                perPage={perPage}
                onPageChange={setPage}
                onPerPageChange={setPerPage}
              />
            )}
          </div>
        </>
      )}
    </div>
  )
}
