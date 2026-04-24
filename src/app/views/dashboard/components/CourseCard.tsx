import { ResolvedEnrolment } from '@/app/api/resolvers';

interface Props {
  enrolment: ResolvedEnrolment;
}

export function CourseCard({ enrolment }: Props) {
  return (
    <div
      style={{
        padding: 'var(--space-3) var(--space-4)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'baseline',
        gap: 'var(--space-3)',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-1)',
          flexDirection: 'column',
        }}
      >
        <span
          style={{
            flex: 1,
            color: 'var(--text-primary)',
            fontSize: '13px',
            fontFamily: 'var(--font-body)',
          }}
        >
          {enrolment.courseName}
        </span>
        <span
          style={{
            flex: 1,
            color: 'var(--text-primary)',
            fontSize: '11px',
            fontFamily: 'var(--font-body)',
          }}
        >
          {enrolment.courseCode} ({enrolment.credits}cr)
        </span>
      </div>
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--text-tertiary)',
          whiteSpace: 'nowrap',
          marginLeft: 'auto',
        }}
      >
        {enrolment.startDate}
        {` → ${enrolment.endDate}`}
      </span>
      {enrolment.status && (
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            color: 'var(--text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          {enrolment.status}
        </span>
      )}
    </div>
  );
}

export function CourseCardSkeleton() {
  return (
    <div
      style={{
        padding: 'var(--space-3) var(--space-4)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        gap: 'var(--space-3)',
      }}
    >
      <div className="skeleton" style={{ flex: 1, height: '16px', maxWidth: '280px' }} />
      <div className="skeleton" style={{ width: '120px', height: '16px' }} />
    </div>
  );
}
