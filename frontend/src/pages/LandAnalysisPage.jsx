import { useState } from 'react'
import { Upload, Map, Sparkles, Check, ArrowRight } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import api from '../utils/api'
import { useNavigate } from 'react-router-dom'

const SOIL_TYPES = [
  'Alluvial (Vandal)',
  'Red Loam',
  'Black Cotton',
  'Laterite',
  'Sandy Loam'
]

const WATER_OPTIONS = [
  'Abundant (Canal/Borewell)',
  'Moderate (Well/Tank)',
  'Scarce (Limited supply)',
  'Rain-fed Only'
]

const SEASONS = ['Kharif', 'Rabi', 'Zaid']

export default function LandAnalysisPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: Upload, 2: Analyzing, 3: Results
  const [image, setImage] = useState(null)
  
  // Scraped data state
  const [extractedData, setExtractedData] = useState({
    location: '',
    land_area: 2.5,
    soil_type: '',
    water_availability: '',
    current_season: 'Kharif'
  })

  const [saving, setSaving] = useState(false)

  const handleUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    // Simulate AI extraction phase for demo
    setImage(URL.createObjectURL(file))
    setStep(2)
    
    setTimeout(() => {
      setExtractedData({
        location: 'Detected from GPS: Thanjavur District',
        land_area: 2.5,
        soil_type: 'Alluvial (Vandal)',
        water_availability: 'Moderate (Well/Tank)',
        current_season: 'Kharif'
      })
      setStep(3)
    }, 2500)
  }

  const handleCreateProfile = async () => {
    setSaving(true)
    try {
      // Real backend integration: create farm profile based on extracted data
      const payload = {
        location: extractedData.location.replace('Detected from GPS: ', ''),
        land_area: parseFloat(extractedData.land_area) || 1.0,
        soil_type: extractedData.soil_type === 'Alluvial (Vandal)' ? 'Alluvial' : extractedData.soil_type,
        water_availability: extractedData.water_availability === 'Moderate (Well/Tank)' ? 'Moderate' : 'Moderate',
        current_season: extractedData.current_season,
        previous_crop: 'Unknown'
      }
      
      await api.post('/farms/', payload)
      alert("Farm profile successfully created from analysis.")
      navigate('/farm-profile')
    } catch (e) {
      console.error(e)
      alert("Failed to save profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout title="Land Suitability Analysis" subtitle="Upload satellite imagery or field photos for AI extraction">
      <div className="max-w-4xl space-y-6">
        
        {step === 1 && (
          <div className="card text-center py-16 px-4 border-2 border-dashed border-primary-200">
            <Map className="w-16 h-16 text-primary-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Upload Field Image</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Upload a satellite screenshot or wide field photo. Our Vision AI will estimate boundaries and detect soil conditions.
            </p>
            
            <label className="btn-primary max-w-sm mx-auto cursor-pointer">
              <Upload className="w-5 h-5" /> Select Image
              <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            </label>
          </div>
        )}

        {step === 2 && (
          <div className="card text-center py-16">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 bg-primary-200 rounded-full animate-ping opacity-75"></div>
              <div className="relative bg-primary-600 rounded-full w-24 h-24 flex items-center justify-center text-white">
                <Sparkles className="w-10 h-10 animate-pulse" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">AI is analyzing topography...</h3>
            <p className="text-gray-500">Extracting geographical data and soil texture estimations.</p>
          </div>
        )}

        {step === 3 && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card bg-gray-50">
              <h3 className="font-semibold mb-4 text-gray-800">Uploaded Image</h3>
              {image && <img src={image} alt="Field" className="w-full h-64 object-cover rounded-xl shadow-sm border border-gray-200" />}
            </div>
            
            <div className="card">
              <h3 className="font-semibold mb-4 text-primary-800 flex items-center gap-2">
                <Check className="w-5 h-5" /> Data Extracted Successfully
              </h3>
              
              <div className="space-y-4 mb-8">
                <div>
                  <label className="label">Detected Location</label>
                  <input type="text" className="input-field bg-green-50/50" value={extractedData.location} onChange={e => setExtractedData({...extractedData, location: e.target.value})} />
                </div>
                
                <div>
                  <label className="label">Estimated Area (Acres)</label>
                  <input type="number" step="0.1" className="input-field bg-green-50/50" value={extractedData.land_area} onChange={e => setExtractedData({...extractedData, land_area: e.target.value})} />
                </div>

                <div>
                  <label className="label">Predicted Soil Type</label>
                  <select className="input-field bg-green-50/50" value={extractedData.soil_type} onChange={e => setExtractedData({...extractedData, soil_type: e.target.value})}>
                    {SOIL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="label">Assumed Water Condition</label>
                  <select className="input-field bg-green-50/50" value={extractedData.water_availability} onChange={e => setExtractedData({...extractedData, water_availability: e.target.value})}>
                    {WATER_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              
              <button 
                onClick={handleCreateProfile} 
                disabled={saving}
                className="w-full btn-primary"
              >
                {saving ? 'Creating Profile...' : <><Map className="w-5 h-5" /> Create Farm Profile from Data</>}
              </button>
              
              <button onClick={() => {setStep(1); setImage(null)}} className="w-full mt-3 text-sm text-gray-500 font-medium hover:text-gray-800 py-2">
                Upload different image
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
