import { Check, Loader2 } from 'lucide-react'

/**
 * Progressive analysis steps for AI workflows (CropDoctor, etc.)
 *
 * steps: Array<{ label: string, status: 'done' | 'active' | 'pending' }>
 */
export default function AnalysisSteps({ steps }) {
  return (
    <div className="space-y-2">
      {steps.map((step, i) => (
        <div key={i} className="step-row">
          {step.status === 'done' ? (
            <span className="step-icon-done animate-step-check">
              <Check className="w-3.5 h-3.5" />
            </span>
          ) : step.status === 'active' ? (
            <span className="step-icon-active">
              <Loader2 className="w-3.5 h-3.5 text-primary-600 animate-spin" />
            </span>
          ) : (
            <span className="step-icon-pending" />
          )}
          <span className={
            step.status === 'done'    ? 'text-gray-700 font-medium'
            : step.status === 'active'  ? 'text-primary-700 font-semibold'
            : 'text-gray-400'
          }>
            {step.label}
          </span>
        </div>
      ))}
    </div>
  )
}
