import type { Attainment } from '@/app/api/endpoints/attainments';

interface Props {
  attainments: Attainment[];
}

export function AttainmentsWidget({ attainments }: Props) {
  if (attainments.length === 0) {
    return (
      <div style={{ padding: 'var(--space-4)', color: 'var(--text-tertiary)', fontSize: '12px' }}>
        No attainments found
      </div>
    );
  }

  return (
    <div>
      {attainments.map((a, i) => (
        <div
          key={a.id ?? i}
          style={{
            padding: 'var(--space-3) var(--space-4)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'baseline',
            gap: 'var(--space-3)',
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
            {a.courseUnitId}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--text-secondary)',
              whiteSpace: 'nowrap',
            }}
          >
            {a.credits != null ? `${a.credits} cr` : ''}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: 'var(--accent)',
              minWidth: '16px',
              textAlign: 'right',
            }}
          >
            {a.gradeAverage?.value}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--text-tertiary)',
              whiteSpace: 'nowrap',
            }}
          >
            {a.attainmentDate ? a.attainmentDate.slice(0, 10) : ''}
          </span>
        </div>
      ))}
    </div>
  );
}

export function AttainmentsWidgetSkeleton() {
  return (
    <div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          style={{
            padding: 'var(--space-3) var(--space-4)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            gap: 'var(--space-3)',
          }}
        >
          <div className="skeleton" style={{ flex: 1, height: '16px', maxWidth: '240px' }} />
          <div className="skeleton" style={{ width: '40px', height: '16px' }} />
          <div className="skeleton" style={{ width: '20px', height: '16px' }} />
        </div>
      ))}
    </div>
  );
}
