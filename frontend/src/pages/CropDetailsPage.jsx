import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, AlertTriangle, ShieldCheck, TrendingUp } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import PageHeader from '../components/PageHeader'
import RiskIndicator from '../components/RiskIndicator'
import { Spinner, PageLoadingState } from '../components/LoadingState'
import api from '../utils/api'

const RISK_CLASS = {
  Low:    'badge-success',
  Medium: 'badge-warning',
  High:   'badge-danger',
}

export default function CropDetailsPage() {
  const { id, cropId } = useParams()
  const cropIdParam = cropId || id   // support both route param names
  const navigate = useNavigate()
  const [crop,     setCrop]     = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [selecting,setSelecting]= useState(false)
  const [farmData, setFarmData] = useState(null)

  useEffect(() => { fetchCropDetails() }, [cropIdParam])


  const fetchCropDetails = async () => {
    try {
      setLoading(true)
      const [cropRes, farmRes] = await Promise.all([
        api.get(`/crop/${cropIdParam}`),
        api.get('/farms/'),
      ])
      setCrop(cropRes.data)
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
      await api.post('/crop/select', { farm_id: farmData.id, recommendation_id: parseInt(cropIdParam) })
      navigate('/farming-plan')
    } catch (e) {
      alert('Failed to create farming plan. Please try again.')
      setSelecting(false)
    }
  }

  if (loading) return <DashboardLayout><PageLoadingState /></DashboardLayout>
  if (!crop)   return null

  const totalCost = [
    crop.seed_cost, crop.fertilizer_cost, crop.labour_cost,
    crop.irrigation_cost, crop.equipment_cost, crop.other_cost,
  ].reduce((s, v) => s + (parseFloat(v) || 0), 0)

  const revenue = parseFloat(crop.estimated_revenue) || 0
  const profit  = parseFloat(crop.estimated_profit)  || 0
  const yieldAmt= parseFloat(crop.expected_yield)    || 0

  const costRows = [
    { label: 'Seed',       key: 'seed_cost'       },
    { label: 'Fertilizer', key: 'fertilizer_cost'  },
    { label: 'Labour',     key: 'labour_cost'      },
    { label: 'Irrigation', key: 'irrigation_cost'  },
    { label: 'Equipment',  key: 'equipment_cost'   },
    { label: 'Other',      key: 'other_cost'       },
  ].filter(r => parseFloat(crop[r.key]) > 0)

  // Derive risk % for display (use risk_level label → %  approximation)
  const riskPct = crop.risk_level === 'High' ? 75 : crop.risk_level === 'Medium' ? 45 : 20

  return (
    <DashboardLayout>
      {/* Back nav */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to recommendations
      </button>

      <PageHeader
        title={crop.crop_name}
        subtitle="Detailed economics and risk assessment"
        icon={TrendingUp}
        badge={
          <span className={RISK_CLASS[crop.risk_level] || 'badge-neutral'}>
            {crop.risk_level} Risk
          </span>
        }
        action={
          <div className="hidden lg:flex items-center gap-2">
            <span className="text-2xl font-bold text-primary-700">{crop.suitability_score}%</span>
            <span className="text-xs text-gray-400">Suitability</span>
          </div>
        }
      />

      <div className="grid lg:grid-cols-3 gap-5 max-w-5xl">

        {/* ── Left column ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Explainability */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-4 h-4 text-primary-600" />
              <h2 className="section-title">Why AGRONEON recommends this</h2>
            </div>
            <ol className="space-y-3">
              {crop.explanation.map((reason, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="text-sm text-gray-700 leading-relaxed">{reason}</p>
                </li>
              ))}
            </ol>
            <p className="text-[11px] text-gray-400 mt-4 pt-3 border-t border-gray-100">
              Assessment based on farm soil parameters, location, season, and market conditions.
            </p>
          </div>

          {/* Economics */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <h2 className="section-title">Crop Economics</h2>
              <span className="badge-neutral ml-auto">Estimates</span>
            </div>

            {/* Metric row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="label-sm">Total Cost</p>
                <p className="metric-value text-xl mt-1">₹{totalCost.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="label-sm">Expected Yield</p>
                <p className="metric-value text-xl mt-1">{yieldAmt}<span className="text-sm text-gray-400 font-normal ml-1">{crop.yield_unit}</span></p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="label-sm text-blue-600">Est. Revenue</p>
                <p className="text-xl font-bold text-blue-700 mt-1">₹{revenue.toLocaleString()}</p>
              </div>
              <div className="bg-emerald-50 rounded-lg p-3">
                <p className="label-sm text-emerald-600">Est. Profit</p>
                <p className="text-xl font-bold text-emerald-700 mt-1">₹{profit.toLocaleString()}</p>
              </div>
            </div>

            {/* Cost breakdown table */}
            {costRows.length > 0 && (
              <>
                <p className="label-sm mb-2">Cost Breakdown</p>
                <table className="table-base w-full">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th className="text-right">Amount</th>
                      <th className="text-right hidden sm:table-cell">Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {costRows.map(({ label, key }) => {
                      const val = parseFloat(crop[key]) || 0
                      const share = totalCost > 0 ? ((val / totalCost) * 100).toFixed(0) : 0
                      return (
                        <tr key={key}>
                          <td className="font-medium">{label}</td>
                          <td className="text-right">₹{val.toLocaleString()}</td>
                          <td className="text-right text-gray-400 hidden sm:table-cell">{share}%</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </>
            )}

            <p className="text-[11px] text-gray-400 mt-3 pt-3 border-t border-gray-100">
              All financial values are estimates based on average regional data and may vary significantly based on local market conditions, crop management, and weather.
            </p>
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="space-y-5">

          {/* Risk assessment */}
          <div className="card border-l-4 border-l-amber-400">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h2 className="section-title">Risk Assessment</h2>
            </div>
            <div className="mb-4">
              <span className={RISK_CLASS[crop.risk_level] || 'badge-neutral'}>
                {crop.risk_level} Risk
              </span>
            </div>
            <RiskIndicator label="Overall Risk" percentage={riskPct} riskLevel={crop.risk_level?.toLowerCase()} />
            {crop.risk_factors?.length > 0 && (
              <ul className="mt-4 space-y-2">
                {crop.risk_factors.map((risk, i) => (
                  <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5 shrink-0">·</span>
                    {risk}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Select crop CTA */}
          <div className="card border border-primary-200 bg-primary-50/30">
            <h3 className="font-bold text-gray-900 mb-1">Plant this crop?</h3>
            <p className="text-sm text-gray-500 mb-4">
              Selecting this crop will generate a daily farming plan and task calendar for the season.
            </p>
            <button
              onClick={handleSelectCrop}
              disabled={selecting}
              className="btn-primary w-full"
            >
              {selecting ? (
                <><Spinner className="text-white" /> Creating Plan...</>
              ) : (
                <><Check className="w-4 h-4" /> Yes, Plant this Crop</>
              )}
            </button>
            <p className="text-[11px] text-gray-400 text-center mt-2">
              A farming plan will be created based on the current season.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
