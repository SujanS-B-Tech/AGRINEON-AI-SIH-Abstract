import { useState, useEffect } from 'react'
import { Save, AlertCircle } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import api from '../utils/api'

export default function FarmProfilePage() {
  const [formData, setFormData] = useState({
    id: null,
    location: '',
    land_area: 0,
    soil_type: '',
    water_availability: 'Moderate',
    previous_crop: '',
    current_season: 'Kharif',
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  useEffect(() => {
    fetchFarmProfile()
  }, [])

  const fetchFarmProfile = async () => {
    try {
      setLoading(true)
      const res = await api.get('/farms/')
      if (res.data.length > 0) {
        setFormData(res.data[0]) // Select first farm
      }
    } catch (err) {
      console.error(err)
      setMessage({ text: 'Failed to load farm profile.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value
    setFormData({ ...formData, [e.target.name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage({ text: '', type: '' })
    
    try {
      if (formData.id) {
        await api.put(`/farms/${formData.id}`, formData)
      } else {
        const res = await api.post('/farms/', formData)
        setFormData(res.data)
      }
      setMessage({ text: 'Farm profile saved successfully!', type: 'success' })
    } catch (err) {
      setMessage({ text: 'Failed to save profile.', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <DashboardLayout title="Farm Profile"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 m-8" /></DashboardLayout>
  }

  return (
    <DashboardLayout title="Farm Profile" subtitle="Manage your land details for accurate AI recommendations">
      <div className="max-w-3xl">
        <div className="card">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {message.text && (
              <div className={`p-4 rounded-xl text-sm flex gap-3 items-start ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                {message.type === 'error' && <AlertCircle className="w-5 h-5 shrink-0" />}
                <span>{message.text}</span>
              </div>
            )}
            
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="label">Location / Village</label>
                <input
                  name="location"
                  type="text"
                  required
                  className="input-field"
                  value={formData.location || ''}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="label">Land Area (Acres)</label>
                <input
                  name="land_area"
                  type="number"
                  step="0.1"
                  required
                  className="input-field"
                  value={formData.land_area || 0}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="label">Soil Type</label>
                <select name="soil_type" className="input-field" value={formData.soil_type || ''} onChange={handleChange}>
                  <option value="">Select soil type...</option>
                  <option value="Alluvial">Alluvial (Vandal)</option>
                  <option value="Red Loam">Red Loam</option>
                  <option value="Black Cotton">Black Cotton</option>
                  <option value="Laterite">Laterite</option>
                  <option value="Sandy Loam">Sandy Loam</option>
                </select>
              </div>

              <div>
                <label className="label">Water Availability</label>
                <select name="water_availability" className="input-field" value={formData.water_availability || ''} onChange={handleChange}>
                  <option value="Abundant">Abundant (Canal/Borewell)</option>
                  <option value="Moderate">Moderate (Well/Tank)</option>
                  <option value="Scarce">Scarce (Limited supply)</option>
                  <option value="Rain-fed Only">Rain-fed Only</option>
                </select>
              </div>

              <div>
                <label className="label">Previous Season Crop</label>
                <input
                  name="previous_crop"
                  type="text"
                  className="input-field"
                  placeholder="e.g., Paddy, Cotton"
                  value={formData.previous_crop || ''}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="label">Current Upcoming Season</label>
                <select name="current_season" className="input-field" value={formData.current_season || ''} onChange={handleChange}>
                  <option value="Kharif">Kharif (June - Oct)</option>
                  <option value="Rabi">Rabi (Nov - Mar)</option>
                  <option value="Zaid">Zaid (Mar - June)</option>
                </select>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <button type="submit" disabled={saving} className="btn-primary w-full sm:w-auto">
                <Save className="w-5 h-5" />
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}
