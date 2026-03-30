export default function Card({ title, value, trend, icon, color = 'primary', subtitle }) {
  const borders = {
    primary: 'border-l-red-600',
    success: 'border-l-green-500',
    warning: 'border-l-yellow-500',
    info: 'border-l-blue-500'
  }

  return (
    <div className={`bg-white rounded-xl p-4 lg:p-6 border border-gray-100 border-l-4 ${borders[color]} shadow-sm`}>
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider truncate">{title}</h3>
          <p className="text-xl lg:text-3xl font-bold text-pwr-black mt-1 lg:mt-2 truncate">{value}</p>
          {subtitle && <p className="text-gray-400 text-xs lg:text-sm mt-1 truncate">{subtitle}</p>}
        </div>
        {icon && (
          <div className="text-gray-200">
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <div className={`mt-4 text-sm font-medium ${trend.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
        </div>
      )}
    </div>
  )
}
