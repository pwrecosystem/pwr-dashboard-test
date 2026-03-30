'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Loading from '../components/ui/Loading'
import { formatCurrency } from '../lib/utils'
import { getNombreSucursal } from '../lib/constants'

export default function Home() {
  const [dashboard, setDashboard] = useState(null)
  const [vencimientos, setVencimientos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [dashRes, vencRes] = await Promise.all([
          fetch('/api/dashboard'),
          fetch('/api/vencimientos?dias=7')
        ])

        const dashData = await dashRes.json()
        const vencData = await vencRes.json()

        setDashboard(dashData)
        setVencimientos(vencData.detalle || [])
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="p-4 lg:p-8">
        <Loading text="Cargando dashboard..." />
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8 bg-white">
      <h2 className="text-xl lg:text-2xl font-bold text-pwr-black mb-4 lg:mb-6">Resumen General</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-6 mb-6 lg:mb-8">
        <Card
          title="Cortesías sin convertir"
          value={dashboard?.cortesias?.sinPlan || 0}
          subtitle={`De ${dashboard?.cortesias?.vigentes || 0} vigentes`}
          color="warning"
        />
        <Card
          title="Con Plan Vigente"
          value={dashboard?.clientes?.conPlan || 0}
          color="success"
        />
        <Card
          title="Sin Plan"
          value={dashboard?.clientes?.sinPlan || 0}
          color="warning"
        />
        <Card
          title="Ingreso Mes"
          value={formatCurrency(dashboard?.ingresos?.mesActual || 0)}
          trend={{
            value: dashboard?.ingresos?.variacion || 0,
            label: 'vs mes anterior'
          }}
          color="info"
        />
        <Card
          title="Wellness Amsterdam"
          value={formatCurrency(dashboard?.wellness?.ingresoTotal || 0)}
          subtitle="Total histórico"
          color="info"
        />
      </div>

      {/* Alerta Vencimientos */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-pwr-black">
            ⚠️ Planes por Vencer (7 días)
          </h3>
          <Link 
            href="/vencimientos"
            className="text-pwr-red text-sm font-semibold hover:underline"
          >
            Ver todos →
          </Link>
        </div>

        {vencimientos.length === 0 ? (
          <p className="text-gray-400">No hay planes por vencer en los próximos 7 días</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 text-xs font-semibold text-gray-400 uppercase">Cliente</th>
                  <th className="text-left py-3 text-xs font-semibold text-gray-400 uppercase">Vencimiento</th>
                  <th className="text-left py-3 text-xs font-semibold text-gray-400 uppercase">Valor</th>
                  <th className="text-left py-3 text-xs font-semibold text-gray-400 uppercase">Estado</th>
                </tr>
              </thead>
              <tbody>
                {vencimientos.slice(0, 5).map(f => {
                  const dias = f.dias_restantes ?? f.diasRestantes ?? 0
                  const status = dias <= 3 
                    ? { label: `Vence en ${dias} días`, variant: 'danger' }
                    : { label: `Vence en ${dias} días`, variant: 'warning' }

                  return (
                    <tr key={f.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3">
                        <p className="font-medium text-pwr-black">{f.nombre_completo || f.nombre_cliente}</p>
                        <p className="text-sm text-gray-400">{f.celular}</p>
                      </td>
                      <td className="py-3">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </td>
                      <td className="py-3 font-semibold text-pwr-black">
                        {formatCurrency(f.total)}
                      </td>
                      <td className="py-3">
                        <Badge variant="info">{getNombreSucursal(f.sucursal_codigo)}</Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sucursales */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-lg font-bold text-pwr-black mb-4">🏢 Sucursales</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {dashboard?.sucursales?.map(suc => (
            <div key={suc.codigo} className="bg-white rounded-lg p-4 border border-gray-100">
              <p className="text-xs text-gray-400 font-semibold uppercase">{suc.nombre}</p>
              <p className="text-2xl font-bold text-pwr-black mt-1">{suc.clientes}</p>
              <p className="text-xs text-gray-300 mt-1">clientes</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
