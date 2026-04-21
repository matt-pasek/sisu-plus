import type { Plan } from '@/app/api/endpoints/plans'
import type { Education } from '@/app/api/endpoints/educations'

interface Props {
  plans: Plan[]
  educations: Education[]
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  return (
    <div style={{
      height: '3px',
      background: 'var(--bg-elevated)',
      borderRadius: '2px',
      overflow: 'hidden',
      marginTop: 'var(--space-1)',
    }}>
      <div style={{
        height: '100%',
        width: `${pct}%`,
        background: 'var(--accent)',
        borderRadius: '2px',
        transition: 'width 0.4s ease',
      }} />
    </div>
  )
}

function CreditRow({ label, completed, target }: { label: string; completed: number; target: number }) {
  return (
    <div style={{ marginBottom: 'var(--space-3)' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 'var(--space-1)',
      }}>
        <span style={{ color: 'var(--text-secondary)', fontSize: '12px', fontFamily: 'var(--font-body)' }}>
          {label}
        </span>
        <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
          {completed} <span style={{ color: 'var(--text-tertiary)' }}>/ {target} cr</span>
        </span>
      </div>
      <ProgressBar value={completed} max={target} />
    </div>
  )
}

export function ProgressWidget({ plans, educations }: Props) {
  const primaryPlan = plans.find((p) => p.primary) ?? plans[0]
  const primaryEd = educations[0]

  return (
    <div style={{ padding: 'var(--space-4)' }}>
      {primaryEd && (
        <div style={{ marginBottom: 'var(--space-3)' }}>
          <p style={{
            fontSize: '12px',
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-body)',
            marginBottom: 'var(--space-3)',
          }}>
            {primaryEd.name?.en ?? primaryEd.name?.fi ?? '—'}
          </p>
          {primaryEd.targetCredits?.max != null && (
            <CreditRow
              label="Degree progress"
              completed={primaryPlan?.completedCredits ?? 0}
              target={primaryEd.targetCredits.max}
            />
          )}
        </div>
      )}
      {primaryPlan && primaryPlan.targetCredits && (
        <CreditRow
          label="Study plan"
          completed={primaryPlan.completedCredits ?? 0}
          target={primaryPlan.targetCredits.max ?? primaryPlan.targetCredits.min ?? 0}
        />
      )}
      {!primaryPlan && !primaryEd && (
        <p style={{ color: 'var(--text-tertiary)', fontSize: '12px', fontFamily: 'var(--font-body)' }}>
          No plan data available
        </p>
      )}
    </div>
  )
}

export function ProgressWidgetSkeleton() {
  return (
    <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      <div className="skeleton" style={{ height: '14px', width: '60%' }} />
      <div className="skeleton" style={{ height: '3px' }} />
      <div className="skeleton" style={{ height: '14px', width: '40%' }} />
      <div className="skeleton" style={{ height: '3px' }} />
    </div>
  )
}
