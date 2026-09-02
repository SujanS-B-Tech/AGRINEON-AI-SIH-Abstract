export default function DemoBadge({ label = 'DEMO DATA' }) {
  return (
    <span className="badge-demo ml-2" title="This is demonstration data, not live information">
      {label}
    </span>
  )
}
