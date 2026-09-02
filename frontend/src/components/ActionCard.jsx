export default function ActionCard({ icon: Icon, title, description, onClick, color = 'primary' }) {
  const colors = {
    primary: 'bg-primary-50 text-primary-600 group-hover:bg-primary-100',
    blue: 'bg-blue-50 text-blue-600 group-hover:bg-blue-100',
    amber: 'bg-amber-50 text-amber-600 group-hover:bg-amber-100',
    red: 'bg-red-50 text-red-600 group-hover:bg-red-100',
    purple: 'bg-purple-50 text-purple-600 group-hover:bg-purple-100',
    teal: 'bg-teal-50 text-teal-600 group-hover:bg-teal-100',
  }

  return (
    <button onClick={onClick} className="card-hover group text-left w-full">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${colors[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="font-semibold text-gray-900 text-base mb-1">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </button>
  )
}
