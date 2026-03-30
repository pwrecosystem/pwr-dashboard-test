'use client'

import { useEffect, useState } from 'react'
import Badge from '../../components/ui/Badge'
import Loading from '../../components/ui/Loading'
import { SUCURSALES } from '../../lib/constants'

function KpiCard({ title, value, subtitle, color }) {
  const colors = {
    primary: 'border-blue-200 bg-blue-50',
    success: 'border-green-200 bg-green-50',
    warning: 'border-yellow-200 bg-yellow-50',
    danger: 'border-red-200 bg-red-50',
  }
  const textColors = {
    primary: 'text-blue-700',
    success: 'text-green-700',
    warning: 'text-yellow-700',
    danger: 'text-red-700',
  }
  return (
    <div className={`rounded-xl border p-4 ${colors[color] || colors.primary}`}>
      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">{title}</p>
      <p className={`text-3xl font-bold ${textColors[color] || textColors.primary}`}>{value}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  )
}

function DiasBadge({ dias }) {
  if (dias < 7) return <Badge variant="danger">{dias}d</Badge>
  if (dias < 15) return <Badge variant="warning">{dias}d</Badge>
  return <Badge variant="success">{dias}d</Badge>
}

export default function CortesiasPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [estado, setEstado] = useState('vigentes')
  const [sede, setSede] = useState('')
  const [busqueda, setBusqueda] = useState('')

  async function cargar(est, sed) {
    setLoading(true)
    try {
      const params = new URLSearchParams({ estado: est })
      if (sed) params.set('sede', sed)
      const res = await fetch(`/api/cortesias?${params}`)
      const json = await res.json()
      setData(json)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargar(estado, sede)
  }, [estado, sede])

  const detalle = data?.detalle || []
  const filtrado = busqueda
    ? detalle.filter(c => c.nombre_cliente?.toLowerCase().includes(busqueda.toLowerCase()))
    : detalle

  return (
    <div className="p-4 lg:p-8 bg-white min-h-screen">
      <h2 className="text-xl lg:text-2xl font-bold text-pwr-black mb-6">🎁 Cortesías</h2>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <KpiCard
          title="Total cortesías vigentes"
          value={data?.totales?.cortesias ?? '—'}
          subtitle={`${data?.totales?.clientesUnicos ?? 0} clientes únicos`}
          color="primary"
        />
        <KpiCard
          title="Sin plan activo"
          value={data?.totales?.sinPlan ?? '—'}
          subtitle="Oportunidad de conversión"
          color="warning"
        />
        <KpiCard
          title="Nunca fueron"
          value={data?.totales?.sinCheckIn ?? '—'}
          subtitle="0 check-ins registrados"
          color="danger"
        />
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={estado}
          onChange={e => setEstado(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-pwr-black focus:outline-none focus:ring-2 focus:ring-pwr-red"
        >
          <option value="vigentes">Vigentes</option>
          <option value="todas">Todas</option>
          <option value="sin_plan">Sin plan activo</option>
        </select>

        <select
          value={sede}
          onChange={e => setSede(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-pwr-black focus:outline-none focus:ring-2 focus:ring-pwr-red"
        >
          <option value="">Todas las sedes</option>
          {SUCURSALES.map(s => (
            <option key={s.codigo} value={s.codigo}>{s.nombre}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-pwr-black focus:outline-none focus:ring-2 focus:ring-pwr-red flex-1 min-w-48"
        />
      </div>

      {/* Tabla */}
      {loading ? (
        <Loading text="Cargando cortesías..." />
      ) : filtrado.length === 0 ? (
        <p className="text-gray-400 text-center py-12">No hay cortesías para los filtros seleccionados</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Cliente</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Plan</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Sede</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Vigencia</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Días</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Plan activo</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Check-ins</th>
                </tr>
              </thead>
              <tbody>
                {filtrado.map((c, i) => (
                  <tr key={`${c.identificacion_cliente}-${i}`} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-pwr-black text-sm">{c.nombre_cliente}</p>
                      <p className="text-xs text-gray-400">{c.identificacion_cliente}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-700">{c.nombre_plan || '—'}</p>
                      {c.vendedor && <p className="text-xs text-gray-400">{c.vendedor}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-600">{c.nombre_sucursal || '—'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-gray-500">{c.fecha_compra}</p>
                      <p className="text-xs font-medium text-pwr-black">→ {c.fecha_vencimiento}</p>
                    </td>
                    <td className="px-4 py-3">
                      <DiasBadge dias={c.dias_restantes} />
                    </td>
                    <td className="px-4 py-3">
                      {c.tiene_plan
                        ? <Badge variant="success">Con plan</Badge>
                        : <Badge variant="danger">Sin plan</Badge>
                      }
                    </td>
                    <td className="px-4 py-3">
                      {c.check_ins === 0
                        ? <Badge variant="danger">No ha ido</Badge>
                        : <span className="text-sm font-semibold text-pwr-black">{c.check_ins}</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-gray-50 text-xs text-gray-400">
            {filtrado.length} registros
          </div>
        </div>
      )}
    </div>
  )
}
