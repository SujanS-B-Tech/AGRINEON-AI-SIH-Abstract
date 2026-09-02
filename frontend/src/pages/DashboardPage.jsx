import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MapPin, CloudSun, Sprout, TrendingUp, AlertTriangle, PlayCircle, Wind, Droplets
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import DashboardLayout from '../components/DashboardLayout'
import ActionCard from '../components/ActionCard'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [data, setData] = useState({
    farm: null,
    weather: null,
    task: null,
    market: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      // Note: In a real app we'd use Promise.all for parallelism, but keeping it simple here
      const farmsRes = await api.get('/farms/')
      const farm = farmsRes.data[0]
      
      let weather = { temp: 28, condition: "Sunny", humidity: "60%", wind: "10 km/h", rainfall: "0 mm" }
      let task = null
      let market = []
      
      if (farm) {
        weather = (await api.get(`/weather/?lat=${farm.latitude || 10}&lon=${farm.longitude || 79}`)).data
        
        try {
          const planRes = await api.get(`/crop/plan/${farm.id}`)
          task = planRes.data.tasks.find(t => !t.completed)
        } catch (e) {
          // No active plan
        }
        
        if (farm.current_crop) {
          const mktRes = await api.get(`/markets/compare?crop_name=${farm.current_crop}`)
          if (mktRes.data.length > 0) {
            market = mktRes.data.map(m => ({ 
              name: m.name.split(' ')[0], 
              price: m.prices.length > 0 ? m.prices[0].price : 0 
            }))
          }
        }
      }
      
      setData({ farm, weather, task, market })
    } catch (error) {
      console.error("Failed to load dashboard data", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-600 border-t-transparent" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title={`Welcome back, ${user?.name?.split(' ')[0] || 'Farmer'}`}
      subtitle="Here is your farm's overview for today."
    >
      <div className="space-y-6">
        {/* Top Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* Weather Widget */}
          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-blue-100 text-sm flex items-center gap-1"><MapPin className="w-3 h-3" /> {data.farm?.location || 'Unknown Location'}</p>
                <h3 className="text-3xl font-bold mt-1">{data.weather?.temp}°C</h3>
                <p className="text-blue-100">{data.weather?.condition}</p>
              </div>
              <CloudSun className="w-10 h-10 text-yellow-300" />
            </div>
            <div className="flex gap-4 text-sm text-blue-50 border-t border-blue-400/30 pt-3">
              <span className="flex items-center gap-1"><Droplets className="w-4 h-4" /> {data.weather?.humidity}</span>
              <span className="flex items-center gap-1"><Wind className="w-4 h-4" /> {data.weather?.wind}</span>
              <span className="flex items-center gap-1">{data.weather?.rainfall}</span>
            </div>
          </div>

          {/* Current Crop Status */}
          <div className="card">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-gray-500 font-medium">Current Crop</h3>
              <Sprout className="w-5 h-5 text-green-500" />
            </div>
            {data.farm?.current_crop ? (
              <>
                <p className="text-2xl font-bold">{data.farm.current_crop}</p>
                <p className="text-sm text-gray-500 mt-1">Stage: {data.farm.crop_stage}</p>
                <div className="mt-4 bg-green-50 text-green-700 px-3 py-2 rounded-lg text-sm font-medium">
                  Status: Optimal Growth
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-4">
                <p className="text-gray-500 mb-2">No active crop</p>
                <button onClick={() => navigate('/crop-advisory')} className="text-primary-600 text-sm font-medium">
                  Get Recommendations →
                </button>
              </div>
            )}
          </div>

          {/* Today's Task */}
          <div className="card">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-gray-500 font-medium">Today's Task</h3>
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            {data.task ? (
              <>
                <p className="font-bold text-gray-900">{data.task.stage}</p>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{data.task.task_description}</p>
                <button onClick={() => navigate('/farming-plan')} className="w-full mt-4 bg-primary-50 text-primary-700 py-2 rounded-lg text-sm font-medium hover:bg-primary-100">
                  View Full Plan
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <p className="text-gray-500 mb-2">No pending tasks today</p>
                <button onClick={() => navigate('/farming-plan')} className="text-primary-600 text-sm font-medium">
                  View Schedule →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Voice Assistant Promo */}
        <div className="bg-gradient-to-r from-primary-700 to-primary-900 rounded-2xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
              <PlayCircle className="w-6 h-6" /> AGRI-VOICE Assistant
            </h3>
            <p className="text-primary-100 max-w-xl">
              Don't want to type? Just speak to AGRONEON in English or Tamil. Ask about market prices, weather, or crop diseases.
            </p>
          </div>
          <button onClick={() => navigate('/voice-assistant')} className="bg-white text-primary-800 px-6 py-3 rounded-xl font-bold whitespace-nowrap hover:bg-gray-50 transition-colors">
            Start Listening
          </button>
        </div>

        {/* Quick Actions & Market */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card">
            <h3 className="font-semibold mb-4">Quick AI Actions</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <ActionCard 
                icon={MapPin} title="Land Suitability" 
                description="Analyze land images for farming suitability" 
                onClick={() => navigate('/land-analysis')} 
                color="blue"
              />
              <ActionCard 
                icon={Sprout} title="Crop Recommendation" 
                description="Get AI-powered crop suggestions" 
                onClick={() => navigate('/crop-advisory')} 
                color="green"
              />
              <ActionCard 
                icon={TrendingUp} title="Profit Calculator" 
                description="Estimate yield and potential revenue" 
                onClick={() => navigate('/crop-advisory')} 
                color="amber"
              />
              <ActionCard 
                icon={AlertTriangle} title="Disease Detection" 
                description="Upload leaf image for instant diagnosis" 
                onClick={() => navigate('/crop-doctor')} 
                color="red"
              />
            </div>
          </div>

          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Market Prices</h3>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            {data.market.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.market} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <Tooltip cursor={{ fill: '#f1f5f9' }} />
                    <Bar dataKey="price" fill="#16a34a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
               <div className="flex flex-col items-center justify-center h-48 text-center bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500">Select a crop to view market trends</p>
                <button onClick={() => navigate('/market')} className="mt-2 text-primary-600 text-sm font-medium">Explore Markets →</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
