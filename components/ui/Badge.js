export default function Badge({ children, variant = 'default' }) {
  const variants = {
    default: 'bg-white text-pwr-black border border-gray-200',
    success: 'bg-white text-pwr-black border border-pwr-black',
    warning: 'bg-white text-pwr-black border border-pwr-black',
    danger: 'bg-pwr-red text-white border border-pwr-red',
    info: 'bg-white text-pwr-black border border-gray-300'
  }

  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold ${variants[variant]}`}>
      {children}
    </span>
  )
}
