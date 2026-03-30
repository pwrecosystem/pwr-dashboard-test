export default function Badge({ children, variant = 'default' }) {
  const variants = {
    default: 'bg-gray-50 text-gray-700 border border-gray-200',
    success: 'bg-green-50 text-green-700 border border-green-300',
    warning: 'bg-yellow-50 text-yellow-700 border border-yellow-300',
    danger: 'bg-red-50 text-red-700 border border-red-300',
    info: 'bg-blue-50 text-blue-700 border border-blue-300'
  }

  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold ${variants[variant]}`}>
      {children}
    </span>
  )
}
