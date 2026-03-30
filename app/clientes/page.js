'use client'

import { useEffect, useState } from 'react'
import Loading from '../../components/ui/Loading'
import Badge from '../../components/ui/Badge'
import { SUCURSALES } from '../../lib/constants'

export default function ClientesPage() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtroSede, setFiltroSede] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    loadClientes()
  }, [filtroSede, filtroEstado])

  async function loadClientes() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filtroSede) params.set('sede', filtroSede)
      if (filtroEstado) params.set('estado', filtroEstado)
      if (busqueda) params.set('busqueda', busqueda)

      const res = await fetch(`/api/clientes?${params}`)
      const data = await res.json()
      setClientes(data.clientes || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  function handleBuscar() {
    loadClientes()
  }

  function getEstadoBadge(estadoCliente) {
    if (estadoCliente === 'Con plan vigente') return { label: 'Con plan', variant: 'success' }
    if (estadoCliente === 'Sin plan vigente') return { label: 'Sin plan', variant: 'warning' }
    return { label: estadoCliente || 'N/A', variant: 'default' }
  }

  return (
    <div className="p-8 bg-gray-50">
      <h2 className="text-2xl font-bold text-black mb-6">👥 Clientes</h2>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Estado</label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-600"
            >
              <option value="">Todos</option>
              <option value="ACTIVO">Activo</option>
              <option value="INACTIVO">Inactivo</option>
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
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">ID</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Cliente</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Contacto</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Sede</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Estado</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((c) => {
                  const badge = getEstadoBadge(c.estado_cliente)
                  return (
                    <tr key={c.identificacion} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-600 font-mono">{c.identificacion}</td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-black">{c.nombre_completo}</p>
                        <p className="text-xs text-gray-400">{c.plan_vigente || 'Sin plan'}</p>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <p className="text-gray-800">{c.celular || '-'}</p>
                        <p className="text-gray-500 text-xs">{c.correo_electronico || '-'}</p>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="info">{c.nombre_sucursal || `Sede ${c.sucursal_codigo || '-'}`}</Badge>
                      </td>
                      <td className="py-3 px-4">
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
      </div>

      <p className="text-sm text-gray-500 mt-4">
        Mostrando {clientes.length} clientes
      </p>
    </div>
  )
}
