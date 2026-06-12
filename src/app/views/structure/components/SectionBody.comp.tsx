import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import type { ModuleColor } from '@/app/theme/moduleColors';
import { CourseCard } from '@/app/views/structure/components/CourseCard.comp';
import { CourseEntry } from '@/app/views/structure/types';

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
  const prefersReducedMotion = useReducedMotion();
  const completed = courses.filter((course) => course.completed);
  const active = courses.filter((course) => !course.completed && course.enrolled);
  const remaining = courses.filter((course) => !course.completed && !course.enrolled);

  if (courses.length === 0) {
    return <div className="px-5 py-5 text-xs text-darkishGrey">{t('section.noCourses')}</div>;
  }

  return (
    <motion.div
      className="border-t border-border px-5 pt-4.5 pb-5.5"
      initial={prefersReducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
    >
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
    </motion.div>
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
  const prefersReducedMotion = useReducedMotion();
  if (courses.length === 0) return null;

  const styles = toneStyles[tone];

  return (
    <motion.section
      className="mb-5.5 last:mb-0"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        className={`mb-3.5 flex items-center gap-2.5 font-mono text-[11px] font-bold tracking-[0.12em] uppercase ${styles.text}`}
        initial={prefersReducedMotion ? false : { opacity: 0, x: -4 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
      >
        <span
          className={`size-1.75 rounded-full ${tone === 'remaining' ? '' : styles.dot}`}
          style={tone === 'remaining' ? { backgroundColor: color.value } : undefined}
        />
        {label}
      </motion.div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-3">
        {courses.map((course, index) => (
          <CourseCard
            key={course.courseUnitId}
            color={color}
            course={course}
            index={index}
            onMethodClick={onMethodClick ? () => onMethodClick(course) : undefined}
            onDetailsClick={onDetailsClick ? () => onDetailsClick(course) : undefined}
            onCardClick={() => onCardClick(course)}
          />
        ))}
      </div>
    </motion.section>
  );
};
