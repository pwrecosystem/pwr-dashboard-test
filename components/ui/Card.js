export default function Card({ title, value, trend, icon, color = 'primary', subtitle }) {
  const borders = {
    primary: 'border-pwr-red',
    success: 'border-pwr-black',
    warning: 'border-pwr-black',
    info: 'border-pwr-black'
  }

  return (
    <div className={`bg-white rounded-xl p-6 border border-gray-100 border-l-4 ${borders[color]} shadow-sm`}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{title}</h3>
          <p className="text-3xl font-bold text-pwr-black mt-2">{value}</p>
          {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
        </div>
        {icon && (
          <div className="text-gray-200">
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <div className={`mt-4 text-sm font-medium ${trend.value >= 0 ? 'text-pwr-black' : 'text-pwr-red'}`}>
          {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
        </div>
      )}
    </div>
  )
}
