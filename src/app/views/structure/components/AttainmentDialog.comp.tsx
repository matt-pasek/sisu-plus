import React from 'react';
import { fetchAttainments } from '@/app/api/endpoints/attainments';
import { useSisuQuery } from '@/app/hooks/useSisuQuery';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { pickLabel } from '@/app/api/resolvers/helpers/pickLabel';
import { DialogShell, DialogCloseButton } from './DialogShell.comp';
import type { CourseEntry } from '@/app/views/structure/structureTypes';
import type { CourseUnitAttainmentRestricted } from '@/app/api/generated/OriApi';

interface Props {
  course: CourseEntry;
  onClose: () => void;
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '–';
  const [year, month, day] = dateStr.split('-');
  return `${day}.${month}.${year}`;
}

function formatLanguage(urn: string): string {
  const code = urn.split(':').at(-1) ?? urn;
  const names: Record<string, string> = {
    en: 'English',
    fi: 'Finnish',
    sv: 'Swedish',
    de: 'German',
    fr: 'French',
  };
  return names[code] ?? code.toUpperCase();
}

export const AttainmentDialog: React.FC<Props> = ({ course, onClose }) => {
  const { t } = useTranslationWithPrefix('views.structure.dialogs');
  const { data: allAttainments, isLoading } = useSisuQuery(['attainments'], fetchAttainments);

  const attainment =
    allAttainments?.find(
      (a): a is CourseUnitAttainmentRestricted =>
        'courseUnitId' in a && a.courseUnitId === course.courseUnitId && a.primary,
    ) ??
    allAttainments?.find(
      (a): a is CourseUnitAttainmentRestricted => 'courseUnitId' in a && a.courseUnitId === course.courseUnitId,
    );

  const approver =
    attainment?.acceptorPersons?.find((p) => p.roleUrn === 'urn:code:attainment-acceptor-type:approved-by') ??
    attainment?.acceptorPersons?.[0];

  const approverName = approver ? (pickLabel((approver.text as Record<string, string>) ?? {}) ?? '–') : '–';

  const stateLabel = attainment
    ? ({
        ATTAINED: t('attainment.stateAttained'),
        INCLUDED: t('attainment.stateIncluded'),
        SUBSTITUTED: t('attainment.stateSubstituted'),
        FAILED: t('attainment.stateFailed'),
      }[attainment.state] ?? attainment.state)
    : '–';

  const courseName = course.name ?? course.code ?? course.courseUnitId;
  const courseCode = course.code ?? course.courseUnitId;

  const leftFields = [
    { label: t('attainment.stateLabel'), value: stateLabel },
    {
      label: t('attainment.creditsLabel'),
      value: attainment ? String(attainment.credits) : course.credits != null ? String(course.credits) : '–',
    },
    {
      label: t('attainment.expiryLabel'),
      value: attainment?.expiryDate ? formatDate(attainment.expiryDate) : t('attainment.noExpiry'),
    },
    { label: t('attainment.averageGradeLabel'), value: '–' },
  ];

  const rightFields = [
    { label: t('attainment.gradeLabel'), value: course.grade ?? '–' },
    { label: t('attainment.dateLabel'), value: formatDate(attainment?.attainmentDate) },
    {
      label: t('attainment.languageLabel'),
      value: attainment?.attainmentLanguageUrn ? formatLanguage(attainment.attainmentLanguageUrn) : '–',
    },
    { label: t('attainment.approvedByLabel'), value: approverName },
  ];

  return (
    <DialogShell labelId="attainment-dialog-title" onClose={onClose} maxWidth="max-w-2xl">
      {/* HEADER */}
      <div className="flex flex-shrink-0 items-start gap-4 border-b border-border px-[28px] py-6">
        <div className="min-w-0 flex-1">
          <h2 id="attainment-dialog-title" className="text-[20px] font-semibold tracking-[-0.3px] text-offwhite">
            {courseName}
            {courseCode !== courseName && (
              <>
                <span className="font-medium text-lightGrey">, </span>
                <span className="font-mono text-[15px] font-medium text-lightGrey">{courseCode}</span>
              </>
            )}
          </h2>
          <p className="mt-[6px] text-[13px] font-semibold text-lightGrey">{t('attainment.title')}</p>
        </div>
        <DialogCloseButton label={t('close')} onClose={onClose} />
      </div>

      {/* BODY */}
      <div className="min-h-0 overflow-y-auto px-[28px] py-6">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <span className="text-xs text-lightGrey">{t('courseDetails.loading')}</span>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-x-10">
              <div>
                {leftFields.map((f) => (
                  <ATField key={f.label} label={f.label} value={f.value} />
                ))}
              </div>
              <div>
                {rightFields.map((f) => (
                  <ATField
                    key={f.label}
                    label={f.label}
                    value={f.value}
                    isGrade={f.label === t('attainment.gradeLabel')}
                  />
                ))}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-x-10 border-t border-border pt-6">
              <ATField label={t('attainment.registrationDateLabel')} value={formatDate(attainment?.registrationDate)} />
            </div>
          </>
        )}
      </div>

      {/* FOOTER */}
      <div className="flex flex-shrink-0 justify-end border-t border-border px-[28px] py-[14px]">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg bg-accent px-[22px] py-[9px] text-[13px] font-semibold tracking-[.02em] text-black transition-opacity hover:opacity-90"
        >
          {t('close')}
        </button>
      </div>
    </DialogShell>
  );
};

const ATField: React.FC<{ label: string; value: string; isGrade?: boolean }> = ({ label, value, isGrade }) => (
  <div className="mb-[26px]">
    <div className="mb-[7px] text-[10.5px] font-semibold tracking-[.07em] text-darkishGrey uppercase">{label}</div>
    <div
      className={`text-[13.5px] leading-[1.5] ${value === '–' || value === '—' ? 'text-darkishGrey' : isGrade ? 'font-semibold text-offwhite' : 'text-offwhite'}`}
    >
      {value}
    </div>
  </div>
);
