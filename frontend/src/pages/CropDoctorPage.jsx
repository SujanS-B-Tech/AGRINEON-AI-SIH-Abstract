import { useState, useEffect } from 'react'
import { Upload, AlertTriangle, Stethoscope } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import StatusBadge from '../components/StatusBadge'
import api from '../utils/api'

export default function CropDoctorPage() {
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
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

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file || !farmData) return
    
    setPreview(URL.createObjectURL(file))
    setLoading(true)
    setResult(null)
    
    const formData = new FormData()
    formData.append('farm_id', farmData.id)
    formData.append('file', file)
    
    try {
      const res = await api.post('/disease/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setResult(res.data)
    } catch (e) {
      alert("Failed to analyze image. Ensure farm profile exists.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout title="AI Crop Doctor" subtitle="Upload crop images for disease detection">
      <div className="max-w-3xl space-y-6">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800">
            AI predictions are not medical/agricultural certainty. Always consult an agricultural expert for confirmation.
            Pesticide recommendations must follow official product label guidance.
          </p>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-4">Upload Crop Image</h3>
          <label className={`flex flex-col items-center border-2 border-dashed ${preview ? 'border-primary-200' : 'border-gray-300'} rounded-xl p-8 cursor-pointer hover:border-primary-400`}>
            {preview ? (
              <img src={preview} alt="Crop" className="max-h-64 rounded-lg object-cover" />
            ) : (
              <>
                <Upload className="w-10 h-10 text-gray-400 mb-3" />
                <p className="font-medium text-gray-600">Upload leaf, crop, or grain image</p>
                <p className="text-sm text-gray-400 mt-1">JPG, PNG up to 10MB</p>
              </>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={loading} />
          </label>
        </div>

        {loading && (
          <div className="card text-center py-8 border-t-4 border-t-primary-500">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-600 border-t-transparent mx-auto mb-3" />
            <p className="font-semibold text-gray-700">AI is Analyzing your crop image...</p>
            <p className="text-sm text-gray-500">Identifying disease patterns and solutions</p>
          </div>
        )}

        {result && (
          <div className="card space-y-4 border-t-4 border-t-green-500">
            <div className="flex items-center gap-3">
              <Stethoscope className="w-6 h-6 text-red-500" />
              <div>
                <h3 className="font-bold text-lg">{result.disease_name}</h3>
                <p className="text-sm text-gray-500">Confidence: {result.confidence}%</p>
              </div>
              {result.confidence >= 75 ? <StatusBadge status="High" /> : <StatusBadge status="Low" />}
            </div>

            {result.confidence < 75 && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm">
                Unable to confidently identify the issue. Please upload a clearer image or consult an agricultural expert.
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6 mt-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 text-gray-800 uppercase tracking-wider text-xs">Observed Symptoms</h4>
                  <ul className="space-y-1">
                    {result.symptoms.map((s, i) => <li key={i} className="text-sm text-gray-700 flex gap-2"><span className="text-amber-500">•</span>{s}</li>)}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-gray-800 uppercase tracking-wider text-xs">Prevention</h4>
                  <ul className="space-y-1">
                    {result.prevention.map((p, i) => <li key={i} className="text-sm text-gray-700 flex gap-2"><span className="text-green-500">✓</span>{p}</li>)}
                  </ul>
                </div>
              </div>
              
              <div className="bg-primary-50/50 p-4 rounded-xl border border-primary-100 h-fit">
                <h4 className="font-semibold mb-3 text-primary-800 uppercase tracking-wider text-xs">Recommended Action Plan</h4>
                <ul className="space-y-2">
                  {result.next_steps.map((n, i) => (
                    <li key={i} className="text-sm text-gray-800 flex gap-2 items-start">
                      <span className="w-5 h-5 rounded-full bg-primary-200 text-primary-700 flex items-center justify-center text-xs shrink-0 font-bold">{i+1}</span>
                      {n}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
