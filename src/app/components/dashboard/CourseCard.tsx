import type { Enrolment } from '@/app/api/endpoints/enrolments'

interface Props {
  enrolment: Enrolment
}

function resolveLabel(
  obj: { fi?: string; en?: string; sv?: string } | undefined,
): string {
  return obj?.en ?? obj?.fi ?? obj?.sv ?? '—'
}

export function CourseCard({ enrolment }: Props) {
  const name = resolveLabel(enrolment.courseUnitRealisationName)
  const start = enrolment.activityPeriod?.startDate ?? enrolment.enrolmentRight?.validityPeriod?.startDate
  const end = enrolment.activityPeriod?.endDate ?? enrolment.enrolmentRight?.validityPeriod?.endDate
  const state = enrolment.processingState ?? enrolment.state

  return (
    <div style={{
      padding: 'var(--space-3) var(--space-4)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'baseline',
      gap: 'var(--space-3)',
    }}>
      <span style={{
        flex: 1,
        color: 'var(--text-primary)',
        fontSize: '13px',
        fontFamily: 'var(--font-body)',
      }}>
        {name}
      </span>
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        color: 'var(--text-tertiary)',
        whiteSpace: 'nowrap',
      }}>
        {start ? start.slice(0, 10) : ''}
        {end ? ` → ${end.slice(0, 10)}` : ''}
      </span>
      {state && (
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          color: 'var(--text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}>
          {state}
        </span>
      )}
    </div>
  )
}

export function CourseCardSkeleton() {
  return (
    <div style={{
      padding: 'var(--space-3) var(--space-4)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      gap: 'var(--space-3)',
    }}>
      <div className="skeleton" style={{ flex: 1, height: '16px', maxWidth: '280px' }} />
      <div className="skeleton" style={{ width: '120px', height: '16px' }} />
    </div>
  )
}
