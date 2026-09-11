import { useState, useEffect } from 'react'
import { CheckCircle, Circle, AlertTriangle, CalendarDays, Clock, CheckCircle2 } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import { PageLoadingState } from '../components/LoadingState'
import api from '../utils/api'

// Lifecycle stepper
function LifecycleStepper({ stages, currentStageIdx }) {
  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex items-center gap-0 min-w-max">
        {stages.map((stage, i) => {
          const isPast    = i < currentStageIdx
          const isCurrent = i === currentStageIdx
          return (
            <div key={stage} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  isPast    ? 'bg-emerald-500 border-emerald-500 text-white' :
                  isCurrent ? 'bg-primary-700 border-primary-700 text-white ring-2 ring-primary-200 ring-offset-1' :
                              'bg-white border-gray-300 text-gray-400'
                }`}>
                  {isPast ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <p className={`text-[10px] mt-1.5 text-center max-w-[56px] ${
                  isCurrent ? 'font-bold text-primary-700' :
                  isPast    ? 'text-emerald-600 font-medium' : 'text-gray-400'
                }`}>
                  {stage}
                </p>
              </div>
              {i < stages.length - 1 && (
                <div className={`w-8 h-0.5 mx-1 mb-5 flex-shrink-0 ${isPast ? 'bg-emerald-400' : 'bg-gray-200'}`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function FarmingPlanPage() {
  const [loading,  setLoading]  = useState(true)
  const [plan,     setPlan]     = useState(null)
  const [farmData, setFarmData] = useState(null)
  const [showCompleted, setShowCompleted] = useState(false)

  useEffect(() => { fetchPlan() }, [])

  const fetchPlan = async () => {
    try {
      setLoading(true)
      const farmRes = await api.get('/farms/')
      if (farmRes.data.length > 0) {
        const f = farmRes.data[0]
        setFarmData(f)
        try {
          const planRes = await api.get(`/crop/plan/${f.id}`)
          setPlan(planRes.data)
        } catch (_) {}
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <DashboardLayout><PageLoadingState /></DashboardLayout>

  if (!plan) {
    return (
      <DashboardLayout>
        <PageHeader title="Farming Plan" subtitle="Daily task schedule for your crop lifecycle" icon={CalendarDays} />
        <EmptyState
          icon={CalendarDays}
          title="No active farming plan"
          description="Select a crop recommendation in the Crop Advisory section to generate a personalised farming schedule."
          action={
            <a href="/crop-advisory" className="btn-primary">Go to Crop Advisory</a>
          }
        />
      </DashboardLayout>
    )
  }

  const tasks          = plan.tasks || []
  const completedTasks = tasks.filter(t => t.completed)
  const pendingTasks   = tasks.filter(t => !t.completed)
  const today          = pendingTasks[0] || null
  const upcoming       = pendingTasks.slice(1, 6)

  const stages          = [...new Set(tasks.map(t => t.stage))]
  const currentStageIdx = today ? stages.indexOf(today.stage) : stages.length - 1

  return (
    <DashboardLayout>
      <PageHeader
        title={`${plan.crop_name} — Farming Plan`}
        subtitle={`Season: ${plan.season} · ${pendingTasks.length} tasks remaining`}
        icon={CalendarDays}
        badge={
          pendingTasks.length === 0
            ? <span className="badge-success">Cycle Complete</span>
            : <span className="badge-primary">{plan.current_stage || today?.stage || ''}</span>
        }
      />

      <div className="max-w-4xl space-y-5">
        {/* Lifecycle stepper */}
        <div className="card">
          <p className="label-sm mb-3 text-gray-400">Crop Lifecycle Progress</p>
          <LifecycleStepper stages={stages} currentStageIdx={currentStageIdx} />
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Today's task */}
          <div className="lg:col-span-1">
            {today ? (
              <div className="card border-l-4 border-l-primary-600 h-full">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-primary-600" />
                  <p className="label-sm text-primary-700">Today's Task</p>
                </div>
                <span className="badge-primary mb-2">{today.stage}</span>
                <p className="font-semibold text-gray-900 mb-2 text-sm">{today.task_description}</p>
                {today.alert && (
                  <div className="inline-alert-warning text-xs mt-3">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    {today.alert}
                  </div>
                )}
              </div>
            ) : (
              <div className="card border-l-4 border-l-emerald-500 flex flex-col items-center justify-center py-8 text-center h-full">
                <CheckCircle className="w-10 h-10 text-emerald-500 mb-2" />
                <p className="font-bold text-gray-800">All Tasks Complete</p>
                <p className="text-xs text-gray-400 mt-1">{plan.crop_name} lifecycle finished</p>
              </div>
            )}
          </div>

          {/* Upcoming & Completed */}
          <div className="lg:col-span-2 space-y-4">
            {/* Upcoming */}
            {upcoming.length > 0 && (
              <div className="card">
                <p className="label-sm text-gray-400 mb-3">Upcoming Tasks</p>
                <div className="divide-y divide-gray-100">
                  {upcoming.map((t) => (
                    <div key={t.id} className="flex items-start gap-3 py-3">
                      <Circle className="w-4 h-4 text-gray-300 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="badge-neutral text-[10px]">{t.stage}</span>
                          {t.scheduled_date && (
                            <span className="text-[11px] text-gray-400">
                              {new Date(t.scheduled_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 truncate">{t.task_description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed (collapsible) */}
            {completedTasks.length > 0 && (
              <div className="card">
                <button
                  onClick={() => setShowCompleted(!showCompleted)}
                  className="w-full flex items-center justify-between"
                >
                  <p className="label-sm text-gray-400">Completed ({completedTasks.length})</p>
                  <span className="text-xs text-gray-400">{showCompleted ? 'Hide' : 'Show'}</span>
                </button>
                {showCompleted && (
                  <div className="mt-3 divide-y divide-gray-100">
                    {completedTasks.map((t) => (
                      <div key={t.id} className="flex items-start gap-3 py-3 opacity-60">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase">{t.stage}</span>
                          <p className="text-xs text-gray-500 mt-0.5">{t.task_description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="inline-alert-info text-xs">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          Tasks are generated from standard crop lifecycle data and adjusted for your selected season. Consult local agricultural extension officers for region-specific timing.
        </div>
      </div>
    </DashboardLayout>
  )
}
