import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import DashboardLayout from '../components/DashboardLayout'
import api from '../utils/api'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ec4899', '#9ca3af']

export default function CropDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [crop, setCrop] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selecting, setSelecting] = useState(false)
  const [farmData, setFarmData] = useState(null)

  useEffect(() => {
    fetchCropDetails()
  }, [id])

  const fetchCropDetails = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/crop/${id}`)
      setCrop(res.data)
      const farmRes = await api.get('/farms/')
      if (farmRes.data.length > 0) setFarmData(farmRes.data[0])
    } catch (e) {
      console.error(e)
      navigate('/crop-advisory')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectCrop = async () => {
    if (!farmData) return
    setSelecting(true)
    try {
      await api.post('/crop/select', { farm_id: farmData.id, recommendation_id: parseInt(id) })
      navigate('/farming-plan')
    } catch (e) {
      alert("Failed to plan this crop.")
      setSelecting(false)
    }
  }

  if (loading || !crop) {
    return <DashboardLayout><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 m-8" /></DashboardLayout>
  }

  const costData = [
    { name: 'Seed', value: parseFloat(crop.seed_cost) || 0 },
    { name: 'Fertilizer', value: parseFloat(crop.fertilizer_cost) || 0 },
    { name: 'Labour', value: parseFloat(crop.labour_cost) || 0 },
    { name: 'Irrigation', value: parseFloat(crop.irrigation_cost) || 0 },
    { name: 'Equipment', value: parseFloat(crop.equipment_cost) || 0 },
    { name: 'Other', value: parseFloat(crop.other_cost) || 0 },
  ].filter(c => c.value > 0)

  const totalCost = costData.reduce((acc, curr) => acc + curr.value, 0)
  const revenue = parseFloat(crop.estimated_revenue) || 0
  const profit = parseFloat(crop.estimated_profit) || 0
  const yieldAmt = parseFloat(crop.expected_yield) || 0

  return (
    <DashboardLayout title={crop.crop_name} subtitle="Detailed economics and risk assessment">
      <div className="space-y-6 max-w-5xl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" /> Back to Recommendations
        </button>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="card">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-primary-500" /> Explainable AI Reasoning</h3>
              <div className="space-y-3">
                {crop.explanation.map((reason, i) => (
                  <div key={i} className="flex gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <Check className="w-5 h-5 text-green-500 shrink-0" />
                    <p className="text-gray-700 text-sm">{reason}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-green-500" /> Crop Economics (Estimated)</h3>
              <div className="grid sm:grid-cols-2 gap-8">
                <div>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={costData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value">
                          {costData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-center text-sm font-medium text-gray-600 mt-2">Total Cultivation Cost: ₹{totalCost.toLocaleString()}</div>
                </div>
                
                <div className="space-y-4 justify-center flex flex-col">
                  <div>
                    <p className="text-sm text-gray-500">Expected Yield</p>
                    <p className="text-xl font-bold">{yieldAmt} {crop.yield_unit}</p>
                  </div>
                  <div className="border-t border-gray-100 pt-3">
                    <p className="text-sm text-gray-500">Estimated Revenue</p>
                    <p className="text-xl font-bold text-blue-600">₹{revenue.toLocaleString()}</p>
                  </div>
                  <div className="border-t border-gray-100 pt-3">
                    <p className="text-sm text-gray-500">Estimated Net Profit</p>
                    <p className="text-3xl font-extrabold text-green-600">₹{profit.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card border-t-4 border-t-amber-500 bg-amber-50/20">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-amber-500" /> Risk Assessment</h3>
              <div className="mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wide
                  ${crop.risk_level === 'High' ? 'bg-red-100 text-red-800' : 
                    crop.risk_level === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-green-100 text-green-800'}`}>
                  {crop.risk_level} Risk
                </span>
              </div>
              <ul className="space-y-2">
                {crop.risk_factors.map((risk, i) => (
                  <li key={i} className="text-sm text-gray-700 flex gap-2"><span className="text-amber-500">•</span> {risk}</li>
                ))}
              </ul>
            </div>

            <div className="card bg-primary-600 border-none text-white text-center p-8">
              <h3 className="text-xl font-bold mb-2">Proceed with this crop?</h3>
              <p className="text-primary-100 text-sm mb-6">Selecting this will generate your daily farming plan and task calendar.</p>
              <button 
                onClick={handleSelectCrop}
                disabled={selecting}
                className="w-full py-4 bg-white text-primary-700 font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-lg active:scale-95"
              >
                {selecting ? 'Creating Plan...' : 'Yes, Plant this Crop'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
