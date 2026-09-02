import { useState, useEffect } from 'react'
import { FileUp, TrendingUp, FlaskConical, AlertTriangle } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import StatusBadge from '../components/StatusBadge'
import api from '../utils/api'

export default function SoilReportPage() {
  const [activeTab, setActiveTab] = useState('upload') // upload, manual, history
  const [file, setFile] = useState(null)
  const [farmId, setFarmId] = useState(null)
  
  const [manualParams, setManualParams] = useState({
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    ph: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [reports, setReports] = useState([])
  const [currentReport, setCurrentReport] = useState(null)

  useEffect(() => {
    fetchFarmAndReports()
  }, [])

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
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      const newReport = res.data
      setReports([newReport, ...reports])
      setCurrentReport(newReport)
      setActiveTab('history')
      setFile(null)
    } catch (e) {
      alert('Upload failed')
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
        { parameter_name: "Nitrogen (N)", value: parseFloat(manualParams.nitrogen), unit: "kg/ha" },
        { parameter_name: "Phosphorus (P)", value: parseFloat(manualParams.phosphorus), unit: "kg/ha" },
        { parameter_name: "Potassium (K)", value: parseFloat(manualParams.potassium), unit: "kg/ha" },
        { parameter_name: "pH", value: parseFloat(manualParams.ph), unit: "" }
      ]
    }
    
    try {
      const res = await api.post('/soil/manual', payload)
      const newReport = res.data
      setReports([newReport, ...reports])
      setCurrentReport(newReport)
      setActiveTab('history')
    } catch (e) {
      alert('Submission failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout title="Soil Intelligence" subtitle="Upload soil test reports or enter parameters manually">
      <div className="space-y-6">
        <div className="flex bg-white rounded-xl border border-gray-200 p-1 w-max">
          <button onClick={() => setActiveTab('upload')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'upload' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}>Upload Report</button>
          <button onClick={() => setActiveTab('manual')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'manual' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}>Manual Entry</button>
          <button onClick={() => setActiveTab('history')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'history' ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}>My Reports ({reports.length})</button>
        </div>

        {activeTab === 'upload' && (
          <div className="max-w-2xl card border-dashed border-2 border-primary-200 bg-primary-50/30">
            <h3 className="font-semibold text-lg mb-4">Upload Soil Test Report (PDF/Image)</h3>
            <div className="bg-amber-50 text-amber-800 p-3 rounded-lg text-sm flex gap-2 mb-6">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              Upload a clear photo or PDF of your verified soil test report. Our AI will extract the NPK and pH values automatically.
            </div>
            <form onSubmit={handleUpload} className="space-y-6 text-center py-6">
              <FlaskConical className="w-16 h-16 text-primary-400 mx-auto mb-4" />
              <input type="file" accept=".pdf,image/*" onChange={(e) => setFile(e.target.files[0])} className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 mx-auto max-w-sm" />
              <button disabled={!file || loading} className="btn-primary w-full max-w-sm mx-auto">
                <FileUp className="w-5 h-5" /> {loading ? 'Processing...' : 'Upload & Analyze AI'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'manual' && (
          <div className="max-w-2xl card">
            <h3 className="font-semibold text-lg mb-4">Manual Parameter Entry</h3>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className="label">Nitrogen (N) kg/ha</label><input type="number" step="0.1" required className="input-field" value={manualParams.nitrogen} onChange={e => setManualParams({...manualParams, nitrogen: e.target.value})} /></div>
                <div><label className="label">Phosphorus (P) kg/ha</label><input type="number" step="0.1" required className="input-field" value={manualParams.phosphorus} onChange={e => setManualParams({...manualParams, phosphorus: e.target.value})} /></div>
                <div><label className="label">Potassium (K) kg/ha</label><input type="number" step="0.1" required className="input-field" value={manualParams.potassium} onChange={e => setManualParams({...manualParams, potassium: e.target.value})} /></div>
                <div><label className="label">pH Level</label><input type="number" step="0.1" required className="input-field" value={manualParams.ph} onChange={e => setManualParams({...manualParams, ph: e.target.value})} /></div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary mt-4 w-full sm:w-auto">{loading ? 'Saving...' : 'Save Parameters'}</button>
            </form>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="max-w-4xl space-y-6">
            {!currentReport ? (
              <div className="card text-center py-10 text-gray-500">No soil reports available. Upload or enter manually.</div>
            ) : (
              <div className="card border-l-4 border-l-primary-500">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">Latest Soil Analysis</h3>
                    <p className="text-sm text-gray-500">Source: {currentReport.report_type === 'manual' ? 'Manual Entry' : 'AI Extraction'} · Date: {new Date(currentReport.uploaded_at).toLocaleDateString()}</p>
                  </div>
                  <FlaskConical className="w-8 h-8 text-primary-500" />
                </div>
                
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {currentReport.parameters.map((p) => (
                    <div key={p.parameter_name} className="border border-gray-100 rounded-xl p-4 bg-gray-50">
                      <p className="text-sm text-gray-500 font-medium mb-1">{p.parameter_name}</p>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-2xl font-bold text-gray-900">{p.value}</span>
                        <span className="text-sm text-gray-500">{p.unit}</span>
                      </div>
                      <StatusBadge status={p.status || 'Info'} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
