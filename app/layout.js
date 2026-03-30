import './globals.css'
import { Montserrat } from 'next/font/google'
import Header from '../components/layout/Header'
import Sidebar from '../components/layout/Sidebar'

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
})

export const metadata = {
  title: 'PWR Club Dashboard',
  description: 'Dashboard administrativo de PWR Club'
}

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={montserrat.variable}>
      <body className={`bg-gray-100 ${montserrat.className}`}>
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
