import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, LogOut, Globe, Bell, Shield, ChevronRight } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

export default function SettingsPage() {
  const { user, logout, updateUser } = useAuth()
  const navigate = useNavigate()
  
  const [loading, setLoading] = useState(false)
  const [lang, setLang] = useState(user?.language || 'English')
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const savePreferences = async () => {
    setLoading(true)
    try {
      // Assuming a PUT /auth/me exists, or just update local context
      updateUser({ language: lang })
      alert("Preferences saved!")
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout title="Settings" subtitle="Manage your account preferences">
      <div className="max-w-3xl space-y-6">
        {/* Profile Card */}
        <div className="card flex items-center gap-4">
          <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
            <User className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-xl">{user?.name || 'Farmer Profile'}</h3>
            <p className="text-gray-500 text-sm">{user?.email || 'No email provided'}</p>
          </div>
          <button onClick={() => navigate('/farm-profile')} className="btn-outline text-sm py-2">
            Edit Profile
          </button>
        </div>

        {/* Preferences */}
        <div className="card space-y-2">
          <h3 className="font-semibold text-lg mb-4">Preferences</h3>
          
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Language</p>
                <p className="text-sm text-gray-500">App interface language</p>
              </div>
            </div>
            <select 
              value={lang} 
              onChange={e => setLang(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2"
            >
              <option value="English">English</option>
              <option value="Tamil">Tamil</option>
              <option value="Hindi">Hindi</option>
            </select>
          </div>

          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Push Notifications</p>
                <p className="text-sm text-gray-500">Alerts for tasks & weather</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={notificationsEnabled} onChange={() => setNotificationsEnabled(!notificationsEnabled)} />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
          
          <div className="pt-4">
            <button onClick={savePreferences} disabled={loading} className="btn-primary w-full sm:w-auto">
              {loading ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>

        {/* Security & Account */}
        <div className="card space-y-2">
          <h3 className="font-semibold text-lg mb-4">Account</h3>
          
          <button className="w-full flex justify-between items-center py-3 border-b border-gray-100 hover:bg-gray-50 px-2 -mx-2 rounded-lg transition-colors">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-gray-400" />
              <span className="font-medium text-gray-900">Privacy & Security</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>

          <button onClick={handleLogout} className="w-full flex justify-between items-center py-3 hover:bg-red-50 hover:text-red-600 px-2 -mx-2 rounded-lg transition-colors text-gray-700">
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sign Out</span>
            </div>
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}
