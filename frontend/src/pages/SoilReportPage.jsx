import { useState, useEffect } from 'react'
import { FileUp, FlaskConical, AlertTriangle, Check, Info } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import PageHeader from '../components/PageHeader'
import { Spinner, PageLoadingState } from '../components/LoadingState'
import EmptyState from '../components/EmptyState'
import api from '../utils/api'

// ── Soil parameter interpretation ─────────────────────────────
function interpretParam(name, value) {
  if (name.includes('pH')) {
    if (value < 5.5) return { status: 'warning', label: 'Acidic', hint: 'Consider lime application to raise pH' }
    if (value > 8.0) return { status: 'danger',  label: 'Alkaline', hint: 'Gypsum or sulfur may help lower pH' }
    return { status: 'success', label: 'Optimal', hint: 'Ideal for most crops' }
  }
  if (name.includes('Nitrogen')) {
    if (value < 100) return { status: 'warning', label: 'Low', hint: 'Nitrogen fertilization recommended' }
    if (value > 250) return { status: 'info',    label: 'High', hint: 'Monitor leaching risk' }
    return { status: 'success', label: 'Adequate', hint: 'Good nitrogen levels' }
  }
  if (name.includes('Phosphorus')) {
    if (value < 20) return { status: 'warning', label: 'Low', hint: 'Phosphatic fertilizer needed' }
    return { status: 'success', label: 'Adequate', hint: 'Acceptable phosphorus level' }
  }
  if (name.includes('Potassium')) {
    if (value < 100) return { status: 'warning', label: 'Low', hint: 'Potash application recommended' }
    return { status: 'success', label: 'Adequate', hint: 'Good potassium availability' }
  }
  if (name.includes('Organic')) {
    if (value < 0.5) return { status: 'warning', label: 'Low', hint: 'Add organic matter or compost' }
    return { status: 'success', label: 'Good', hint: 'Healthy organic carbon level' }
  }
  if (name.includes('Extraction Status')) {
    return { status: 'warning', label: 'OCR Failed', hint: 'Could not extract numerical values from the document.' }
  }
  return { status: '', label: value !== null ? 'Recorded' : 'N/A', hint: '' }
}

const STATUS_COLORS = {
  success: 'badge-success',
  warning: 'badge-warning',
  danger:  'badge-danger',
  info:    'badge-info',
}

// pH range bar
function PhBar({ value }) {
  const pct = Math.min(100, Math.max(0, ((value - 3) / (11 - 3)) * 100))
  const color = value < 5.5 ? '#ef4444' : value > 8.0 ? '#f59e0b' : '#16a34a'
  return (
    <div className="mt-2">
      <div className="flex justify-between text-[10px] text-gray-400 mb-1">
        <span>Acidic (3)</span><span>Neutral (7)</span><span>Alkaline (11)</span>
      </div>
      <div className="risk-bar-track">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

export default function SoilReportPage() {
  const [activeTab, setActiveTab] = useState('upload')
  const [file, setFile]           = useState(null)
  const [farmId, setFarmId]       = useState(null)
  const [manualParams, setManualParams] = useState({ nitrogen: '', phosphorus: '', potassium: '', ph: '' })
  const [loading, setLoading]     = useState(false)
  const [initLoading, setInitLoading] = useState(true)
  const [reports, setReports]     = useState([])
  const [currentReport, setCurrentReport] = useState(null)

  useEffect(() => { fetchFarmAndReports() }, [])

  const fetchFarmAndReports = async () => {
    try {
      const farmsRes = await api.get('/farms/')
      if (farmsRes.data.length > 0) {
        const fId = farmsRes.data[0].id
        setFarmId(fId)
        const reportsRes = await api.get(`/soil/${fId}`)
        setReports(reportsRes.data)
        if (reportsRes.data.length > 0) {
          setCurrentReport(reportsRes.data[0])
          setActiveTab('history')
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setInitLoading(false)
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file || !farmId) return
    setLoading(true)
    const formData = new FormData()
    formData.append('farm_id', farmId)
    formData.append('file', file)
    try {
      const res = await api.post('/soil/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setReports([res.data, ...reports])
      setCurrentReport(res.data)
      setActiveTab('history')
      setFile(null)
    } catch (e) {
      alert('Upload failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleManualSubmit = async (e) => {
    e.preventDefault()
    if (!farmId) return
    setLoading(true)
    const payload = {
      farm_id: farmId,
      parameters: [
        { parameter_name: 'Nitrogen (N)',   value: parseFloat(manualParams.nitrogen),   unit: 'kg/ha' },
        { parameter_name: 'Phosphorus (P)', value: parseFloat(manualParams.phosphorus), unit: 'kg/ha' },
        { parameter_name: 'Potassium (K)',  value: parseFloat(manualParams.potassium),  unit: 'kg/ha' },
        { parameter_name: 'pH',             value: parseFloat(manualParams.ph),          unit: ''      },
      ],
    }
    try {
      const res = await api.post('/soil/manual', payload)
      setReports([res.data, ...reports])
      setCurrentReport(res.data)
      setActiveTab('history')
    } catch (e) {
      alert('Submission failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (initLoading) return <DashboardLayout><PageLoadingState /></DashboardLayout>

  const TABS = [
    { id: 'upload',  label: 'Upload Report' },
    { id: 'manual',  label: 'Manual Entry'  },
    { id: 'history', label: `Reports (${reports.length})` },
  ]

  return (
    <DashboardLayout>
      <PageHeader
        title="Soil Health"
        subtitle="Upload soil test reports or enter parameters manually"
        icon={FlaskConical}
      />

      {/* Tabs */}
      <div className="flex bg-white border border-gray-200 rounded-lg p-1 w-fit mb-5">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === t.id
                ? 'bg-primary-700 text-white'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="max-w-3xl">
        {/* ── Upload ── */}
        {activeTab === 'upload' && (
          <div className="card">
            <h2 className="section-title mb-1">Upload Soil Test Report</h2>
            <p className="text-xs text-gray-500 mb-4">PDF or image of your verified soil test report. AI will extract NPK and pH values.</p>
            <div className="inline-alert-warning mb-5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <p className="text-xs">Upload a clear, well-lit photo or PDF. Blurry or low-quality images may reduce extraction accuracy.</p>
            </div>
            <form onSubmit={handleUpload}>
              <label className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl p-10 cursor-pointer transition-colors ${
                file ? 'border-primary-400 bg-primary-50/40' : 'border-gray-200 hover:border-primary-300 bg-gray-50/50'
              }`}>
                <FlaskConical className={`w-10 h-10 ${file ? 'text-primary-500' : 'text-gray-300'}`} />
                {file ? (
                  <div className="text-center">
                    <p className="text-sm font-semibold text-primary-700">{file.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{(file.size / 1024).toFixed(0)} KB · Click to change</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">Click to upload or drag & drop</p>
                    <p className="text-xs text-gray-400 mt-0.5">PDF or image up to 10 MB</p>
                  </div>
                )}
                <input
                  type="file" accept=".pdf,image/*"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </label>
              <button
                type="submit"
                disabled={!file || loading}
                className="btn-primary mt-4 w-full sm:w-auto"
              >
                {loading ? <><Spinner className="text-white" /> Processing...</> : <><FileUp className="w-4 h-4" /> Upload & Analyse</>}
              </button>
            </form>
          </div>
        )}

        {/* ── Manual Entry ── */}
        {activeTab === 'manual' && (
          <div className="card">
            <h2 className="section-title mb-1">Manual Parameter Entry</h2>
            <p className="text-xs text-gray-500 mb-4">Enter values directly from your soil test report.</p>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="label" htmlFor="nitrogen">Nitrogen (N) — kg/ha</label>
                  <input id="nitrogen" type="number" step="0.1" required className="input-field" placeholder="e.g. 180" value={manualParams.nitrogen} onChange={e => setManualParams({ ...manualParams, nitrogen: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="label" htmlFor="phosphorus">Phosphorus (P) — kg/ha</label>
                  <input id="phosphorus" type="number" step="0.1" required className="input-field" placeholder="e.g. 25" value={manualParams.phosphorus} onChange={e => setManualParams({ ...manualParams, phosphorus: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="label" htmlFor="potassium">Potassium (K) — kg/ha</label>
                  <input id="potassium" type="number" step="0.1" required className="input-field" placeholder="e.g. 120" value={manualParams.potassium} onChange={e => setManualParams({ ...manualParams, potassium: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="label" htmlFor="ph">Soil pH</label>
                  <input id="ph" type="number" step="0.1" min="0" max="14" required className="input-field" placeholder="e.g. 6.8" value={manualParams.ph} onChange={e => setManualParams({ ...manualParams, ph: e.target.value })} />
                </div>
              </div>
              <div className="pt-1 flex items-center gap-3">
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? <><Spinner className="text-white" /> Saving...</> : <><Check className="w-4 h-4" /> Save Parameters</>}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── History / Current Report ── */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {!currentReport ? (
              <EmptyState
                icon={FlaskConical}
                title="No soil reports yet"
                description="Upload your soil test report or enter parameters manually to get started."
                action={
                  <button onClick={() => setActiveTab('upload')} className="btn-primary">
                    Upload Report
                  </button>
                }
              />
            ) : (
              <div className="space-y-4">
                {/* Parameter grid */}
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="section-title">Latest Soil Analysis</h2>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {currentReport.report_type === 'manual' ? 'Manual entry' : 'AI extraction'}
                        {' · '}
                        {new Date(currentReport.uploaded_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <FlaskConical className="w-5 h-5 text-primary-500" />
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {currentReport.parameters.map((p) => {
                      const interp = interpretParam(p.parameter_name, p.value)
                      const isPh = p.parameter_name.includes('pH')
                      return (
                        <div key={p.parameter_name} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                          <p className="label-sm text-gray-500 mb-1">{p.parameter_name}</p>
                          <div className="flex items-baseline gap-1 mb-2">
                            <span className="text-2xl font-bold text-gray-900">{p.value !== null ? p.value : 'N/A'}</span>
                            {p.unit && <span className="text-xs text-gray-400">{p.unit}</span>}
                          </div>
                          <span className={STATUS_COLORS[interp.status] || 'badge-neutral'}>
                            {interp.label}
                          </span>
                          {isPh && <PhBar value={p.value} />}
                          {interp.hint && (
                            <p className="text-[11px] text-gray-400 mt-1.5">{interp.hint}</p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Interpretation Banner */}
                <div className="card border-l-4 border-l-blue-400">
                  <div className="flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-800 mb-1.5">What this means for your farm</p>
                      <ul className="space-y-1 text-xs text-gray-600">
                        {currentReport.parameters.map((p) => {
                          const interp = interpretParam(p.parameter_name, p.value)
                          return interp.hint ? (
                            <li key={p.parameter_name} className="flex items-start gap-1.5">
                              <span className="text-blue-400 shrink-0">·</span>
                              <span><strong>{p.parameter_name}:</strong> {interp.hint}</span>
                            </li>
                          ) : null
                        })}
                      </ul>
                      <p className="text-[11px] text-gray-400 mt-3">
                        Interpretation is based on standard agricultural guidelines. Consult an agronomist for region-specific recommendations.
                      </p>
                    </div>
                  </div>
                </div>

                {/* History list */}
                {reports.length > 1 && (
                  <div className="card">
                    <h3 className="section-title mb-3">Report History</h3>
                    <div className="divide-y divide-gray-100">
                      {reports.map((r, i) => (
                        <button
                          key={r.id}
                          onClick={() => setCurrentReport(r)}
                          className={`w-full flex items-center gap-3 py-3 px-2 -mx-2 rounded-lg text-left hover:bg-gray-50 transition-colors ${currentReport?.id === r.id ? 'bg-primary-50' : ''}`}
                        >
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 text-xs font-bold shrink-0">
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 truncate">
                              {r.report_type === 'manual' ? 'Manual Entry' : 'AI Extraction'}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(r.uploaded_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                          </div>
                          {currentReport?.id === r.id && (
                            <span className="badge-primary">Current</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
