import { useState, useEffect } from 'react'
import { CheckCircle, Circle, AlertTriangle, Clock } from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import api from '../utils/api'

export default function FarmingPlanPage() {
  const [loading, setLoading] = useState(true)
  const [plan, setPlan] = useState(null)
  const [farmData, setFarmData] = useState(null)

  useEffect(() => {
    fetchPlan()
  }, [])

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
        } catch (e) {
          // No plan exists
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <DashboardLayout><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 m-8" /></DashboardLayout>
  }

  if (!plan) {
    return (
      <DashboardLayout title="Daily Farming Plan" subtitle="Crop lifecycle timeline and tasks">
        <div className="card text-center py-16">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">No Active Farming Plan</h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-6">Select a crop in the AI Crop Advisory page to generate a daily farming schedule.</p>
        </div>
      </DashboardLayout>
    )
  }

  const tasks = plan.tasks || []
  const completedTasks = tasks.filter(t => t.completed)
  const pendingTasks = tasks.filter(t => !t.completed)
  const today = pendingTasks.length > 0 ? pendingTasks[0] : null
  const upcoming = pendingTasks.length > 1 ? pendingTasks[1] : null

  // Collect all unique stages for timeline
  const stages = [...new Set(tasks.map(t => t.stage))]
  const currentStageIdx = today ? stages.indexOf(today.stage) : stages.length - 1

  return (
    <DashboardLayout title={`${plan.crop_name} Farming Plan`} subtitle={`Season: ${plan.season} · Current phase: ${plan.current_stage || today?.stage || 'Completed'}`}>
      <div className="space-y-6">
        {/* Lifecycle timeline */}
        <div className="card overflow-x-auto">
          <h3 className="font-semibold mb-4">Lifecycle Timeline</h3>
          <div className="flex gap-2 min-w-max pb-2">
            {stages.map((stage, i) => {
              const isPast = i < currentStageIdx
              const isCurrent = i === currentStageIdx && today
              return (
                <div key={stage} className="flex flex-col items-center min-w-[90px]">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    isPast ? 'bg-green-500 text-white' : isCurrent ? 'bg-primary-600 text-white ring-4 ring-primary-200' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {isPast ? '✓' : i + 1}
                  </div>
                  <p className={`text-xs mt-2 text-center max-w-[80px] break-words ${isCurrent ? 'font-bold text-primary-700' : 'text-gray-500'}`}>{stage}</p>
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Today's task */}
          {today ? (
            <div className="card border-l-4 border-l-primary-500 lg:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-primary-600" />
                <h3 className="font-semibold">Today's Active Task</h3>
              </div>
              <p className="text-sm font-bold text-primary-800 mb-1">{today.stage}</p>
              <p className="text-gray-800 mb-4">{today.task_description}</p>
              {today.alert && (
                <div className="bg-amber-50 text-amber-800 px-3 py-2 rounded-lg text-sm flex items-start gap-2 mb-4">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> {today.alert}
                </div>
              )}
              <button disabled className="btn-outline w-full border-primary-200 text-primary-700 opacity-50 cursor-not-allowed text-xs">
                Marking tasks completed is a PRO feature
              </button>
            </div>
          ) : (
            <div className="card border-l-4 border-l-green-500 flex flex-col justify-center items-center h-full text-center py-8 lg:col-span-1">
              <CheckCircle className="w-12 h-12 text-green-500 mb-3" />
              <h3 className="font-bold text-lg text-gray-800">All Tasks Completed!</h3>
              <p className="text-sm text-gray-500">Your {plan.crop_name} lifecycle has finished.</p>
            </div>
          )}

          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming */}
            {upcoming && (
              <div className="card border-l-4 border-l-blue-400 p-5">
                <h3 className="font-semibold mb-3 text-gray-600 text-sm uppercase tracking-wider">Next up...</h3>
                <p className="text-sm font-bold text-gray-800 mb-1">{upcoming.stage} · {new Date(upcoming.scheduled_date).toLocaleDateString()}</p>
                <p className="text-gray-600 text-sm">{upcoming.task_description}</p>
              </div>
            )}

            {/* Completed */}
            <div className="card p-5 border-l-4 border-l-gray-300">
              <h3 className="font-semibold mb-4 text-gray-600 text-sm uppercase tracking-wider">Past Completed Tasks</h3>
              {completedTasks.length > 0 ? (
                <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
                  {completedTasks.map((t) => (
                    <div key={t.id} className="flex items-start gap-3 opacity-70">
                      <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-800">{t.stage}</p>
                        <p className="text-xs text-gray-500 mt-1">{t.task_description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No tasks completed yet.</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
          Tasks are sourced from verified crop calendars and adapted to your {plan.season} season timeline. Always consult local agricultural extension officers for region-specific adjustments.
        </div>
      </div>
    </DashboardLayout>
  )
}
