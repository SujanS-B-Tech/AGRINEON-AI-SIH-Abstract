import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sprout, BrainCircuit, ArrowRight, AlertCircle } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import StatusBadge from '../components/StatusBadge'
import api from '../utils/api'

export default function CropAdvisoryPage() {
  const navigate = useNavigate()
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(false)
  const [farmData, setFarmData] = useState(null)
  
  useEffect(() => {
    fetchFarmData()
  }, [])

  const fetchFarmData = async () => {
    try {
      const res = await api.get('/farms/')
      if (res.data.length > 0) setFarmData(res.data[0])
    } catch (e) {
      console.error(e)
    }
  }

  const handleAnalyze = async () => {
    if (!farmData) return
    setLoading(true)
    setRecommendations([])
    
    try {
      // First try to get existing soil report
      const soilRes = await api.get(`/soil/${farmData.id}`)
      let params = { farm_id: farmData.id }
      
      if (soilRes.data.length > 0) {
        const report = soilRes.data[0]
        report.parameters.forEach(p => {
          if (p.parameter_name.includes('Nitrogen')) params.nitrogen = p.value
          if (p.parameter_name.includes('Phosphorus')) params.phosphorus = p.value
          if (p.parameter_name.includes('Potassium')) params.potassium = p.value
          if (p.parameter_name.includes('pH')) params.ph = p.value
        })
      }
      
      const res = await api.post('/crop/recommend', params)
      setRecommendations(res.data)
    } catch (e) {
      alert("Failed to analyze. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout title="Smart Crop Advisory" subtitle="AI-powered crop recommendations based on your land and soil">
      <div className="space-y-6">
        {!farmData && !loading ? (
          <div className="card text-center py-12">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Farm Profile Setup Required</h3>
            <p className="text-gray-500 mb-6">You need to set up your farm location and land details first before AI can recommend crops.</p>
            <button onClick={() => navigate('/farm-profile')} className="btn-primary">Set Up Farm Profile</button>
          </div>
        ) : (
          <div className="card text-center max-w-2xl mx-auto border-t-4 border-t-primary-500">
            <BrainCircuit className="w-16 h-16 text-primary-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Explainable AI Analysis</h3>
            <p className="text-gray-600 mb-6 text-sm">
              AGRONEON analyzes your farm's location, soil type, water availability, historical data, and current market trends to recommend the most profitable and suitable crops.
            </p>
            <button 
              className={`btn-primary w-full max-w-sm ${loading ? 'opacity-80' : ''}`}
              onClick={handleAnalyze}
              disabled={loading}
            >
              {loading ? (
                 <div className="flex items-center gap-2">
                   <div className="animate-spin h-5 w-5 border-2 border-white/50 border-t-white rounded-full" />
                   AI is Analyzing...
                 </div>
              ) : 'Run AI Crop Analysis'}
            </button>
          </div>
        )}

        {recommendations.length > 0 && (
          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Sprout className="w-5 h-5 text-green-500" />
              Top Recommended Crops
            </h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((crop, idx) => (
                <div key={crop.id} className="card-hover relative overflow-hidden ring-1 ring-gray-200">
                  {idx === 0 && (
                    <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider">
                      Top Match
                    </div>
                  )}
                  
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">{crop.crop_name}</h4>
                      <p className="text-sm font-medium text-green-600 mt-1">
                        {crop.suitability_score}% Match Score
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="bg-gray-50 rounded-lg p-3 text-sm">
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-500">Est. Profit</span>
                        <span className="font-bold text-green-700">₹{parseFloat(crop.estimated_profit).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-500">Est. Yield</span>
                        <span className="font-medium text-gray-900">{crop.expected_yield} {crop.yield_unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Risk Level</span>
                        <StatusBadge status={crop.risk_level} />
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Why this crop?</p>
                      {crop.explanation.slice(0, 3).map((reason, i) => (
                        <p key={i} className="text-xs text-gray-600 flex gap-2">
                          <span className="text-green-500">✓</span> {reason}
                        </p>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={() => navigate(`/crop-details/${crop.id}`)}
                    className="w-full py-3 bg-gray-100 hover:bg-primary-50 text-gray-800 hover:text-primary-700 font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-1"
                  >
                    View Details & Economics <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
