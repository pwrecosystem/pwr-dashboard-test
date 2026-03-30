'use client'

import { useState, useEffect } from 'react'

const TABS = [
  { id: 'inactivos', label: '🔥 Inactivos', key: 'inactivos' },
  { id: 'prerenovacion', label: '⏰ Pre-renovación', key: 'preRenovacion' },
  { id: 'fantasmas', label: '💀 Fantasmas', key: 'fantasmas' },
  { id: 'cortesias', label: '🎁 Cortesías', key: 'cortesiasSinConvertir' },
]

function exportCSV(data, filename) {
  if (!data || data.length === 0) return
  const headers = Object.keys(data[0]).join(',')
  const rows = data.map(d =>
    Object.values(d).map(v => (typeof v === 'string' && v.includes(',') ? `"${v}"` : v)).join(',')
  )
  const csv = [headers, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function WhatsAppBtn({ celular }) {
  if (!celular) return null
  return (
    <a
      href={`https://wa.me/57${celular.replace(/\D/g, '')}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center text-green-600 hover:text-green-700"
      title={`WhatsApp ${celular}`}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
      </svg>
    </a>
  )
}

function DiasBadge({ dias, thresholds }) {
  // thresholds: { red: N, yellow: N } — red if dias <= red, yellow if <= yellow
  if (dias === null || dias === undefined) return <span className="text-gray-400">—</span>
  let cls = 'bg-green-100 text-green-800'
  if (dias <= thresholds.red) cls = 'bg-red-100 text-red-800'
  else if (dias <= thresholds.yellow) cls = 'bg-yellow-100 text-yellow-800'
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${cls}`}>
      {dias}d
    </span>
  )
}

function TableInactivos({ data }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-xs lg:text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-3 py-2 text-left font-semibold text-gray-600">Nombre</th>
            <th className="px-3 py-2 text-left font-semibold text-gray-600">Celular</th>
            <th className="px-3 py-2 text-left font-semibold text-gray-600 hidden md:table-cell">Email</th>
            <th className="px-3 py-2 text-left font-semibold text-gray-600 hidden sm:table-cell">Sede</th>
            <th className="px-3 py-2 text-left font-semibold text-gray-600 hidden lg:table-cell">Último plan</th>
            <th className="px-3 py-2 text-right font-semibold text-gray-600">Valor</th>
            <th className="px-3 py-2 text-right font-semibold text-gray-600 hidden sm:table-cell">Días</th>
            <th className="px-3 py-2 text-center font-semibold text-gray-600">WA</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50">
              <td className="px-3 py-2 font-medium text-gray-900 max-w-[140px] truncate">{row.nombre}</td>
              <td className="px-3 py-2 text-gray-600">{row.celular}</td>
              <td className="px-3 py-2 text-gray-500 hidden md:table-cell max-w-[160px] truncate">{row.email}</td>
              <td className="px-3 py-2 text-gray-600 hidden sm:table-cell">{row.sede}</td>
              <td className="px-3 py-2 text-gray-600 hidden lg:table-cell max-w-[140px] truncate">{row.ultimo_plan}</td>
              <td className="px-3 py-2 text-right font-medium text-gray-900">
                {row.ultimo_valor ? `$${row.ultimo_valor.toLocaleString('es-CO')}` : '—'}
              </td>
              <td className="px-3 py-2 text-right hidden sm:table-cell">
                {row.dias_sin_plan !== null ? <span className="text-gray-600">{row.dias_sin_plan}d</span> : '—'}
              </td>
              <td className="px-3 py-2 text-center"><WhatsAppBtn celular={row.celular} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TablePreRenovacion({ data }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-xs lg:text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-3 py-2 text-left font-semibold text-gray-600">Nombre</th>
            <th className="px-3 py-2 text-left font-semibold text-gray-600">Celular</th>
            <th className="px-3 py-2 text-left font-semibold text-gray-600 hidden lg:table-cell">Plan actual</th>
            <th className="px-3 py-2 text-right font-semibold text-gray-600">Valor</th>
            <th className="px-3 py-2 text-center font-semibold text-gray-600">Vence en</th>
            <th className="px-3 py-2 text-left font-semibold text-gray-600 hidden sm:table-cell">Sede</th>
            <th className="px-3 py-2 text-center font-semibold text-gray-600">WA</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50">
              <td className="px-3 py-2 font-medium text-gray-900 max-w-[140px] truncate">{row.nombre}</td>
              <td className="px-3 py-2 text-gray-600">{row.celular}</td>
              <td className="px-3 py-2 text-gray-600 hidden lg:table-cell max-w-[140px] truncate">{row.plan_actual}</td>
              <td className="px-3 py-2 text-right font-medium text-gray-900">
                {row.valor ? `$${row.valor.toLocaleString('es-CO')}` : '—'}
              </td>
              <td className="px-3 py-2 text-center">
                <DiasBadge dias={row.dias_restantes} thresholds={{ red: 15, yellow: 30 }} />
              </td>
              <td className="px-3 py-2 text-gray-600 hidden sm:table-cell">{row.sede}</td>
              <td className="px-3 py-2 text-center"><WhatsAppBtn celular={row.celular} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TableFantasmas({ data }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-xs lg:text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-3 py-2 text-left font-semibold text-gray-600">Nombre</th>
            <th className="px-3 py-2 text-left font-semibold text-gray-600">Celular</th>
            <th className="px-3 py-2 text-left font-semibold text-gray-600 hidden lg:table-cell">Plan</th>
            <th className="px-3 py-2 text-left font-semibold text-gray-600 hidden sm:table-cell">Sede</th>
            <th className="px-3 py-2 text-left font-semibold text-gray-600 hidden md:table-cell">Último check-in</th>
            <th className="px-3 py-2 text-center font-semibold text-gray-600">Días sin ir</th>
            <th className="px-3 py-2 text-center font-semibold text-gray-600">WA</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50">
              <td className="px-3 py-2 font-medium text-gray-900 max-w-[140px] truncate">{row.nombre}</td>
              <td className="px-3 py-2 text-gray-600">{row.celular}</td>
              <td className="px-3 py-2 text-gray-600 hidden lg:table-cell max-w-[140px] truncate">{row.plan_actual}</td>
              <td className="px-3 py-2 text-gray-600 hidden sm:table-cell">{row.sede}</td>
              <td className="px-3 py-2 text-gray-500 hidden md:table-cell">
                {row.ultimo_checkin ? new Date(row.ultimo_checkin).toLocaleDateString('es-CO') : 'Nunca'}
              </td>
              <td className="px-3 py-2 text-center">
                {row.dias_sin_ir !== null
                  ? <DiasBadge dias={row.dias_sin_ir} thresholds={{ red: 30, yellow: 15 }} />
                  : <span className="text-gray-400 text-xs">Sin registro</span>
                }
              </td>
              <td className="px-3 py-2 text-center"><WhatsAppBtn celular={row.celular} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TableCortesias({ data }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-xs lg:text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-3 py-2 text-left font-semibold text-gray-600">Nombre</th>
            <th className="px-3 py-2 text-left font-semibold text-gray-600">Celular</th>
            <th className="px-3 py-2 text-left font-semibold text-gray-600 hidden lg:table-cell">Cortesía</th>
            <th className="px-3 py-2 text-left font-semibold text-gray-600 hidden sm:table-cell">Sede</th>
            <th className="px-3 py-2 text-center font-semibold text-gray-600">Check-ins</th>
            <th className="px-3 py-2 text-center font-semibold text-gray-600 hidden md:table-cell">Tiene plan</th>
            <th className="px-3 py-2 text-center font-semibold text-gray-600">WA</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50">
              <td className="px-3 py-2 font-medium text-gray-900 max-w-[140px] truncate">{row.nombre}</td>
              <td className="px-3 py-2 text-gray-600">{row.celular}</td>
              <td className="px-3 py-2 text-gray-600 hidden lg:table-cell max-w-[140px] truncate">{row.cortesia}</td>
              <td className="px-3 py-2 text-gray-600 hidden sm:table-cell">{row.sede}</td>
              <td className="px-3 py-2 text-center">
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                  row.check_ins === 0 ? 'bg-red-100 text-red-800' :
                  row.check_ins < 3 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {row.check_ins}
                </span>
              </td>
              <td className="px-3 py-2 text-center hidden md:table-cell">
                <span className={`text-xs font-medium ${row.tiene_plan ? 'text-green-600' : 'text-red-500'}`}>
                  {row.tiene_plan ? 'Sí' : 'No'}
                </span>
              </td>
              <td className="px-3 py-2 text-center"><WhatsAppBtn celular={row.celular} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function MarketingPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('inactivos')

  useEffect(() => {
    fetch('/api/marketing')
      .then(r => r.json())
      .then(d => {
        if (d.error) throw new Error(d.error)
        setData(d)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const activeTabConfig = TABS.find(t => t.id === activeTab)
  const activeData = data?.[activeTabConfig?.key]?.detalle || []
  const activeTotal = data?.[activeTabConfig?.key]?.total || 0

  const csvFilenames = {
    inactivos: 'pwr_inactivos.csv',
    prerenovacion: 'pwr_prerenovacion.csv',
    fantasmas: 'pwr_fantasmas.csv',
    cortesias: 'pwr_cortesias_sin_convertir.csv',
  }

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Marketing Intelligence</h1>
        <p className="text-sm text-gray-500 mt-1">Segmentos accionables para retención y conversión</p>
      </div>

      {/* KPIs */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-gray-200 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
              <div className="h-8 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700 text-sm">
          Error cargando datos: {error}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <button
            onClick={() => setActiveTab('inactivos')}
            className={`bg-white rounded-xl p-4 border text-left transition-all hover:shadow-md ${activeTab === 'inactivos' ? 'border-red-400 ring-2 ring-red-200' : 'border-gray-200'}`}
          >
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">🔥 Inactivos</p>
            <p className="text-2xl lg:text-3xl font-bold text-gray-900">{data?.inactivos?.total?.toLocaleString('es-CO') || 0}</p>
            <p className="text-xs text-gray-400 mt-1">Sin plan vigente</p>
          </button>
          <button
            onClick={() => setActiveTab('prerenovacion')}
            className={`bg-white rounded-xl p-4 border text-left transition-all hover:shadow-md ${activeTab === 'prerenovacion' ? 'border-yellow-400 ring-2 ring-yellow-200' : 'border-gray-200'}`}
          >
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">⏰ Pre-renovación</p>
            <p className="text-2xl lg:text-3xl font-bold text-gray-900">{data?.preRenovacion?.total?.toLocaleString('es-CO') || 0}</p>
            <p className="text-xs text-gray-400 mt-1">Vencen en 30-60 días</p>
          </button>
          <button
            onClick={() => setActiveTab('fantasmas')}
            className={`bg-white rounded-xl p-4 border text-left transition-all hover:shadow-md ${activeTab === 'fantasmas' ? 'border-purple-400 ring-2 ring-purple-200' : 'border-gray-200'}`}
          >
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">💀 Fantasmas</p>
            <p className="text-2xl lg:text-3xl font-bold text-gray-900">{data?.fantasmas?.total?.toLocaleString('es-CO') || 0}</p>
            <p className="text-xs text-gray-400 mt-1">Con plan, sin check-in +15d</p>
          </button>
          <button
            onClick={() => setActiveTab('cortesias')}
            className={`bg-white rounded-xl p-4 border text-left transition-all hover:shadow-md ${activeTab === 'cortesias' ? 'border-blue-400 ring-2 ring-blue-200' : 'border-gray-200'}`}
          >
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">🎁 Cortesías</p>
            <p className="text-2xl lg:text-3xl font-bold text-gray-900">{data?.cortesiasSinConvertir?.total?.toLocaleString('es-CO') || 0}</p>
            <p className="text-xs text-gray-400 mt-1">Sin convertir a plan</p>
          </button>
        </div>
      )}

      {/* Sub-tabs + tabla */}
      {!loading && !error && data && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          {/* Tab bar */}
          <div className="flex overflow-x-auto border-b border-gray-200 px-4 pt-3 gap-1 scrollbar-hide">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600 bg-red-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab.label}
                <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">
                  {data?.[tab.key]?.total?.toLocaleString('es-CO') || 0}
                </span>
              </button>
            ))}
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <p className="text-sm text-gray-500">
              Mostrando {activeData.length} de {activeTotal.toLocaleString('es-CO')} registros
            </p>
            <button
              onClick={() => exportCSV(activeData, csvFilenames[activeTab])}
              disabled={activeData.length === 0}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Exportar CSV
            </button>
          </div>

          {/* Table */}
          <div className="min-h-[300px]">
            {activeData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                No hay datos para este segmento
              </div>
            ) : activeTab === 'inactivos' ? (
              <TableInactivos data={activeData} />
            ) : activeTab === 'prerenovacion' ? (
              <TablePreRenovacion data={activeData} />
            ) : activeTab === 'fantasmas' ? (
              <TableFantasmas data={activeData} />
            ) : (
              <TableCortesias data={activeData} />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
