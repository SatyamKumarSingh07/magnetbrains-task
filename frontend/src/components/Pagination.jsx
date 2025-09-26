export default function Pagination({ page = 1, totalPages = 1, onChange }) {
  if (totalPages <= 1) return null
  const pages = []
  for (let i = 1; i <= totalPages; i++) pages.push(i)

  return (
    <div className="flex items-center gap-2">
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`px-3 py-1 rounded-lg border transition ${
            p === page
              ? 'bg-indigo-600 text-white shadow'
              : 'bg-white hover:bg-gray-100'
          }`}
        >
          {p}
        </button>
      ))}
    </div>
  )
}
