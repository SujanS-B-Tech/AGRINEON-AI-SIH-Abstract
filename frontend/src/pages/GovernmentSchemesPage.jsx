import { useState, useEffect } from 'react'
import { Landmark, ArrowRight, CheckCircle2 } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import api from '../utils/api'

export default function GovernmentSchemesPage() {
  const [schemes, setSchemes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/services/schemes')
      .then(res => setSchemes(res.data))
      .catch(e => console.error(e))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <DashboardLayout><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 m-8" /></DashboardLayout>
  }

  return (
    <DashboardLayout title="Government Schemes" subtitle="Accessible grants and subsidies for your farm">
      <div className="space-y-6 max-w-5xl">
        {schemes.map((s) => (
          <div key={s.id} className="card-hover">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                <Landmark className="w-8 h-8" />
              </div>
              
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h3 className="font-bold text-xl text-gray-900">{s.name}</h3>
                  <span className="badge badge-success">{s.farmer_category}</span>
                </div>
                
                <p className="text-gray-700 font-medium mb-4">{s.benefit}</p>
                
                <div className="grid sm:grid-cols-2 gap-4 mb-5">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Who is eligible?</p>
                    <p className="text-sm text-gray-800">{s.eligibility}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">How to apply?</p>
                    <p className="text-sm text-gray-800 flex items-start gap-1"><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> {s.application_info}</p>
                  </div>
                </div>
                
                <a 
                  href={s.official_source} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-bold text-primary-600 hover:text-primary-700 bg-primary-50 px-4 py-2 rounded-lg transition-colors"
                >
                  Visit Official Portal <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        ))}

        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <h3 className="text-lg font-bold mb-1">Need help applying?</h3>
            <p className="text-gray-300 text-sm">Our experts at the nearest Common Service Centre can help you prepare documents and submit applications digitally.</p>
          </div>
          <button className="bg-white text-gray-900 px-5 py-2.5 rounded-lg text-sm font-bold whitespace-nowrap hover:bg-gray-100">
            Find nearest CSC
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}
