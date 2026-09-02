import { useState, useEffect } from 'react'
import { Bell, CheckCircle, Info, AlertTriangle, MessageSquare } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import api from '../utils/api'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications/')
      setNotifications(res.data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`)
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n))
    } catch (e) {
      console.error(e)
    }
  }

  const getIcon = (type) => {
    switch(type) {
      case 'alert': return <AlertTriangle className="w-6 h-6 text-red-500" />
      case 'task': return <CheckCircle className="w-6 h-6 text-green-500" />
      case 'market': return <MessageSquare className="w-6 h-6 text-blue-500" />
      default: return <Info className="w-6 h-6 text-primary-500" />
    }
  }

  if (loading) {
    return <DashboardLayout><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 m-8" /></DashboardLayout>
  }

  return (
    <DashboardLayout title="Notifications" subtitle="Alerts, tasks, and system updates">
      <div className="max-w-3xl space-y-4">
        {notifications.length === 0 ? (
          <div className="card text-center py-12 text-gray-500">
            <Bell className="w-10 h-10 mx-auto mb-3 text-gray-300" />
            No new notifications.
          </div>
        ) : (
          notifications.map(n => (
            <div 
              key={n.id} 
              className={`p-4 rounded-xl border flex gap-4 transition-colors cursor-pointer ${n.is_read ? 'bg-white border-gray-100 opacity-70' : 'bg-blue-50/50 border-blue-100 shadow-sm'}`}
              onClick={() => !n.is_read && markAsRead(n.id)}
            >
              <div className="shrink-0 mt-1">
                {getIcon(n.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className={`font-bold ${n.is_read ? 'text-gray-700' : 'text-gray-900'}`}>{n.title}</h4>
                  <span className="text-xs text-gray-500 font-medium">{new Date(n.created_at).toLocaleDateString()}</span>
                </div>
                <p className={`text-sm mt-1 ${n.is_read ? 'text-gray-500' : 'text-gray-700'}`}>{n.message}</p>
                {!n.is_read && (
                  <button className="text-xs font-bold text-primary-600 mt-2 hover:text-primary-700">Mark as read</button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  )
}
