import React from 'react';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import type { ModuleColor } from '@/app/theme/moduleColors';
import type { CourseEntry } from '@/app/views/structure/structureTypes';
import { CourseCard } from '@/app/views/structure/components/CourseCard.comp';

interface Props {
  courses: CourseEntry[];
  color: ModuleColor;
  onMethodClick: (course: CourseEntry) => void;
  onDetailsClick: (course: CourseEntry) => void;
  onCardClick: (course: CourseEntry) => void;
}

function sumCredits(courses: CourseEntry[]): number {
  return courses.reduce((sum, course) => sum + (course.credits ?? 0), 0);
}

type GroupTone = 'completed' | 'active' | 'remaining';

export const SectionBody: React.FC<Props> = ({ courses, color, onMethodClick, onDetailsClick, onCardClick }) => {
  const { t } = useTranslationWithPrefix('views.structure');
  const completed = courses.filter((course) => course.completed);
  const active = courses.filter((course) => !course.completed && course.enrolled);
  const remaining = courses.filter((course) => !course.completed && !course.enrolled);

  if (courses.length === 0) {
    return <div className="px-5 py-5 text-xs text-darkishGrey">{t('section.noCourses')}</div>;
  }

  return (
    <div className="border-t border-border/80 px-4 py-4">
      <CourseGroup
        courses={completed}
        color={color}
        label={t('section.completedGroup', { count: sumCredits(completed) })}
        tone="completed"
        onDetailsClick={onDetailsClick}
        onCardClick={onCardClick}
      />
      <CourseGroup
        courses={active}
        color={color}
        label={t('section.activeGroup', { count: sumCredits(active) })}
        tone="active"
        onDetailsClick={onDetailsClick}
        onCardClick={onCardClick}
      />
      <CourseGroup
        courses={remaining}
        color={color}
        label={t('section.remainingGroup', { count: sumCredits(remaining) })}
        tone="remaining"
        onMethodClick={onMethodClick}
        onCardClick={onCardClick}
      />
    </div>
  );
};

const toneStyles: Record<GroupTone, { text: string; dot: string }> = {
  completed: { text: 'text-lighterGreen', dot: 'bg-lighterGreen' },
  active: { text: 'text-amber-400', dot: 'bg-amber-400' },
  remaining: { text: 'text-lightGrey', dot: '' },
};

const CourseGroup: React.FC<{
  courses: CourseEntry[];
  color: ModuleColor;
  label: string;
  tone: GroupTone;
  onMethodClick?: (course: CourseEntry) => void;
  onDetailsClick?: (course: CourseEntry) => void;
  onCardClick: (course: CourseEntry) => void;
}> = ({ courses, color, label, tone, onMethodClick, onDetailsClick, onCardClick }) => {
  if (courses.length === 0) return null;

  const styles = toneStyles[tone];

  return (
    <section className="mb-4 last:mb-0">
      <div className={`mb-3 flex items-center gap-2 text-xs font-bold tracking-[0.13em] uppercase ${styles.text}`}>
        <span className={`size-1.5 rounded-full ${tone === 'remaining' ? color.accent : styles.dot}`} />
        {label}
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-2">
        {courses.map((course) => (
          <CourseCard
            key={course.courseUnitId}
            color={color}
            course={course}
            onMethodClick={onMethodClick ? () => onMethodClick(course) : undefined}
            onDetailsClick={onDetailsClick ? () => onDetailsClick(course) : undefined}
            onCardClick={() => onCardClick(course)}
          />
        ))}
      </div>
    </section>
  );
};
