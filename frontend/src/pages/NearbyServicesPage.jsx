import { useState, useEffect } from 'react'
import { MapPin, Phone, ExternalLink, Building2 } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import { PageLoadingState } from '../components/LoadingState'
import api from '../utils/api'

const SERVICE_TYPES = ['All', 'Soil Testing', 'Government Office', 'Research Centre', 'Equipment Rental']

const TYPE_BADGE = {
  'Soil Testing':       'badge-warning',
  'Government Office':  'badge-info',
  'Research Centre':    'bg-purple-50 text-purple-700 border-purple-200 badge',
  'Equipment Rental':   'badge-success',
}

export default function NearbyServicesPage() {
  const [services,    setServices]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [activeFilter,setActiveFilter]= useState('All')

  useEffect(() => {
    api.get('/services/nearby')
      .then(r => setServices(r.data))
      .catch(e => console.error(e))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <DashboardLayout><PageLoadingState /></DashboardLayout>

  const filtered = activeFilter === 'All'
    ? services
    : services.filter(s => s.service_type === activeFilter)

  return (
    <DashboardLayout>
      <PageHeader
        title="Nearby Agricultural Services"
        subtitle="Verified soil labs, research centres, and farming support"
        icon={Building2}
      />

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {SERVICE_TYPES.map(type => (
          <button
            key={type}
            onClick={() => setActiveFilter(type)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
              activeFilter === type
                ? 'bg-primary-700 text-white border-primary-700'
                : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-700'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No services found"
          description={`No ${activeFilter} services are in the database.`}
        />
      ) : (
        <div className="max-w-3xl">
          <div className="card overflow-hidden p-0">
            <div className="divide-y divide-gray-100">
              {filtered.map(s => (
                <div key={s.id} className="flex items-start gap-4 p-4 hover:bg-gray-50/60 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className={TYPE_BADGE[s.service_type] || 'badge-neutral'}>
                            {s.service_type}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 text-sm">{s.name}</h3>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                      {s.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 shrink-0" /> {s.location}
                        </span>
                      )}
                      {s.contact && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 shrink-0" />
                          <a href={`tel:${s.contact}`} className="hover:text-primary-700 transition-colors">{s.contact}</a>
                        </span>
                      )}
                    </div>
                  </div>
                  {s.website && (
                    <a
                      href={s.website.startsWith('http') ? s.website : `https://${s.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 flex items-center gap-1 text-xs font-semibold text-primary-700 hover:text-primary-800 transition-colors"
                    >
                      Visit <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
