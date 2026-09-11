import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MapPin, CloudSun, Sprout, TrendingUp, Stethoscope,
  CalendarDays, Droplets, Wind, ChevronRight, AlertTriangle,
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import DashboardLayout from '../components/DashboardLayout'
import RiskIndicator from '../components/RiskIndicator'
import { PageLoadingState } from '../components/LoadingState'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

// Helper: current time greeting
function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

// A single compact quick-action row
function QuickAction({ icon: Icon, label, desc, to, color = 'primary' }) {
  const navigate = useNavigate()
  const colorMap = {
    primary: 'text-primary-600 bg-primary-50 group-hover:bg-primary-100',
    amber:   'text-amber-600   bg-amber-50   group-hover:bg-amber-100',
    red:     'text-red-600     bg-red-50     group-hover:bg-red-100',
    blue:    'text-blue-600    bg-blue-50    group-hover:bg-blue-100',
  }
  return (
    <button
      onClick={() => navigate(to)}
      className="group flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors w-full text-left"
    >
      <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${colorMap[color]}`}>
        <Icon className="w-4.5 h-4.5" style={{ width: '1.125rem', height: '1.125rem' }} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        <p className="text-xs text-gray-400 truncate">{desc}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 shrink-0" />
    </button>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [data, setData] = useState({ farm: null, weather: null, task: null, market: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchDashboardData() }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const farmsRes = await api.get('/farms/')
      const farm = farmsRes.data[0] || null

      let weather = { temp: 28, condition: 'Sunny', humidity: '60%', wind: '10 km/h', rainfall: '0 mm' }
      let task = null
      let market = []

      if (farm) {
        try {
          weather = (await api.get(`/weather/?lat=${farm.latitude || 11}&lon=${farm.longitude || 79}`)).data
        } catch (_) {}

        try {
          const planRes = await api.get(`/crop/plan/${farm.id}`)
          task = planRes.data.tasks?.find(t => !t.completed) || null
        } catch (_) {}

        if (farm.current_crop) {
          try {
            const mktRes = await api.get(`/markets/compare?crop_name=${farm.current_crop}`)
            if (mktRes.data.length > 0) {
              market = mktRes.data.map(m => ({
                name: m.name.split(' ')[0],
                price: m.prices?.length > 0 ? m.prices[0].price : 0,
              }))
            }
          } catch (_) {}
        }
      }

      setData({ farm, weather, task, market })
    } catch (err) {
      console.error('Failed to load dashboard data', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <PageLoadingState />
      </DashboardLayout>
    )
  }

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <DashboardLayout>
      {/* ── Greeting ── */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">
          {getGreeting()}, {user?.name?.split(' ')[0] || 'Farmer'}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">{today}</p>
      </div>

      {/* ── Farm status strip ── */}
      {data.farm && (
        <div className="flex flex-wrap items-center gap-4 bg-white border border-gray-200 rounded-xl px-4 py-3 mb-5 shadow-card">
          {data.farm.current_crop && (
            <div className="flex items-center gap-2 text-sm">
              <Sprout className="w-4 h-4 text-primary-600 shrink-0" />
              <span className="font-semibold text-gray-800">{data.farm.current_crop}</span>
              {data.farm.crop_stage && (
                <span className="text-gray-400">· {data.farm.crop_stage}</span>
              )}
            </div>
          )}
          {data.farm.location && (
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              {data.farm.location}
            </div>
          )}
          {data.farm.land_area && (
            <div className="text-sm text-gray-500">
              {data.farm.land_area} acres
            </div>
          )}
          {data.farm.current_season && (
            <span className="badge-primary text-xs">{data.farm.current_season} Season</span>
          )}
          {!data.farm.current_crop && (
            <button
              onClick={() => navigate('/crop-advisory')}
              className="btn-ghost-sm text-primary-700"
            >
              Get crop recommendation →
            </button>
          )}
        </div>
      )}

      {!data.farm && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5 flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800">
            Set up your farm profile for personalized crop and weather recommendations.
          </p>
          <button onClick={() => navigate('/farm-profile')} className="btn-ghost-sm text-amber-800 ml-auto shrink-0">
            Set up →
          </button>
        </div>
      )}

      {/* ── 4 Metric tiles ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {/* Weather */}
        <div className="card-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="metric-label">Temperature</p>
            <CloudSun className="w-4 h-4 text-blue-400" />
          </div>
          <p className="metric-value">{data.weather?.temp ?? '--'}<span className="text-base text-gray-400 font-normal ml-0.5">°C</span></p>
          <p className="text-xs text-gray-500">{data.weather?.condition}</p>
          <div className="flex gap-3 text-[11px] text-gray-400 pt-1 border-t border-gray-100">
            <span className="flex items-center gap-0.5"><Droplets className="w-3 h-3" />{data.weather?.humidity}</span>
            <span className="flex items-center gap-0.5"><Wind className="w-3 h-3" />{data.weather?.wind}</span>
          </div>
        </div>

        {/* Crop Health */}
        <div className="card-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="metric-label">Crop Health</p>
            <Sprout className="w-4 h-4 text-emerald-500" />
          </div>
          {data.farm?.current_crop ? (
            <>
              <span className="badge-success w-fit">Monitoring</span>
              <p className="text-xs text-gray-500">Scan to assess health status</p>
              <button onClick={() => navigate('/crop-doctor')} className="text-xs font-semibold text-primary-700 hover:text-primary-800 text-left mt-auto">
                Open Crop Doctor →
              </button>
            </>
          ) : (
            <p className="text-xs text-gray-400 mt-1">No active crop selected</p>
          )}
        </div>

        {/* Today's Task */}
        <div className="card-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="metric-label">Today's Task</p>
            <CalendarDays className="w-4 h-4 text-amber-500" />
          </div>
          {data.task ? (
            <>
              <p className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded w-fit">{data.task.stage}</p>
              <p className="text-xs text-gray-600 line-clamp-2">{data.task.task_description}</p>
              <button onClick={() => navigate('/farming-plan')} className="text-xs font-semibold text-primary-700 hover:text-primary-800 text-left mt-auto">
                View full plan →
              </button>
            </>
          ) : (
            <p className="text-xs text-gray-400 mt-1">No pending tasks</p>
          )}
        </div>

        {/* Market signal */}
        <div className="card-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="metric-label">Market Signal</p>
            <TrendingUp className="w-4 h-4 text-primary-600" />
          </div>
          {data.market.length > 0 ? (
            <>
              <p className="metric-value text-lg">₹{data.market[0]?.price?.toLocaleString()}</p>
              <p className="text-xs text-gray-500">{data.farm?.current_crop} · best rate</p>
              <button onClick={() => navigate('/market')} className="text-xs font-semibold text-primary-700 hover:text-primary-800 text-left mt-auto">
                Compare markets →
              </button>
            </>
          ) : (
            <p className="text-xs text-gray-400 mt-1">Set crop to see prices</p>
          )}
        </div>
      </div>

      {/* ── Bottom: Chart + Quick Actions ── */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Market chart */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="section-title">
                {data.market.length > 0 && data.farm?.current_crop
                  ? `${data.farm.current_crop} — Market Prices`
                  : 'Market Overview'}
              </p>
              {data.market.length > 0 && (
                <p className="text-xs text-gray-400 mt-0.5">Price per quintal across nearby APMC markets</p>
              )}
            </div>
            <button onClick={() => navigate('/market')} className="btn-ghost-sm">
              View all
            </button>
          </div>
          {data.market.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.market} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                  formatter={(v) => [`₹${v?.toLocaleString()}`, 'Price/quintal']}
                />
                <Bar dataKey="price" radius={[4, 4, 0, 0]}>
                  {data.market.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? '#15803d' : '#d1fae5'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-center bg-gray-50 rounded-lg">
              <TrendingUp className="w-8 h-8 text-gray-200 mb-2" />
              <p className="text-sm text-gray-400">Select a crop in Crop Advisory to view market prices</p>
              <button onClick={() => navigate('/market')} className="text-xs font-semibold text-primary-700 mt-2 hover:text-primary-800">
                Explore Market Intelligence →
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <p className="section-title mb-3">Quick Actions</p>
          <div className="divide-y divide-gray-50">
            <QuickAction icon={Sprout}      label="Crop Advisory"    desc="Get crop recommendations"     to="/crop-advisory"  color="primary" />
            <QuickAction icon={Stethoscope} label="Crop Doctor"      desc="Diagnose crop disease"        to="/crop-doctor"    color="red"     />
            <QuickAction icon={CalendarDays}label="Farming Plan"     desc="View daily task schedule"     to="/farming-plan"   color="amber"   />
            <QuickAction icon={TrendingUp}  label="Market Intel"     desc="Compare APMC prices"          to="/market"        color="blue"    />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
