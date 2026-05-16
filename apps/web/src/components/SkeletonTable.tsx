interface Props {
  rows?: number
  cols?: number
}

export function SkeletonTable({ rows = 6, cols = 5 }: Props) {
  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="px-4 py-3">
                <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c} className="px-4 py-3">
                  <div
                    className="h-3 animate-pulse rounded bg-gray-100"
                    style={{ width: `${40 + Math.floor(((r * cols + c) * 37) % 40)}%` }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function SkeletonCards({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-white p-4">
          <div className="mb-3 h-4 w-3/4 animate-pulse rounded bg-gray-200" />
          <div className="mb-2 h-3 w-1/2 animate-pulse rounded bg-gray-100" />
          <div className="h-3 w-2/3 animate-pulse rounded bg-gray-100" />
          <div className="mt-4 flex gap-2">
            <div className="h-6 w-16 animate-pulse rounded-full bg-gray-200" />
            <div className="h-6 w-20 animate-pulse rounded-full bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function SkeletonStat({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-white p-4">
          <div className="mb-2 h-3 w-24 animate-pulse rounded bg-gray-200" />
          <div className="h-8 w-16 animate-pulse rounded bg-gray-100" />
        </div>
      ))}
    </div>
  )
}
