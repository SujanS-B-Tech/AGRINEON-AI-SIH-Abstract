import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, MapPin, FlaskConical, Sprout, Stethoscope,
  CalendarDays, TrendingUp, Building2, Landmark, Mic, Bell,
  Settings, LogOut, Menu, X, Leaf, ChevronDown, User,
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

// ─── Navigation structure ────────────────────────────────────
const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'My Farm',
    items: [
      { path: '/farm-profile',   label: 'Farm Profile',  icon: MapPin       },
      { path: '/soil-report',    label: 'Soil Health',   icon: FlaskConical  },
    ],
  },
  {
    label: 'Crop Intelligence',
    items: [
      { path: '/crop-advisory',  label: 'Crop Advisory',  icon: Sprout       },
      { path: '/crop-doctor',    label: 'Crop Doctor',    icon: Stethoscope  },
      { path: '/farming-plan',   label: 'Farming Plan',   icon: CalendarDays },
    ],
  },
  {
    label: 'Field & Market',
    items: [
      { path: '/market',    label: 'Market Intelligence', icon: TrendingUp  },
      { path: '/services',  label: 'Nearby Services',     icon: Building2   },
    ],
  },
  {
    label: 'Assistance',
    items: [
      { path: '/voice-assistant', label: 'AGRI-VOICE',         icon: Mic      },
      { path: '/schemes',         label: 'Gov. Schemes',        icon: Landmark },
      { path: '/notifications',   label: 'Notifications',       icon: Bell     },
    ],
  },
]

// Bottom-nav items for mobile (5 primary sections)
const BOTTOM_NAV = [
  { path: '/dashboard',      label: 'Home',    icon: LayoutDashboard },
  { path: '/crop-advisory',  label: 'Crops',   icon: Sprout          },
  { path: '/crop-doctor',    label: 'Doctor',  icon: Stethoscope     },
  { path: '/market',         label: 'Market',  icon: TrendingUp      },
  { path: '/voice-assistant',label: 'Voice',   icon: Mic             },
]

// ─── Sidebar ─────────────────────────────────────────────────
function Sidebar({ open, onClose, user, onLogout }) {
  const location = useLocation()

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-60 flex flex-col bg-white border-r border-gray-200
        shadow-sidebar
        transform transition-transform duration-200 ease-out
        lg:translate-x-0
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-gray-100">
          <div className="w-8 h-8 bg-primary-700 rounded-lg flex items-center justify-center shrink-0">
            <Leaf className="w-4.5 h-4.5 text-white" style={{ width: '1.125rem', height: '1.125rem' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-primary-900 tracking-wide">AGRONEON</p>
            <p className="text-[10px] text-gray-400 font-medium">Smart Farming Ecosystem</p>
          </div>
          <button
            className="lg:hidden p-1 text-gray-400 hover:text-gray-600"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-2 px-2">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="nav-section-label">{group.label}</p>
              {group.items.map(({ path, label, icon: Icon }) => {
                const active = location.pathname === path
                return (
                  <Link
                    key={path}
                    to={path}
                    onClick={onClose}
                    className={active ? 'nav-item-active' : 'nav-item'}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{label}</span>
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* User / Footer */}
        <div className="border-t border-gray-100 p-3">
          <Link
            to="/settings"
            onClick={onClose}
            className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-800 font-bold text-xs shrink-0 group-hover:bg-primary-200 transition-colors">
              {user?.name?.charAt(0)?.toUpperCase() || 'F'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{user?.name || 'Farmer'}</p>
              <p className="text-[11px] text-gray-400 truncate">{user?.email || 'Settings'}</p>
            </div>
            <Settings className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 shrink-0" />
          </Link>
          <button
            onClick={onLogout}
            className="mt-1 flex items-center gap-2 w-full px-2 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}

// ─── Topbar ───────────────────────────────────────────────────
function Topbar({ onMenuClick, user }) {
  const navigate = useNavigate()
  const [dropOpen, setDropOpen] = useState(false)
  const dropRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className="h-14 bg-white border-b border-gray-200 shadow-topbar flex items-center gap-3 px-4 shrink-0 z-30 sticky top-0">
      {/* Mobile hamburger */}
      <button
        className="lg:hidden p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
        onClick={onMenuClick}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Farm info */}
      <div className="flex-1 flex items-center gap-2 min-w-0">
        <Leaf className="w-4 h-4 text-primary-600 shrink-0 hidden sm:block" />
        <span className="text-sm font-semibold text-gray-700 truncate hidden sm:block">
          AGRONEON
        </span>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1">
        {/* Notifications */}
        <Link
          to="/notifications"
          className="relative p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-1 ring-white" />
        </Link>

        {/* User avatar dropdown */}
        <div className="relative" ref={dropRef}>
          <button
            onClick={() => setDropOpen(!dropOpen)}
            className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="w-7 h-7 bg-primary-700 rounded-full flex items-center justify-center text-white font-bold text-xs">
              {user?.name?.charAt(0)?.toUpperCase() || 'F'}
            </div>
            <span className="text-sm font-medium text-gray-700 hidden md:block truncate max-w-[100px]">
              {user?.name || 'Farmer'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden md:block" />
          </button>

          {dropOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-44 bg-white rounded-xl border border-gray-200 shadow-card-hover z-50 py-1 animate-fade-in">
              <button
                onClick={() => { navigate('/settings'); setDropOpen(false) }}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <User className="w-4 h-4 text-gray-400" /> Settings
              </button>
              <div className="border-t border-gray-100 my-1" />
              <button
                onClick={() => { navigate('/'); setDropOpen(false) }}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

// ─── Mobile Bottom Navigation ─────────────────────────────────
function BottomNav() {
  const location = useLocation()
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 flex items-center">
      {BOTTOM_NAV.map(({ path, label, icon: Icon }) => {
        const active = location.pathname === path
        return (
          <Link
            key={path}
            to={path}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-semibold transition-colors ${
              active ? 'text-primary-700' : 'text-gray-400 hover:text-gray-700'
            }`}
          >
            <Icon className={`w-5 h-5 ${active ? 'text-primary-700' : ''}`} />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}

// ─── Main Layout ──────────────────────────────────────────────
export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-soil-50 flex">
      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
          user={user}
        />

        {/* Page content */}
        <main className="flex-1 p-5 pb-20 lg:pb-6 overflow-y-auto">
          <div className="max-w-screen-xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  )
}
