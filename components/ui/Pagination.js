'use client'

export default function Pagination({ total, page, perPage, onPageChange, onPerPageChange }) {
  const totalPages = Math.ceil(total / perPage)
  const start = (page - 1) * perPage + 1
  const end = Math.min(page * perPage, total)

  if (total === 0) return null

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-gray-200 bg-white">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span>Mostrar</span>
        <select
          value={perPage}
          onChange={(e) => { onPerPageChange(Number(e.target.value)); onPageChange(1) }}
          className="border border-gray-300 rounded px-2 py-1 text-sm"
        >
          {[10, 25, 50, 100].map(n => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <span>por página</span>
      </div>

      <div className="text-sm text-gray-500">
        Mostrando {start}-{end} de {total.toLocaleString()} registros
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1 text-sm border rounded disabled:opacity-30 hover:bg-gray-50"
        >
          ← Anterior
        </button>
        <span className="px-3 py-1 text-sm text-gray-600">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="px-3 py-1 text-sm border rounded disabled:opacity-30 hover:bg-gray-50"
        >
          Siguiente →
        </button>
      </div>
    </div>
  )
}
