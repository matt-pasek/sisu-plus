import React, { useEffect, useState } from 'react';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { useCourseUnit } from '@/app/views/structure/hooks/useCourseUnit';
import { useCourseVersions } from '@/app/views/structure/hooks/useCourseVersions';
import { usePrerequisites } from '@/app/views/structure/hooks/usePrerequisites';
import { useChangeCourseVersion } from '@/app/views/structure/editing/useChangeCourseVersion';
import { pickLabel } from '@/app/api/resolvers/helpers/pickLabel';
import { DialogShell, DialogCloseButton } from './DialogShell.comp';
import type { CourseEntry } from '@/app/views/structure/structureTypes';
import type { PrerequisiteCourse } from '@/app/views/structure/hooks/usePrerequisites';

interface Props {
  course: CourseEntry;
  planId: string;
  onClose: () => void;
  onAttainmentClick?: () => void;
}

type Tab = 'info' | 'equivalences';

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  fi: 'Finnish',
  sv: 'Swedish',
  de: 'German',
  fr: 'French',
  ru: 'Russian',
  et: 'Estonian',
  ja: 'Japanese',
  zh: 'Chinese',
};

function formatUrn(urn: string | undefined): string {
  if (!urn) return '–';
  const last = urn.split(':').at(-1) ?? urn;
  return last
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function formatLanguageUrn(urn: string): string {
  const code = urn.split(':').at(-1) ?? urn;
  return LANGUAGE_NAMES[code] ?? code.toUpperCase();
}

export function formatVersion(startDate: string | undefined, endDate: string | undefined): string {
  if (!startDate) return '–';
  const startYear = startDate.split('-')[0];
  const endYear = endDate?.split('-')[0];
  if (!endYear || endYear === startYear) return startYear;
  return `${startYear}-${endYear}`;
}

export const CourseDetailsDialog: React.FC<Props> = ({ course, planId, onClose, onAttainmentClick }) => {
  const { t } = useTranslationWithPrefix('views.structure.dialogs');
  const { data: unit, isLoading } = useCourseUnit(course.courseUnitId);
  const { data: versions = [] } = useCourseVersions(unit?.groupId);
  const [tab, setTab] = useState<Tab>('info');
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [selectedCourseUnitId, setSelectedCourseUnitId] = useState(course.courseUnitId);

  useEffect(() => {
    setSelectedCourseUnitId(course.courseUnitId);
    setVersionsOpen(false);
  }, [course.courseUnitId]);

  const changeCourseVersion = useChangeCourseVersion({
    planId,
    oldCourseUnitId: course.courseUnitId,
    newCourseUnitId: selectedCourseUnitId,
  });

  const courseName = course.name ?? (unit ? pickLabel(unit.name) : null) ?? course.code ?? course.courseUnitId;
  const courseCode = course.code ?? unit?.code ?? course.courseUnitId;
  const credits = course.credits ?? unit?.credits?.min ?? null;

  const outcomes = unit ? pickLabel((unit.outcomes as Record<string, string>) ?? {}) : null;
  const content = unit ? pickLabel((unit.content as Record<string, string>) ?? {}) : null;
  const prerequisiteText = unit ? pickLabel((unit.prerequisites as Record<string, string>) ?? {}) : null;
  const additional = unit ? pickLabel((unit.additional as Record<string, string>) ?? {}) : null;
  const learningMaterial = unit ? pickLabel((unit.learningMaterial as Record<string, string>) ?? {}) : null;

  const version = unit ? formatVersion(unit.validityPeriod?.startDate, unit.validityPeriod?.endDate) : '–';
  const selectedVersion = versions.find((candidate) => candidate.id === selectedCourseUnitId);
  const selectedVersionLabel = selectedVersion
    ? formatVersion(selectedVersion.validityPeriod?.startDate, selectedVersion.validityPeriod?.endDate)
    : version;
  const canChangeVersion = !course.completed && selectedCourseUnitId !== course.courseUnitId;

  const languages = unit?.possibleAttainmentLanguages?.map(formatLanguageUrn).join(', ') ?? '–';
  const gradeScale = formatUrn(unit?.gradeScaleId);
  const courseLevel = formatUrn(unit?.studyLevel);
  const courseType = formatUrn(unit?.courseUnitType);

  const responsibleTeachers =
    unit?.responsibilityInfos
      ?.filter((r) => r.roleUrn === 'urn:code:module-responsibility-info-type:responsible-teacher')
      .map((r) => (r.text ? pickLabel(r.text as Record<string, string>) : null))
      .filter(Boolean)
      .join(', ') ?? null;

  const studyFields = unit?.studyFields?.map(formatUrn).join(', ') ?? null;

  const { prerequisites, isLoading: prereqLoading, hasStructuredPrerequisites } = usePrerequisites(unit);

  const gradeLabel = course.grade ?? (course.completed ? 'Pass' : null);

  return (
    <DialogShell labelId="course-details-dialog-title" onClose={onClose} maxWidth="max-w-3xl">
      {/* HEADER — no border-b, version strip and tabs are inside */}
      <div className="relative flex-shrink-0 px-[26px] pt-[22px]">
        {/* Left accent bar scoped to header */}
        <div className="absolute top-[22px] bottom-0 left-0 w-1 rounded-r-[3px] bg-lighterGreen" />

        {/* Title row */}
        <div className="flex items-start gap-4">
          <div className="min-w-0 flex-1">
            <h2
              id="course-details-dialog-title"
              className="text-[21px] leading-[1.3] font-semibold tracking-[-0.4px] text-offwhite"
            >
              {courseName}
              {credits != null && (
                <span className="ml-2.5 inline-flex translate-y-[-2px] items-center rounded-[7px] bg-lighterGreen/12 px-[9px] py-[3px] align-middle text-[13px] font-bold text-lighterGreen">
                  {credits} cr
                </span>
              )}
            </h2>
            <div className="mt-[5px] font-mono text-[12px] text-lightGrey">
              {courseCode} <span className="text-darkishGrey">· Course</span>
            </div>
          </div>
          <DialogCloseButton label={t('close')} onClose={onClose} />
        </div>

        {/* Version + status strip */}
        <div className="mt-[18px] mb-[16px] flex flex-wrap items-center gap-x-8 gap-y-[14px]">
          <div className="flex flex-col gap-[5px]">
            <span className="text-[10.5px] font-semibold tracking-[.06em] text-darkishGrey uppercase">
              {t('courseDetails.courseVersionLabel')}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <button
                  type="button"
                  disabled={course.completed || versions.length <= 1}
                  onClick={() => setVersionsOpen((open) => !open)}
                  className="flex items-center gap-2 rounded-lg border border-border2 bg-container2 px-[12px] py-[8px] text-[12.5px] font-medium text-offwhite transition-colors hover:bg-border2/40 disabled:cursor-not-allowed disabled:text-lightGrey"
                >
                  {selectedVersionLabel}
                  <span className="font-normal text-lightGrey">{course.completed ? '(Completed)' : '(Active)'}</span>
                  <svg width="10" height="6" viewBox="0 0 11 7" fill="none" className="ml-0.5 text-darkishGrey">
                    <path
                      d="M1 1l4.5 4.5L10 1"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                {versionsOpen && (
                  <div className="absolute top-[calc(100%+6px)] left-0 z-20 min-w-[170px] overflow-hidden rounded-lg border border-border2 bg-container shadow-[0_14px_32px_rgba(0,0,0,0.35)]">
                    {versions.map((candidate) => (
                      <button
                        key={candidate.id}
                        type="button"
                        onClick={() => {
                          setSelectedCourseUnitId(candidate.id ?? course.courseUnitId);
                          setVersionsOpen(false);
                        }}
                        className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-[12.5px] transition-colors hover:bg-container2 ${
                          candidate.id === selectedCourseUnitId ? 'text-offwhite' : 'text-lightGrey'
                        }`}
                      >
                        <span>
                          {formatVersion(candidate.validityPeriod?.startDate, candidate.validityPeriod?.endDate)}
                        </span>
                        {candidate.id === course.courseUnitId && (
                          <span className="text-[11px] whitespace-nowrap text-lighterGreen">
                            {t('courseDetails.versionInPlan')}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {canChangeVersion && (
                <button
                  type="button"
                  disabled={changeCourseVersion.isPending}
                  onClick={() => changeCourseVersion.changeVersion({ onSuccess: onClose })}
                  className="rounded-lg border border-accent bg-accent/20 px-[12px] py-[8px] text-[12px] font-semibold text-accent transition-colors hover:bg-accent/30 disabled:cursor-not-allowed disabled:border-border disabled:bg-container disabled:text-lightGrey"
                >
                  {t('courseDetails.changeVersionButton')}
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-[7px] pt-[2px] text-[12.5px]">
            <div>
              <span className="text-lightGrey">Status: </span>
              <span className={`font-semibold ${course.completed ? 'text-lighterGreen' : 'text-offwhite'}`}>
                {course.completed ? `Completed${credits != null ? ` (${credits} cr)` : ''}` : 'Planned'}
              </span>
            </div>
            {gradeLabel && (
              <div>
                <span className="text-lightGrey">Grade: </span>
                <span className="font-semibold text-offwhite">{gradeLabel}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tabs — border-b acts as the header/body separator */}
        <div className="flex gap-6 border-b border-border">
          {(['info', 'equivalences'] as Tab[]).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={`-mb-px border-b-2 px-0.5 py-[9px] text-[13px] font-semibold transition-colors ${
                tab === value ? 'border-accent text-offwhite' : 'border-transparent text-lightGrey hover:text-offwhite'
              }`}
            >
              {value === 'info' ? t('courseDetails.tabInfo') : t('courseDetails.tabEquivalences')}
            </button>
          ))}
        </div>
      </div>

      {/* BODY */}
      <div className="min-h-0 overflow-y-auto px-[26px] pb-[26px]">
        {isLoading && (
          <div className="flex h-40 items-center justify-center">
            <span className="text-xs text-lightGrey">{t('courseDetails.loading')}</span>
          </div>
        )}

        {!isLoading && tab === 'equivalences' && (
          <div className="py-10 text-center text-[13px] text-lightGrey">{t('courseDetails.noData')}</div>
        )}

        {!isLoading && tab === 'info' && (
          <div>
            {/* Completion / action banner */}
            <div className="mt-5 mb-1">
              {course.completed ? (
                <div className="flex items-center gap-[13px] rounded-[11px] border border-lighterGreen/22 bg-lighterGreen/12 px-4 py-[13px]">
                  <div className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-lighterGreen/20">
                    <svg width="15" height="13" viewBox="0 0 14 12" fill="none">
                      <path
                        d="M1 6l4 4 8-9"
                        stroke="var(--color-lighterGreen)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-[13.5px] font-semibold text-lighterGreen">
                      {t('courseDetails.completedBannerTitle')}
                    </div>
                    {gradeLabel && (
                      <div className="text-[12px] text-lightGrey">
                        {t('courseDetails.completedBannerRecorded')}{' '}
                        <strong className="text-offwhite">{gradeLabel}</strong>
                      </div>
                    )}
                  </div>
                  {onAttainmentClick && (
                    <button
                      type="button"
                      onClick={onAttainmentClick}
                      className="shrink-0 rounded-lg border border-border2 bg-container2 px-[13px] py-[7px] text-[12px] font-medium text-offwhite transition-colors hover:bg-border2/40"
                    >
                      {t('courseDetails.viewAttainmentAction')}
                    </button>
                  )}
                </div>
              ) : null}
            </div>

            {/* Information sheet heading */}
            <h3 className="mt-6 mb-[14px] text-[16px] font-semibold tracking-[-0.2px] text-offwhite">
              Information sheet
            </h3>

            {/* Basic information */}
            <CDLabel>{t('courseDetails.basicInfoHeading')}</CDLabel>
            <div className="mb-2 grid gap-x-8 gap-y-0.5 sm:grid-cols-2">
              <CDField label={t('courseDetails.languageLabel')} value={languages} />
              <CDField label={t('courseDetails.courseLevelLabel')} value={courseLevel} />
              <CDField label={t('courseDetails.gradeScaleLabel')} value={gradeScale} />
              <CDField label={t('courseDetails.courseTypeLabel')} value={courseType} />
            </div>

            {/* Content and goals */}
            {(outcomes || content) && (
              <CDCollapse title={t('courseDetails.contentHeading')} defaultOpen>
                <div className="grid gap-9 sm:grid-cols-2">
                  {outcomes && (
                    <div>
                      <CDLabel>{t('courseDetails.outcomesHeading')}</CDLabel>
                      <p className="mb-[11px] text-[13px] leading-[1.55] text-offwhite">
                        At the end of the course students will be able to:
                      </p>
                      <div
                        className="prose prose-invert max-w-none text-[13px] leading-relaxed text-offwhite/80 [&_ol]:space-y-2 [&_ol]:pl-0 [&_ol>li]:flex [&_ol>li]:gap-2"
                        dangerouslySetInnerHTML={{ __html: outcomes }}
                      />
                    </div>
                  )}
                  {content && (
                    <div>
                      <CDLabel>{t('courseDetails.contentSectionHeading')}</CDLabel>
                      <div
                        className="text-[13px] leading-relaxed text-offwhite/80"
                        dangerouslySetInnerHTML={{ __html: content }}
                      />
                      {additional && (
                        <div className="mt-[18px]">
                          <CDLabel>{t('courseDetails.additionalInfoLabel')}</CDLabel>
                          <div
                            className="text-[13px] leading-relaxed text-offwhite/80"
                            dangerouslySetInnerHTML={{ __html: additional }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CDCollapse>
            )}

            <CDCollapse title={t('courseDetails.prerequisitesHeading')}>
              {hasStructuredPrerequisites ? (
                prereqLoading ? (
                  <p className="text-[12px] text-lightGrey">Loading prerequisites…</p>
                ) : prerequisites.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {prerequisites.map((p) => (
                      <PrerequisiteCard key={p.courseUnitId} prereq={p} />
                    ))}
                  </div>
                ) : (
                  <p className="text-[13px] leading-[1.6] text-offwhite/80">{t('courseDetails.noPrerequisites')}</p>
                )
              ) : prerequisiteText ? (
                <>
                  <CDLabel>Description of prerequisites</CDLabel>
                  <div
                    className="text-[13px] leading-[1.6] text-offwhite/80"
                    dangerouslySetInnerHTML={{ __html: prerequisiteText }}
                  />
                </>
              ) : (
                <p className="text-[13px] leading-[1.6] text-offwhite/80">{t('courseDetails.noPrerequisites')}</p>
              )}
            </CDCollapse>

            <CDCollapse title={t('courseDetails.studyMaterialsHeading')}>
              <CDLabel>{t('courseDetails.studyMaterialsLabel')}</CDLabel>
              {learningMaterial ? (
                <div
                  className="text-[13px] leading-[1.6] text-offwhite/80"
                  dangerouslySetInnerHTML={{ __html: learningMaterial }}
                />
              ) : (
                <p className="text-[13px] leading-[1.6] text-offwhite/80">{t('courseDetails.noData')}</p>
              )}
            </CDCollapse>

            {studyFields && (
              <CDCollapse title={t('courseDetails.classificationHeading')}>
                <CDLabel>{t('courseDetails.fieldsOfStudyLabel')}</CDLabel>
                <p className="text-[13px] leading-[1.6] text-offwhite/80">{studyFields}</p>
              </CDCollapse>
            )}

            <CDCollapse title={t('courseDetails.responsiblePersonsHeading')}>
              <div className="grid gap-9 sm:grid-cols-2">
                <div>
                  <CDLabel>{t('courseDetails.responsibleTeacherLabel')}</CDLabel>
                  <div className="text-[13.5px] font-semibold text-offwhite">
                    {responsibleTeachers ?? t('courseDetails.toBeConfirmed')}
                  </div>
                </div>
              </div>
            </CDCollapse>
          </div>
        )}
      </div>
    </DialogShell>
  );
};

const PrerequisiteCard: React.FC<{ prereq: PrerequisiteCourse }> = ({ prereq }) => (
  <div className="flex overflow-hidden rounded-[8px] border border-border bg-container transition-colors hover:border-border2">
    <div className={`w-[3px] shrink-0 ${prereq.completed ? 'bg-lighterGreen' : 'bg-border2'}`} />
    <div className="flex flex-1 items-center gap-3 px-3 py-2.5">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span
            className={`text-[12.5px] leading-[1.3] font-semibold ${prereq.completed ? 'text-offwhite/70' : 'text-offwhite'}`}
          >
            {prereq.name}
          </span>
          {!prereq.required && (
            <span className="shrink-0 rounded-[4px] bg-border2/60 px-[5px] py-[1px] text-[9.5px] font-medium text-lightGrey">
              Recommended
            </span>
          )}
        </div>
        <div className="mt-[2px] flex items-center gap-1.5">
          <span className="font-mono text-[9.5px] text-darkishGrey">{prereq.code}</span>
          {prereq.credits != null && (
            <>
              <span className="text-[9px] text-darkishGrey">·</span>
              <span className="text-[11px] font-semibold text-lighterGreen">{prereq.credits} cr</span>
            </>
          )}
        </div>
      </div>
      {prereq.completed ? (
        <div className="flex shrink-0 items-center gap-1.5">
          {prereq.grade && (
            <span className="rounded-[5px] bg-lighterGreen/15 px-[7px] py-[2px] text-[11px] font-semibold text-lighterGreen">
              {prereq.grade}
            </span>
          )}
          <div className="flex size-[18px] items-center justify-center rounded-full bg-lighterGreen/20">
            <svg width="9" height="8" viewBox="0 0 9 8" fill="none">
              <path
                d="M1 4l2.5 2.5 5-5"
                stroke="var(--color-lighterGreen)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      ) : (
        <div className="size-[18px] shrink-0 rounded-full border border-border2" />
      )}
    </div>
  </div>
);

const CDLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="mb-[9px] text-[10.5px] font-semibold tracking-[.07em] text-darkishGrey uppercase">{children}</div>
);

const CDField: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex gap-[11px] py-[5px]">
    <div className="w-0.5 shrink-0 self-stretch rounded-sm bg-border2" />
    <div className="text-[13px] leading-[1.5]">
      <span className="text-lightGrey">{label}: </span>
      <span className="font-medium text-offwhite">{value}</span>
    </div>
  </div>
);

const CDCollapse: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({
  title,
  children,
  defaultOpen = false,
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-border">
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => e.key === 'Enter' && setOpen((o) => !o)}
        className="flex cursor-pointer items-center gap-[13px] py-[15px] select-none"
      >
        <div
          className="flex size-[26px] shrink-0 items-center justify-center rounded-full border border-border2 text-lightGrey transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'none' }}
        >
          <svg width="11" height="7" viewBox="0 0 11 7" fill="none">
            <path
              d="M1 1l4.5 4.5L10 1"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className="text-[14.5px] font-semibold tracking-[-0.1px] text-offwhite">{title}</span>
      </div>
      {open && <div className="pr-1 pb-5 pl-[39px]">{children}</div>}
    </div>
  );
};
