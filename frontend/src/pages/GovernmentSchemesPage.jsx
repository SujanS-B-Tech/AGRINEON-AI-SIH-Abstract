import { useState, useEffect } from 'react'
import { Landmark, ArrowRight, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import { PageLoadingState } from '../components/LoadingState'
import api from '../utils/api'

function SchemeRow({ scheme }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        className="w-full flex items-start gap-4 px-4 py-4 text-left hover:bg-gray-50/60 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
          <Landmark className="w-4.5 h-4.5 text-blue-600" style={{ width: '1.125rem', height: '1.125rem' }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="badge-info">{scheme.farmer_category}</span>
          </div>
          <p className="font-semibold text-gray-900 text-sm">{scheme.name}</p>
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{scheme.benefit}</p>
        </div>
        <div className="shrink-0 mt-1">
          {expanded
            ? <ChevronUp className="w-4 h-4 text-gray-400" />
            : <ChevronDown className="w-4 h-4 text-gray-400" />
          }
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-5 bg-gray-50/40 animate-slide-up">
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="label-sm mb-1">Who is eligible?</p>
              <p className="text-sm text-gray-700">{scheme.eligibility}</p>
            </div>
            <div>
              <p className="label-sm mb-1">How to apply</p>
              <p className="text-sm text-gray-700 flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                {scheme.application_info}
              </p>
            </div>
          </div>
          {scheme.official_source && (
            <a
              href={scheme.official_source}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-700 hover:text-primary-800 transition-colors"
            >
              Visit Official Portal <ArrowRight className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}
    </div>
  )
}

export default function GovernmentSchemesPage() {
  const [schemes, setSchemes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/services/schemes')
      .then(res => setSchemes(res.data))
      .catch(e => console.error(e))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <DashboardLayout><PageLoadingState /></DashboardLayout>

  return (
    <DashboardLayout>
      <PageHeader
        title="Government Schemes"
        subtitle="Accessible grants, subsidies, and support for farmers"
        icon={Landmark}
      />

      <div className="max-w-3xl space-y-5">
        {schemes.length === 0 ? (
          <EmptyState icon={Landmark} title="No schemes found" description="Government scheme data is not currently available." />
        ) : (
          <div className="card p-0 overflow-hidden">
            {schemes.map(s => <SchemeRow key={s.id} scheme={s} />)}
          </div>
        )}

        {/* CSC banner */}
        <div className="bg-gray-900 rounded-xl px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <p className="font-semibold text-white text-sm">Need help applying?</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Common Service Centres (CSC) can help you prepare documents and submit applications digitally.
            </p>
          </div>
          <button className="shrink-0 px-4 py-2 bg-white text-gray-900 font-semibold text-sm rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap">
            Find nearest CSC
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}
