import { useState, useEffect } from 'react'
import { MapPin, Phone, ExternalLink, Leaf } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import api from '../utils/api'

const TYPE_COLORS = {
  'Soil Testing': 'bg-amber-100 text-amber-800',
  'Government Office': 'bg-blue-100 text-blue-800',
  'Research Centre': 'bg-purple-100 text-purple-800',
  'Equipment Rental': 'bg-green-100 text-green-800',
}

export default function NearbyServicesPage() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/services/nearby')
      .then(res => setServices(res.data))
      .catch(e => console.error(e))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <DashboardLayout><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 m-8" /></DashboardLayout>
  }

  return (
    <DashboardLayout title="Nearby Agricultural Services" subtitle="Validated soil labs, research centres, and farming support">
      <div className="space-y-4">
        <div className="grid lg:grid-cols-3 gap-6 mt-4">
          {services.map((s) => (
            <div key={s.id} className="card-hover">
              <div className="mb-4">
                <span className={`badge ${TYPE_COLORS[s.service_type] || 'badge-info'} mb-2`}>{s.service_type}</span>
                <h3 className="font-bold text-lg text-gray-900 leading-snug">{s.name}</h3>
              </div>
              
              <div className="space-y-3 mb-5">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" /> 
                  <span className="text-sm text-gray-700">{s.location || 'Location missing'}</span>
                </div>
                
                <div className="flex items-center gap-3 px-3">
                  <Phone className="w-5 h-5 text-primary-500 shrink-0" /> 
                  <span className="text-sm font-medium text-gray-800">{s.contact || 'No contact'}</span>
                </div>
              </div>
              
              {s.website ? (
                <a href={s.website.startsWith('http') ? s.website : `https://${s.website}`} target="_blank" rel="noopener noreferrer" className="w-full py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
                   Open Website <ExternalLink className="w-4 h-4" /> 
                </a>
              ) : (
                <div className="w-full py-2.5 bg-gray-50 text-gray-400 rounded-lg text-sm text-center font-medium">
                  No Website Available
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
