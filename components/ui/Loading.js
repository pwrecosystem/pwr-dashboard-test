export default function Loading({ text = 'Cargando...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-red-600"></div>
      <p className="text-gray-500 mt-4 text-sm font-medium">{text}</p>
    </div>
  )
}
