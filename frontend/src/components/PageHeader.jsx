export default function PageHeader({ title, subtitle, badge, action, icon: Icon }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="w-9 h-9 rounded-lg bg-primary-50 border border-primary-100 flex items-center justify-center shrink-0 mt-0.5">
            <Icon className="w-5 h-5 text-primary-700" />
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="page-title">{title}</h1>
            {badge && badge}
          </div>
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0 ml-4">{action}</div>}
    </div>
  )
}
