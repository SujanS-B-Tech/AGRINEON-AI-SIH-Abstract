import { useState, useEffect } from 'react'
import { Bell, CheckCircle, Info, AlertTriangle, TrendingUp, CheckCheck } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import { PageLoadingState } from '../components/LoadingState'
import api from '../utils/api'

const TYPE_CONFIG = {
  alert:  { icon: AlertTriangle, border: 'border-l-red-500',    iconClass: 'text-red-500',     label: 'Alert'  },
  task:   { icon: CheckCircle,   border: 'border-l-emerald-500', iconClass: 'text-emerald-500', label: 'Task'   },
  market: { icon: TrendingUp,    border: 'border-l-blue-500',    iconClass: 'text-blue-500',    label: 'Market' },
  info:   { icon: Info,          border: 'border-l-gray-400',    iconClass: 'text-gray-400',    label: 'Info'   },
}

function groupNotifications(notifs) {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekStart  = new Date(todayStart); weekStart.setDate(weekStart.getDate() - 7)

  const groups = { today: [], week: [], earlier: [] }
  notifs.forEach(n => {
    const d = new Date(n.created_at)
    if (d >= todayStart)   groups.today.push(n)
    else if (d >= weekStart) groups.week.push(n)
    else                   groups.earlier.push(n)
  })
  return groups
}

function NotificationRow({ n, onMarkRead }) {
  const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.info
  const Icon = cfg.icon
  const timeStr = new Date(n.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

  return (
    <div
      className={`
        flex gap-3 px-4 py-3.5 border-l-4 border-b border-gray-100 last:border-b-0 transition-colors
        ${cfg.border}
        ${n.is_read ? 'opacity-60 bg-white' : 'bg-white hover:bg-gray-50/60 cursor-pointer'}
      `}
      onClick={() => !n.is_read && onMarkRead(n.id)}
    >
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${n.is_read ? 'bg-gray-100' : 'bg-gray-50'}`}>
        <Icon className={`w-3.5 h-3.5 ${cfg.iconClass}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-semibold truncate ${n.is_read ? 'text-gray-600' : 'text-gray-900'}`}>
            {n.title}
            {!n.is_read && <span className="ml-2 w-2 h-2 bg-primary-600 rounded-full inline-block align-middle" />}
          </p>
          <span className="text-[11px] text-gray-400 shrink-0">{timeStr}</span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
      </div>
    </div>
  )
}

function Group({ title, notifications, onMarkRead }) {
  if (notifications.length === 0) return null
  return (
    <div>
      <p className="label-sm text-gray-400 mb-2 px-1">{title}</p>
      <div className="card p-0 overflow-hidden">
        {notifications.map(n => (
          <NotificationRow key={n.id} n={n} onMarkRead={onMarkRead} />
        ))}
      </div>
    </div>
  )
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/notifications/')
      .then(r => setNotifications(r.data))
      .catch(e => console.error(e))
      .finally(() => setLoading(false))
  }, [])

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    } catch (e) {
      console.error(e)
    }
  }

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.is_read)
    await Promise.all(unread.map(n => api.put(`/notifications/${n.id}/read`).catch(() => {})))
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  if (loading) return <DashboardLayout><PageLoadingState /></DashboardLayout>

  const groups = groupNotifications(notifications)
  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <DashboardLayout>
      <PageHeader
        title="Notifications"
        subtitle="Alerts, tasks, and system updates"
        icon={Bell}
        badge={unreadCount > 0 ? <span className="badge-danger">{unreadCount} unread</span> : null}
        action={
          unreadCount > 0 && (
            <button onClick={markAllRead} className="btn-ghost-sm flex items-center gap-1.5">
              <CheckCheck className="w-3.5 h-3.5" /> Mark all read
            </button>
          )
        }
      />

      <div className="max-w-2xl space-y-5">
        {notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notifications"
            description="You're all caught up! Alerts, tasks, and market updates will appear here."
          />
        ) : (
          <>
            <Group title="Today"      notifications={groups.today}   onMarkRead={markAsRead} />
            <Group title="This Week"  notifications={groups.week}    onMarkRead={markAsRead} />
            <Group title="Earlier"    notifications={groups.earlier} onMarkRead={markAsRead} />
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
