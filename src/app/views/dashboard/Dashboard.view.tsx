import { useSisuQuery } from '@/app/hooks/useSisuQuery';
import { fetchEnrolments } from '@/app/api/endpoints/enrolments';
import { fetchAttainments } from '@/app/api/endpoints/attainments';
import { fetchPlans } from '@/app/api/endpoints/plans';
import { fetchEducations } from '@/app/api/endpoints/educations';
import React, { useEffect, useState } from 'react';
import { resolveAllEnrolments, ResolvedEnrolment } from '@/app/api/resolvers';
import { Widget } from '@/app/views/dashboard/components/Widget.comp';
import { CourseCard, CourseCardSkeleton } from '@/app/views/dashboard/components/CourseCard';
import { InlineError } from '@/app/components/InlineError.comp';
import { ProgressWidget, ProgressWidgetSkeleton } from '@/app/views/dashboard/components/ProgressWidget';
import { AttainmentsWidget, AttainmentsWidgetSkeleton } from '@/app/views/dashboard/components/AttainmentsWidget';

const DashboardView: React.FC = () => {
  const enrolments = useSisuQuery(['enrolments'], fetchEnrolments);
  const attainments = useSisuQuery(['attainments'], fetchAttainments);
  const plans = useSisuQuery(['plans'], fetchPlans);
  const educations = useSisuQuery(['educations'], fetchEducations);

  const enrolmentList = enrolments.data ?? [];
  const attainmentList = attainments.data ?? [];

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
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 'var(--space-4)',
        }}
        className="sisu-grid"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Widget label="Enrolments">
            {enrolments.isLoading || isResolving ? (
              Array.from({ length: 4 }).map((_, i) => <CourseCardSkeleton key={i} />)
            ) : enrolments.isError ? (
              <InlineError endpoint="enrolments" error={enrolments.error} />
            ) : resolvedEnrolments.length === 0 ? (
              <div style={{ padding: 'var(--space-4)', color: 'var(--text-tertiary)', fontSize: '12px' }}>
                No active enrolments
              </div>
            ) : (
              resolvedEnrolments.map((e, i) => <CourseCard key={e.id ?? i} enrolment={e} />)
            )}
          </Widget>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <Widget label="Progress">
            {plans.isLoading || educations.isLoading ? (
              <ProgressWidgetSkeleton />
            ) : plans.isError ? (
              <InlineError endpoint="plans" error={plans.error} />
            ) : educations.isError ? (
              <InlineError endpoint="educations" error={educations.error} />
            ) : (
              <ProgressWidget plans={plans.data ?? []} educations={educations.data ?? []} />
            )}
          </Widget>
          <Widget label="Recent Grades">
            {attainments.isLoading ? (
              <AttainmentsWidgetSkeleton />
            ) : attainments.isError ? (
              <InlineError endpoint="attainments" error={attainments.error} />
            ) : (
              <AttainmentsWidget attainments={attainmentList} />
            )}
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
};

export default DashboardView;
