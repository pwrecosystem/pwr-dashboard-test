'use client'
import { useState } from 'react'
import Sidebar from './Sidebar'

export default function ResponsiveLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <>
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Hamburger button - mobile only */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-3 left-3 z-50 lg:hidden bg-white rounded-lg p-2 shadow-md border border-gray-200"
        aria-label="Toggle menu"
      >
        <span className="text-xl leading-none">{sidebarOpen ? '✕' : '☰'}</span>
      </button>

      <div className="flex min-h-screen">
        {/* Sidebar - fixed on mobile, static on desktop */}
        <div className={`
          fixed inset-y-0 left-0 z-40 transform transition-transform duration-300
          lg:relative lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <Sidebar onNavigate={() => setSidebarOpen(false)} />
        </div>

        {/* Main content */}
        <main className="flex-1 min-w-0 w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </>
  )
}
