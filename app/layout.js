import './globals.css'
import { Montserrat } from 'next/font/google'
import Header from '../components/layout/Header'
import ResponsiveLayout from '../components/layout/ResponsiveLayout'

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
      <body className={`bg-gray-100 ${montserrat.className} overflow-x-hidden`}>
        <Header />
        <ResponsiveLayout>{children}</ResponsiveLayout>
      </body>
    </html>
  )
}
