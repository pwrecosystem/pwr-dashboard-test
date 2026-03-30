'use client'

import { useEffect, useState, useCallback } from 'react'
import Loading from '../../components/ui/Loading'
import Badge from '../../components/ui/Badge'
import Pagination from '../../components/ui/Pagination'
import { SUCURSALES, getNombreSucursal } from '../../lib/constants'

export default function ClientesPage() {
  const [clientes, setClientes] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filtroSede, setFiltroSede] = useState('')
  const [filtroPlan, setFiltroPlan] = useState('')
  const [filtroGenero, setFiltroGenero] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(25)

  const loadClientes = useCallback(async (currentPage, currentPerPage) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filtroSede) params.set('sede', filtroSede)
      if (filtroPlan) params.set('plan', filtroPlan)
      if (filtroGenero) params.set('genero', filtroGenero)
      if (busqueda) params.set('busqueda', busqueda)
      params.set('limit', String(currentPerPage))
      params.set('offset', String((currentPage - 1) * currentPerPage))

      const res = await fetch(`/api/clientes?${params}`)
      const data = await res.json()
      setClientes(data.clientes || [])
      setTotal(data.total || 0)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }, [filtroSede, filtroPlan, filtroGenero, busqueda])

  // Reload when filters change — reset to page 1
  useEffect(() => {
    setPage(1)
    loadClientes(1, perPage)
  }, [filtroSede, filtroPlan, filtroGenero]) // eslint-disable-line react-hooks/exhaustive-deps

  // Reload when page or perPage changes
  useEffect(() => {
    loadClientes(page, perPage)
  }, [page, perPage]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleBuscar() {
    setPage(1)
    loadClientes(1, perPage)
  }

  function handlePageChange(newPage) {
    setPage(newPage)
  }

  function handlePerPageChange(newPerPage) {
    setPerPage(newPerPage)
    setPage(1)
  }

  function getEstadoBadge(estadoCliente) {
    if (estadoCliente === 'Con plan vigente') return { label: 'Con plan', variant: 'success' }
    if (estadoCliente === 'Sin plan vigente') return { label: 'Sin plan', variant: 'warning' }
    return { label: estadoCliente || 'N/A', variant: 'default' }
  }

  return (
    <div className="p-4 lg:p-8 bg-gray-50">
      <h2 className="text-xl lg:text-2xl font-bold text-black mb-4 lg:mb-6">👥 Clientes</h2>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Sede</label>
            <select
              value={filtroSede}
              onChange={(e) => setFiltroSede(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600"
            >
              <option value="">Todas</option>
              {SUCURSALES.map(s => (
                <option key={s.codigo} value={s.codigo}>{s.nombre}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Plan</label>
            <select
              value={filtroPlan}
              onChange={(e) => setFiltroPlan(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600"
            >
              <option value="">Todos</option>
              <option value="con_plan">Con plan vigente</option>
              <option value="sin_plan">Sin plan</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Género</label>
            <select
              value={filtroGenero}
              onChange={(e) => setFiltroGenero(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600"
            >
              <option value="">Todos</option>
              <option value="FEMENINO">Femenino</option>
              <option value="MASCULINO">Masculino</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Búsqueda</label>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleBuscar()}
              placeholder="Nombre o ID"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleBuscar}
              className="w-full bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
            >
              Buscar
            </button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <Loading text="Cargando clientes..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">ID</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase">Cliente</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Contacto</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Sede</th>
                  <th className="text-left py-3 px-3 text-xs font-semibold text-gray-500 uppercase">Plan</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((c) => {
                  const badge = getEstadoBadge(c.estado_cliente)
                  return (
                    <tr key={c.identificacion} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-3 text-xs text-gray-600 font-mono hidden sm:table-cell">{c.identificacion}</td>
                      <td className="py-3 px-3">
                        <p className="font-semibold text-black text-sm">{c.nombre_completo}</p>
                        <p className="text-xs text-gray-400">{c.plan_vigente || (c.estado_cliente === 'Con plan vigente' ? 'Plan vigente' : 'Sin plan')}</p>
                      </td>
                      <td className="py-3 px-3 text-sm hidden md:table-cell">
                        <p className="text-gray-800">{c.celular || '-'}</p>
                        <p className="text-gray-500 text-xs">{c.correo_electronico || '-'}</p>
                      </td>
                      <td className="py-3 px-3 hidden sm:table-cell">
                        <Badge variant="info">{c.nombre_sucursal || getNombreSucursal(c.sucursal_codigo)}</Badge>
                      </td>
                      <td className="py-3 px-3">
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {clientes.length === 0 && (
              <p className="text-center py-8 text-gray-500">No se encontraron clientes</p>
            )}
          </div>
        )}
        {!loading && total > 0 && (
          <Pagination
            total={total}
            page={page}
            perPage={perPage}
            onPageChange={handlePageChange}
            onPerPageChange={handlePerPageChange}
          />
        )}
      </div>
    </div>
  )
}
