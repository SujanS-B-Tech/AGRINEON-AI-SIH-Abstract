import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sprout, BrainCircuit, ArrowRight, AlertCircle, ChevronRight, Check } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import { Spinner, PageLoadingState } from '../components/LoadingState'
import api from '../utils/api'

// Suitability progress bar
function SuitabilityBar({ pct }) {
  const color = pct >= 80 ? '#15803d' : pct >= 60 ? '#f59e0b' : '#ef4444'
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-bold" style={{ color }}>{pct}%</span>
    </div>
  )
}

const RISK_COLORS = {
  Low:    'badge-success',
  Medium: 'badge-warning',
  High:   'badge-danger',
}

export default function CropAdvisoryPage() {
  const navigate = useNavigate()
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading]   = useState(false)
  const [initLoad, setInitLoad] = useState(true)
  const [farmData, setFarmData] = useState(null)

  useEffect(() => { fetchFarmData() }, [])

  const fetchFarmData = async () => {
    try {
      const res = await api.get('/farms/')
      if (res.data.length > 0) setFarmData(res.data[0])
    } catch (e) {
      console.error(e)
    } finally {
      setInitLoad(false)
    }
  }

  const handleAnalyze = async () => {
    if (!farmData) return
    setLoading(true)
    setRecommendations([])
    try {
      const soilRes = await api.get(`/soil/${farmData.id}`)
      let params = { farm_id: farmData.id }
      if (soilRes.data.length > 0) {
        soilRes.data[0].parameters.forEach(p => {
          if (p.parameter_name.includes('Nitrogen'))   params.nitrogen   = p.value
          if (p.parameter_name.includes('Phosphorus')) params.phosphorus = p.value
          if (p.parameter_name.includes('Potassium'))  params.potassium  = p.value
          if (p.parameter_name.includes('pH'))         params.ph         = p.value
        })
      }
      const res = await api.post('/crop/recommend', params)
      setRecommendations(res.data)
    } catch (e) {
      alert('Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (initLoad) return <DashboardLayout><PageLoadingState /></DashboardLayout>

  return (
    <DashboardLayout>
      <PageHeader
        title="Crop Advisory"
        subtitle="AI-powered crop recommendations based on your soil, climate, and market conditions"
        icon={Sprout}
      />

      {/* No farm profile guard */}
      {!farmData ? (
        <EmptyState
          icon={AlertCircle}
          title="Farm profile required"
          description="Set up your farm location and soil details first so AI can personalise recommendations."
          action={
            <button onClick={() => navigate('/farm-profile')} className="btn-primary">
              Set Up Farm Profile
            </button>
          }
        />
      ) : (
        <div className="space-y-6">
          {/* Analyze panel */}
          {recommendations.length === 0 && !loading && (
            <div className="card max-w-xl">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
                  <BrainCircuit className="w-6 h-6 text-primary-700" />
                </div>
                <div className="flex-1">
                  <h2 className="section-title mb-1">Explainable AI Crop Analysis</h2>
                  <p className="text-sm text-gray-500 mb-4">
                    AGRONEON analyses your farm's location, soil type, water availability, and current season to recommend the most suitable crops — showing you exactly why each was selected.
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-5">
                    {[
                      `Location: ${farmData.location || 'Not set'}`,
                      `Season: ${farmData.current_season || 'Not set'}`,
                      `Water: ${farmData.water_availability || 'Not set'}`,
                      `Soil: ${farmData.soil_type || 'Not set'}`,
                    ].map(tag => (
                      <span key={tag} className="badge-neutral">{tag}</span>
                    ))}
                  </div>
                  <button
                    className="btn-primary"
                    onClick={handleAnalyze}
                    disabled={loading}
                  >
                    Run AI Analysis <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="card max-w-xl flex items-center gap-4 py-6">
              <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center shrink-0">
                <Spinner className="text-primary-600" size="md" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Analysing your farm conditions...</p>
                <p className="text-sm text-gray-400 mt-0.5">Comparing soil, climate, and market data</p>
              </div>
            </div>
          )}

          {/* Results */}
          {recommendations.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="section-title">Recommended for Your Farm</h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Results are ranked by suitability · <span className="font-medium">Values are estimates</span> and may vary
                  </p>
                </div>
                <button onClick={handleAnalyze} disabled={loading} className="btn-ghost-sm">
                  {loading ? <Spinner /> : 'Re-analyse'}
                </button>
              </div>

              {recommendations.map((crop, idx) => (
                <div
                  key={crop.id}
                  className={`card transition-all duration-150 hover:shadow-card-hover ${idx === 0 ? 'border-primary-300 ring-1 ring-primary-200' : ''}`}
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-5">
                    {/* Rank + name */}
                    <div className="flex items-start gap-3 md:w-48 shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                        idx === 0 ? 'bg-primary-700 text-white' : 'bg-gray-100 text-gray-500'
                      }`}>
                        #{idx + 1}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{crop.crop_name}</h3>
                        <SuitabilityBar pct={crop.suitability_score} />
                        <div className="mt-1.5 flex items-center gap-2">
                          <span className={RISK_COLORS[crop.risk_level] || 'badge-neutral'}>{crop.risk_level} Risk</span>
                          {idx === 0 && <span className="badge bg-amber-100 text-amber-800 border-amber-200">Best Match</span>}
                        </div>
                      </div>
                    </div>

                    {/* Reasons */}
                    <div className="flex-1 border-t md:border-t-0 md:border-l border-gray-100 pt-3 md:pt-0 md:pl-5">
                      <p className="label-sm mb-2">Why this crop?</p>
                      <ul className="space-y-1">
                        {crop.explanation.slice(0, 3).map((reason, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                            <Check className="w-3.5 h-3.5 text-primary-600 shrink-0 mt-0.5" />
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Economics */}
                    <div className="border-t md:border-t-0 md:border-l border-gray-100 pt-3 md:pt-0 md:pl-5 md:w-44 shrink-0">
                      <p className="label-sm mb-2">Estimates</p>
                      <div className="space-y-1.5 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Yield</span>
                          <span className="font-semibold text-gray-800">{crop.expected_yield} {crop.yield_unit}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Profit</span>
                          <span className="font-bold text-primary-700">₹{parseFloat(crop.estimated_profit).toLocaleString()}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => navigate(`/crop-details/${crop.id}`)}
                        className="btn-outline-sm w-full mt-3 flex items-center justify-center gap-1"
                      >
                        Full Details <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <p className="text-xs text-gray-400 text-center pt-1">
                Estimates are based on average market and seasonal data. Actual results depend on local conditions and crop management.
              </p>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  )
}
