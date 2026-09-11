import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function MetricBlock({ label, value, unit, trend, status, className = '' }) {
  const trendIcon = trend === 'up'
    ? <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
    : trend === 'down'
    ? <TrendingDown className="w-3.5 h-3.5 text-red-500" />
    : trend === 'stable'
    ? <Minus className="w-3.5 h-3.5 text-gray-400" />
    : null

  const statusClass = {
    success: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    warning: 'text-amber-700  bg-amber-50  border-amber-200',
    danger:  'text-red-700   bg-red-50    border-red-200',
    info:    'text-blue-700  bg-blue-50   border-blue-200',
    neutral: 'text-gray-600  bg-gray-50   border-gray-200',
  }[status] || ''

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <p className="metric-label">{label}</p>
      <div className="flex items-baseline gap-1.5">
        <span className="metric-value">{value}</span>
        {unit && <span className="metric-unit">{unit}</span>}
        {trendIcon && <span className="ml-0.5">{trendIcon}</span>}
      </div>
      {status && (
        <span className={`inline-flex w-fit text-[11px] font-semibold px-1.5 py-0.5 rounded border ${statusClass}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      )}
    </div>
  )
}
