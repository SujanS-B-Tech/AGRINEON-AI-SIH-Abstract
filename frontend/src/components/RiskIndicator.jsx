export default function RiskIndicator({ label, percentage, riskLevel, showBar = true }) {
  const level = riskLevel?.toLowerCase() || (
    percentage >= 70 ? 'high' : percentage >= 40 ? 'medium' : 'low'
  )

  const fillClass = {
    low:    'risk-bar-fill-low',
    medium: 'risk-bar-fill-medium',
    high:   'risk-bar-fill-high',
  }[level] || 'risk-bar-fill-low'

  const textClass = {
    low:    'text-emerald-700',
    medium: 'text-amber-700',
    high:   'text-red-700',
  }[level] || 'text-emerald-700'

  const pct = Math.min(100, Math.max(0, percentage || 0))

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className={`text-sm font-bold ${textClass}`}>{pct}%</span>
      </div>
      {showBar && (
        <div className="risk-bar-track">
          <div className={fillClass} style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  )
}
