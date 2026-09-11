/** Full-page centered spinner used when a whole page is loading */
export function PageLoadingState() {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-gray-400">Loading...</p>
    </div>
  )
}

/** Inline skeleton for a card */
export function CardSkeleton({ rows = 3 }) {
  return (
    <div className="card animate-pulse space-y-3">
      <div className="skeleton h-4 w-1/3" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <div className="skeleton h-3 w-full" />
          <div className="skeleton h-3 w-4/5" />
        </div>
      ))}
    </div>
  )
}

/** Inline spinner for button/submit loading */
export function Spinner({ size = 'sm', className = '' }) {
  const s = size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : 'w-8 h-8'
  return (
    <div className={`${s} border-2 border-current border-t-transparent rounded-full animate-spin ${className}`} />
  )
}

/** Default export is the page-level loading state */
export default PageLoadingState
