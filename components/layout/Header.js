import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 py-3 px-4 lg:py-4 lg:px-6">
      <div className="flex items-center gap-3">
        <img 
          src="https://powerclub.com.co/cdn/shop/files/Logo_PWR_redes_sociales.jpg?v=1722338689" 
          alt="PWR Club"
          className="h-8 w-auto lg:h-12"
        />
        <div>
          <h1 className="text-base lg:text-xl font-bold uppercase tracking-wider text-black">
            PWR <span className="text-red-600">Club</span>
          </h1>
          <p className="text-xs text-gray-500 hidden sm:block">Dashboard Administrativo</p>
        </div>
      </div>
    </header>
  )
}
