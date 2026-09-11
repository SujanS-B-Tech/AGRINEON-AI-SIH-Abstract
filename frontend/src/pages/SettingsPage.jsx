import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Globe, Bell, Shield, LogOut, ChevronRight, MapPin } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import PageHeader from '../components/PageHeader'
import { Spinner } from '../components/LoadingState'
import { useAuth } from '../context/AuthContext'

function SettingRow({ icon: Icon, label, description, action }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
          <Icon className="w-4 h-4 text-gray-500" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">{label}</p>
          {description && <p className="text-xs text-gray-400">{description}</p>}
        </div>
      </div>
      <div className="shrink-0 ml-4">{action}</div>
    </div>
  )
}

// Toggle switch component
function Toggle({ checked, onChange }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
      <div className="w-10 h-5 bg-gray-200 peer-checked:bg-primary-600 rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
    </label>
  )
}

export default function SettingsPage() {
  const { user, logout, updateUser } = useAuth()
  const navigate = useNavigate()

  const [lang,    setLang]    = useState(user?.language || 'English')
  const [notifs,  setNotifs]  = useState(true)
  const [loading, setLoading] = useState(false)

  const handleLogout = () => { logout(); navigate('/') }

  const savePreferences = async () => {
    setLoading(true)
    try {
      updateUser({ language: lang })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <PageHeader title="Settings" subtitle="Account and app preferences" />

      <div className="max-w-xl space-y-5">
        {/* Profile row */}
        <div className="card flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-700 text-white rounded-full flex items-center justify-center font-bold text-lg shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || 'F'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900">{user?.name || 'Farmer'}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email || 'No email provided'}</p>
            {user?.phone && <p className="text-xs text-gray-400">{user.phone}</p>}
          </div>
          <button onClick={() => navigate('/farm-profile')} className="btn-outline-sm shrink-0">
            Edit Farm
          </button>
        </div>

        {/* Preferences */}
        <div className="card">
          <p className="label-sm text-gray-400 mb-4">Preferences</p>

          <SettingRow
            icon={Globe}
            label="Language"
            description="Interface and assistant language"
            action={
              <select
                value={lang}
                onChange={e => setLang(e.target.value)}
                className="select-field py-1.5 text-sm w-32"
              >
                <option value="English">English</option>
                <option value="Tamil">Tamil</option>
                <option value="Hindi">Hindi</option>
              </select>
            }
          />

          <SettingRow
            icon={Bell}
            label="Push Notifications"
            description="Alerts for tasks and weather"
            action={<Toggle checked={notifs} onChange={() => setNotifs(!notifs)} />}
          />

          <SettingRow
            icon={MapPin}
            label="Farm Location"
            description="Used for weather and market data"
            action={
              <button onClick={() => navigate('/farm-profile')} className="btn-ghost-sm">
                Update <ChevronRight className="w-3.5 h-3.5" />
              </button>
            }
          />

          <div className="pt-4">
            <button onClick={savePreferences} disabled={loading} className="btn-primary">
              {loading ? <><Spinner className="text-white" /> Saving...</> : 'Save Preferences'}
            </button>
          </div>
        </div>

        {/* Account */}
        <div className="card">
          <p className="label-sm text-gray-400 mb-4">Account</p>

          <div className="divide-y divide-gray-100">
            <button className="w-full flex items-center justify-between py-3.5 hover:bg-gray-50 -mx-5 px-5 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-gray-500" />
                </div>
                <p className="text-sm font-medium text-gray-900">Privacy & Security</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 py-3.5 hover:bg-red-50 -mx-5 px-5 transition-colors group"
            >
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-100">
                <LogOut className="w-4 h-4 text-red-500" />
              </div>
              <p className="text-sm font-medium text-red-600">Sign Out</p>
            </button>
          </div>
        </div>

        {/* Version footer */}
        <div className="text-center py-2">
          <p className="text-xs text-gray-400 font-medium">AGRONEON</p>
          <p className="text-[11px] text-gray-300">Version 1.0.0 · Built by Team TECH NEON</p>
          <p className="text-[11px] text-gray-300">Smart India Hackathon 2026</p>
        </div>
      </div>
    </DashboardLayout>
  )
}
