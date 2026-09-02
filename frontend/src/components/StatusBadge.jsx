export default function StatusBadge({ status }) {
  const map = {
    Optimal: 'badge-success',
    Good: 'badge-success',
    Low: 'badge-success',
    Moderate: 'badge-warning',
    Medium: 'badge-warning',
    High: 'badge-danger',
    Info: 'badge-info',
  }
  return <span className={map[status] || 'badge-info'}>{status}</span>
}
