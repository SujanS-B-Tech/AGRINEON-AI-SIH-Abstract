import { useState, useEffect } from 'react'
import { Upload, AlertTriangle, Stethoscope, ShieldAlert, User, CheckCircle2, ShieldCheck, FileText, Info } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import PageHeader from '../components/PageHeader'
import AnalysisSteps from '../components/AnalysisSteps'
import api from '../utils/api'

function buildSteps(progress) {
  return [
    { label: 'Image uploaded & received',         status: progress >= 1 ? 'done' : 'pending'  },
    { label: 'Checking file readability',         status: progress >= 2 ? 'done' : progress >= 1 ? 'active' : 'pending' },
    { label: 'Inferring from visual model',       status: progress >= 3 ? 'done' : progress >= 2 ? 'active' : 'pending' },
    { label: 'Evaluating prediction confidence',  status: progress >= 4 ? 'done' : progress >= 3 ? 'active' : 'pending' },
    { label: 'Retrieving Verified Knowledge',     status: progress >= 5 ? 'done' : progress >= 4 ? 'active' : 'pending' },
  ]
}

const SEVERITY_CLASS = {
  Low:                'badge-success',
  'Moderate to High': 'badge-warning',
  Moderate:           'badge-warning',
  High:               'badge-danger',
  Critical:           'badge-danger',
  Unknown:            'badge-neutral',
}

export default function CropDoctorPage() {
  const [preview, setPreview]     = useState(null)
  const [result, setResult]       = useState(null)
  const [analysing, setAnalysing] = useState(false)
  const [progress, setProgress]   = useState(0)
  const [farmData, setFarmData]   = useState(null)

  useEffect(() => { fetchFarmData() }, [])

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
    if (!file || !farmData) {
      if (!farmData) alert('Please set up your farm profile first so we have accurate crop context.')
      return
    }

    // Basic client validation (e.g., size)
    if (file.size > 10 * 1024 * 1024) {
      alert("Image is too large. Please upload an image smaller than 10MB.")
      return
    }

    setPreview(URL.createObjectURL(file))
    setAnalysing(true)
    setResult(null)
    setProgress(1)

    // Simulate progressive processing steps
    const stepTimings = [600, 1500, 2500, 3200]
    stepTimings.forEach((delay, i) => {
      setTimeout(() => setProgress(i + 2), delay)
    })

    const formData = new FormData()
    formData.append('farm_id', farmData.id)
    formData.append('file', file)

    try {
      const res = await api.post('/disease/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      
      // Delay strictly to allow the loading animation to reach 100% smoothly
      setTimeout(() => {
        setResult(res.data)
        setAnalysing(false)
      }, 3500)
    } catch (e) {
      alert('Failed to analyze image. Please ensure your backend ML server is running.')
      setAnalysing(false)
      setProgress(0)
    }
  }

  const isLowConfidence = result?.confidence_level === 'low'
  const isHealthy = result?.disease_name?.toLowerCase().includes("healthy")

  return (
    <DashboardLayout>
      <PageHeader
        title="Crop Doctor"
        subtitle="Upload a crop image for evidence-based AI disease diagnosis"
        icon={Stethoscope}
      />

      <div className="max-w-3xl space-y-5">
        
        {/* Context Strip */}
        <div className="card py-3 px-4 flex items-center justify-between text-sm bg-gray-50/50">
          <div className="flex gap-4">
            <span className="text-gray-500">Current Context:</span>
            <span className="font-semibold text-gray-900">{farmData?.current_crop || "Unknown Crop"}</span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-700">{farmData?.crop_stage || "Unknown Stage"}</span>
          </div>
          <button className="text-primary-600 text-xs font-semibold hover:underline">Edit Context</button>
        </div>

        {/* Upload zone */}
        <div className="card">
          <h2 className="section-title mb-1">Analyze Crop Image</h2>
          <p className="text-xs text-gray-400 mb-4">Leaf surface, affected area, or grain image — JPG / PNG up to 10 MB</p>

          <label className={`
            flex flex-col items-center gap-3 border-2 border-dashed rounded-xl cursor-pointer
            transition-all duration-150 overflow-hidden relative
            ${preview
              ? 'border-primary-400 p-2'
              : 'border-gray-200 hover:border-primary-300 bg-gray-50/60 p-10'}
          `}>
            {preview ? (
              <div className="w-full">
                <img src={preview} alt="Crop" className="w-full max-h-56 object-contain rounded-lg" />
                <p className="text-xs text-center text-gray-400 mt-2">Click to change image</p>
              </div>
            ) : (
              <>
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                  <Upload className="w-7 h-7 text-gray-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700">Click to upload or drag & drop</p>
                  <p className="text-xs text-gray-400 mt-0.5">Focus the camera closely on the affected area.</p>
                </div>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
              disabled={analysing}
            />
          </label>
        </div>

        {/* Analysis progress */}
        {analysing && (
          <div className="card animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center animate-pulse">
                <Stethoscope className="w-4 h-4 text-primary-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">Processing through ML Pipeline...</p>
                <p className="text-xs text-gray-400">Verifying symptoms against agricultural models</p>
              </div>
            </div>
            <AnalysisSteps steps={buildSteps(progress)} />
          </div>
        )}

        {/* Real ML Result */}
        {result && !analysing && (
          <div className="space-y-4 animate-slide-up">
            
            {/* Assessment Banner */}
            <div className={`card border-l-4 ${isLowConfidence ? 'border-l-amber-500' : 'border-l-primary-600'}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="label-sm text-gray-400">AI Assessment</span>
                    {result.sources?.length > 0 && (
                      <span className="badge-neutral text-[10px] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Source Verified
                      </span>
                    )}
                  </div>
                  
                  <h2 className="text-xl font-bold text-gray-900">{result.disease_name}</h2>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1.5" title="Model Score represents the literal Softmax probability of the inference engine.">
                      <span className="text-xs text-gray-500">Model Score:</span>
                      <span className={`text-sm font-bold ${!isLowConfidence ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {Math.round(result.confidence * 100)}%
                      </span>
                    </div>
                    <span className="text-gray-300">·</span>
                    <span className={SEVERITY_CLASS[result.severity] || 'badge-neutral'}>
                      Severity: {result.severity || 'Unknown'}
                    </span>
                  </div>
                </div>
                
                {isHealthy ? (
                  <ShieldCheck className="w-8 h-8 text-emerald-500 shrink-0" />
                ) : isLowConfidence ? (
                  <AlertTriangle className="w-8 h-8 text-amber-500 shrink-0" />
                ) : (
                  <Stethoscope className="w-8 h-8 text-primary-600 shrink-0" />
                )}
              </div>

              {/* Low Confidence Warning */}
              {isLowConfidence && (
                <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200 text-sm flex gap-3">
                  <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-900">Low Confidence Warning</p>
                    <p className="text-amber-800 text-xs mt-0.5">
                      The image does not provide enough evidence for a reliable diagnosis. A classifier confidence score alone does not prove that the uploaded image contains a recognizable plant pattern. Please upload a clearer image.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Why This Result (Evidence) */}
            {!isHealthy && (
              <div className="card">
                <h3 className="section-title mb-3">Why this result?</h3>
                <p className="text-xs text-gray-400 mb-3">Symptoms typical of this diagnosis:</p>
                <ul className="space-y-2">
                  {result.symptoms?.length > 0 ? result.symptoms.map((s, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                      <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">{i+1}</span>
                      {s}
                    </li>
                  )) : (
                    <li className="text-sm text-gray-500 italic">No specific symptomatic evidence mapped.</li>
                  )}
                </ul>
              </div>
            )}

            {/* Recommendations Grid */}
            {!isHealthy && !isLowConfidence && (
              <div className="grid md:grid-cols-2 gap-4">
                
                {/* Cultural/Preventive */}
                <div className="card">
                  <h3 className="section-title mb-3 flex gap-2 items-center">
                     Prevention & Cultural
                  </h3>
                  <ul className="space-y-2">
                    {result.prevention?.map((p, i) => (
                      <li key={i} className="text-sm text-gray-700 flex gap-2 items-start">
                        <span className="text-emerald-500 mt-0.5 shrink-0">✓</span> {p}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Management Action Plan */}
                <div className="card bg-primary-50/40 border-primary-200">
                  <h3 className="section-title text-primary-800 mb-3">Management Steps</h3>
                  <ol className="space-y-2">
                    {result.next_steps?.map((n, i) => (
                      <li key={i} className="text-sm text-gray-800 flex gap-2.5 items-start">
                        <span className="w-5 h-5 rounded-full bg-primary-200 text-primary-800 flex items-center justify-center text-xs font-bold shrink-0">{i+1}</span>
                        {n}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}

            {/* Crop Protection (Pesticide/Chemical) */}
            {!isHealthy && !isLowConfidence && (
              <div className="card border border-blue-100 bg-blue-50/20">
                <h3 className="section-title text-blue-900 mb-3 flex gap-2 items-center">
                   Verified Crop Protection Information
                </h3>
                {result.crop_protection?.length > 0 ? (
                  <ul className="space-y-2">
                    {result.crop_protection.map((chem, i) => (
                      <li key={i} className="text-sm text-gray-700 border-l-2 border-blue-300 pl-3 py-0.5">
                        {chem}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-600 italic">
                    Specific chemical treatment information could not be verified. Please consult the appropriate agricultural authority or official product label.
                  </p>
                )}
              </div>
            )}

            {/* Sources & Disclaimers */}
            <div className="pt-2 text-center space-y-2">
              {result.sources?.length > 0 && (
                <p className="text-xs text-gray-500">
                  <span className="font-semibold">Sources:</span> {result.sources.join(", ")}
                </p>
              )}
              {isLowConfidence && (
                <button className="btn-outline-sm gap-2 mt-4">
                  <User className="w-4 h-4" /> Consult Agricultural Expert
                </button>
              )}
            </div>

          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
