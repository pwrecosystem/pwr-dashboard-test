'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const menuItems = [
  { href: '/', label: 'Resumen', icon: '📊' },
  { href: '/clientes', label: 'Clientes', icon: '👥' },
  { href: '/vencimientos', label: 'Vencimientos', icon: '⚠️' },
  { href: '/ingresos', label: 'Ingresos', icon: '💰' },
  { href: '/sucursales', label: 'Sucursales', icon: '🏢' },
  { href: '/cortesias', label: 'Cortesías', icon: '🎁' }
]

export default function Sidebar({ onNavigate }) {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white border-r border-gray-100 min-h-screen">
      <nav className="py-4">
        {menuItems.map(item => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors border-l-4 ${
                isActive 
                  ? 'border-pwr-red text-pwr-red bg-white' 
                  : 'border-transparent text-gray-500 hover:text-pwr-black hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
