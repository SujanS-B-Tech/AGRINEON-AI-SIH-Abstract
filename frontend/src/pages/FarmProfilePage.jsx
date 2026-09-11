import { useState, useEffect } from 'react'
import { Save, AlertCircle, Check, MapPin, Sprout, Droplets, FlaskConical } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import PageHeader from '../components/PageHeader'
import { Spinner, PageLoadingState } from '../components/LoadingState'
import api from '../utils/api'

// Profile completeness calculator
function calcCompleteness(form) {
  const fields = [
    form.location,
    form.land_area > 0,
    form.soil_type,
    form.water_availability,
    form.current_season,
  ]
  const done = fields.filter(Boolean).length
  return { done, total: fields.length, pct: Math.round((done / fields.length) * 100) }
}

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

  const [loading, setLoading]   = useState(true)
  const [saving,  setSaving]    = useState(false)
  const [message, setMessage]   = useState({ text: '', type: '' })

  useEffect(() => { fetchFarmProfile() }, [])

  const fetchFarmProfile = async () => {
    try {
      setLoading(true)
      const res = await api.get('/farms/')
      if (res.data.length > 0) setFormData(res.data[0])
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
      setMessage({ text: 'Failed to save profile. Please try again.', type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <DashboardLayout><PageLoadingState /></DashboardLayout>
  }

  const { done, total, pct } = calcCompleteness(formData)

  return (
    <DashboardLayout>
      <PageHeader
        title="Farm Profile"
        subtitle="Manage your land details for accurate AI recommendations"
        icon={MapPin}
      />

      <div className="max-w-2xl space-y-5">
        {/* Completeness indicator */}
        <div className="card-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">Profile completeness</p>
            <span className="text-sm font-bold text-primary-700">{done}/{total} sections</span>
          </div>
          <div className="risk-bar-track">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                backgroundColor: pct === 100 ? '#059669' : pct >= 60 ? '#15803d' : '#f59e0b',
              }}
            />
          </div>
          {pct === 100 && (
            <p className="text-xs text-emerald-600 font-medium mt-1.5 flex items-center gap-1">
              <Check className="w-3 h-3" /> All sections complete — best recommendations available
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {message.text && (
            <div className={message.type === 'error' ? 'inline-alert-error' : 'inline-alert-success'}>
              {message.type === 'error'
                ? <AlertCircle className="w-4 h-4 shrink-0" />
                : <Check className="w-4 h-4 shrink-0" />}
              <span className="text-sm">{message.text}</span>
            </div>
          )}

          {/* Farm Details */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-primary-600" />
              <p className="label-sm">Farm Details</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="label" htmlFor="location">Location / Village</label>
                <input
                  id="location" name="location" type="text" required
                  className="input-field"
                  placeholder="Block, District, State"
                  value={formData.location || ''}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="label" htmlFor="land_area">Land Area (Acres)</label>
                <input
                  id="land_area" name="land_area" type="number" step="0.1" min="0.1" required
                  className="input-field"
                  placeholder="2.5"
                  value={formData.land_area || ''}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Crop & Season */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <Sprout className="w-4 h-4 text-primary-600" />
              <p className="label-sm">Crop & Season</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="label" htmlFor="current_season">Current / Upcoming Season</label>
                <select id="current_season" name="current_season" className="select-field" value={formData.current_season || ''} onChange={handleChange}>
                  <option value="Kharif">Kharif (June – Oct)</option>
                  <option value="Rabi">Rabi (Nov – Mar)</option>
                  <option value="Zaid">Zaid (Mar – June)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="label" htmlFor="previous_crop">Previous Season Crop</label>
                <input
                  id="previous_crop" name="previous_crop" type="text"
                  className="input-field"
                  placeholder="e.g. Paddy, Cotton"
                  value={formData.previous_crop || ''}
                  onChange={handleChange}
                />
                <p className="form-hint">Helps AI avoid crop rotation issues</p>
              </div>
            </div>
          </div>

          {/* Soil & Water */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <FlaskConical className="w-4 h-4 text-primary-600" />
              <p className="label-sm">Soil & Water</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="label" htmlFor="soil_type">Soil Type</label>
                <select id="soil_type" name="soil_type" className="select-field" value={formData.soil_type || ''} onChange={handleChange}>
                  <option value="">Select soil type...</option>
                  <option value="Alluvial">Alluvial (Vandal)</option>
                  <option value="Red Loam">Red Loam</option>
                  <option value="Black Cotton">Black Cotton</option>
                  <option value="Laterite">Laterite</option>
                  <option value="Sandy Loam">Sandy Loam</option>
                </select>
              </div>
              <div className="form-group">
                <label className="label" htmlFor="water_availability">Water Availability</label>
                <select id="water_availability" name="water_availability" className="select-field" value={formData.water_availability || ''} onChange={handleChange}>
                  <option value="Abundant">Abundant (Canal / Borewell)</option>
                  <option value="Moderate">Moderate (Well / Tank)</option>
                  <option value="Scarce">Scarce (Limited supply)</option>
                  <option value="Rain-fed Only">Rain-fed Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Save */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? (
                <><Spinner className="text-white" /> Saving...</>
              ) : (
                <><Save className="w-4 h-4" /> Save Profile</>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
