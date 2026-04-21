import { useSisuQuery } from '@/app/hooks/useSisuQuery';
import { useUiStore } from '@/app/stores/uiStore';
import { EnrolmentsResponseSchema, ENROLMENTS_ENDPOINT, type EnrolmentsResponse } from '@/app/api/endpoints/enrolments';
import {
  AttainmentsResponseSchema,
  ATTAINMENTS_ENDPOINT,
  type AttainmentsResponse,
} from '@/app/api/endpoints/attainments';
import { CourseCard, CourseCardSkeleton } from './CourseCard';
import { AttainmentsWidget, AttainmentsWidgetSkeleton } from './AttainmentsWidget';
import { ErrorBoundary } from '@/app/components/ui/ErrorBoundary';
import { resolveAllEnrolments, ResolvedEnrolment } from '@/app/api/resolvers';
import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';

function Widget({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-surface)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: 'var(--space-2) var(--space-4)',
          borderBottom: '1px solid var(--border)',
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          letterSpacing: '0.08em',
          color: 'var(--text-tertiary)',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function InlineError({ endpoint, error }: { endpoint: string; error: Error }) {
  return (
    <div
      style={{
        padding: 'var(--space-4)',
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        color: 'var(--text-tertiary)',
      }}
    >
      <span style={{ color: '#f87171' }}>ERR</span> <span style={{ color: 'var(--text-secondary)' }}>{endpoint}</span>{' '}
      {error.message}
    </div>
  );
}

export function Dashboard() {
  const { theme, toggleTheme } = useUiStore();

  const enrolments = useSisuQuery<EnrolmentsResponse>(ENROLMENTS_ENDPOINT);
  const attainments = useSisuQuery<AttainmentsResponse>(ATTAINMENTS_ENDPOINT);

  const enrolmentList = useMemo(() => {
    return enrolments.data ? EnrolmentsResponseSchema.parse(enrolments.data) : [];
  }, [enrolments.data]);

  const attainmentList = useMemo(() => {
    return attainments.data ? AttainmentsResponseSchema.parse(attainments.data) : [];
  }, [attainments.data]);

  const [resolvedEnrolments, setResolvedEnrolments] = useState<ResolvedEnrolment[]>([]);
  const [isResolving, setIsResolving] = useState(false);

  useEffect(() => {
    let isActive = true;

    if (enrolmentList.length === 0) {
      setResolvedEnrolments([]);
      return;
    }

    const fetchResolutions = async () => {
      setIsResolving(true);
      try {
        const result = await resolveAllEnrolments(enrolmentList);
        if (isActive) {
          setResolvedEnrolments(result);
        }
      } catch (error) {
        console.error('Failed to resolve enrolments:', error);
      } finally {
        if (isActive) {
          setIsResolving(false);
        }
      }
    };

    fetchResolutions();

    return () => {
      isActive = false;
    };
  }, [enrolmentList]);

  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: 'var(--space-6) var(--space-6)',
        minHeight: '100vh',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-6)',
          paddingBottom: 'var(--space-4)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '15px',
            fontWeight: 500,
            letterSpacing: '0.06em',
            color: 'var(--text-primary)',
          }}
        >
          SISU+
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <button
            onClick={toggleTheme}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              letterSpacing: '0.06em',
              color: 'var(--text-tertiary)',
              background: 'none',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '3px 8px',
              cursor: 'pointer',
              textTransform: 'uppercase',
              transition: 'color var(--transition-fast), border-color var(--transition-fast)',
            }}
          >
            {theme}
          </button>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 'var(--space-4)',
        }}
        className="sisu-grid"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Widget label="Enrolments">
            <ErrorBoundary>
              {enrolments.isLoading || isResolving ? (
                Array.from({ length: 4 }).map((_, i) => <CourseCardSkeleton key={i} />)
              ) : enrolments.isError ? (
                <InlineError endpoint={ENROLMENTS_ENDPOINT} error={enrolments.error} />
              ) : resolvedEnrolments.length === 0 ? (
                <div style={{ padding: 'var(--space-4)', color: 'var(--text-tertiary)', fontSize: '12px' }}>
                  No active enrolments
                </div>
              ) : (
                resolvedEnrolments.map((e, i) => <CourseCard key={e.id ?? i} enrolment={e} />)
              )}
            </ErrorBoundary>
          </Widget>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Widget label="Recent Grades">
            <ErrorBoundary>
              {attainments.isLoading ? (
                <AttainmentsWidgetSkeleton />
              ) : attainments.isError ? (
                <InlineError endpoint={ATTAINMENTS_ENDPOINT} error={attainments.error} />
              ) : (
                <AttainmentsWidget attainments={attainmentList} />
              )}
            </ErrorBoundary>
          </Widget>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .sisu-grid {
            grid-template-columns: 3fr 2fr !important;
          }
        }
      `}</style>
    </div>
  );
}
