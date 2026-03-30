import './globals.css'
import Header from '../components/layout/Header'

export const metadata = {
  title: 'PWR Club Dashboard',
  description: 'Dashboard administrativo de PWR Club'
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="bg-gray-100">
        <Header />
        <div className="flex">
          {children}
        </div>
      </body>
    </html>
  )
}
