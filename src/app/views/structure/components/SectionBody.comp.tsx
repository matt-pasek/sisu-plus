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

export const SectionBody: React.FC<Props> = ({ courses, color, onMethodClick, onDetailsClick, onCardClick }) => {
  const { t } = useTranslationWithPrefix('views.structure');
  const completed = courses.filter((course) => course.completed);
  const remaining = courses.filter((course) => !course.completed);

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

const CourseGroup: React.FC<{
  courses: CourseEntry[];
  color: ModuleColor;
  label: string;
  tone: 'completed' | 'remaining';
  onMethodClick?: (course: CourseEntry) => void;
  onDetailsClick?: (course: CourseEntry) => void;
  onCardClick: (course: CourseEntry) => void;
}> = ({ courses, color, label, tone, onMethodClick, onDetailsClick, onCardClick }) => {
  if (courses.length === 0) return null;

  return (
    <section className="mb-4 last:mb-0">
      <div
        className={`mb-3 flex items-center gap-2 text-xs font-bold tracking-[0.13em] uppercase ${
          tone === 'completed' ? 'text-lighterGreen' : 'text-lightGrey'
        }`}
      >
        <span className={`size-1.5 rounded-full ${tone === 'completed' ? 'bg-lighterGreen' : color.accent}`} />
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
