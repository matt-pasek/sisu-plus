import React, { useEffect, useMemo, useState } from 'react';
import { getStudyPeriodMap, type StudyPeriodInfo } from '@/app/api/dataPoints/getStudyPeriodMap';
import { fetchEnrolments } from '@/app/api/endpoints/enrolments';
import { fetchCourseUnit, fetchCourseUnitsByGroupIds } from '@/app/api/endpoints/courseUnit';
import { useSisuQuery } from '@/app/hooks/useSisuQuery';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { pickLabel } from '@/app/api/resolvers/helpers/pickLabel';
import { useStructurePlanMutation } from '@/app/views/structure/editing/useStructurePlanMutation';
import { swapCourseVersion } from '@/app/views/structure/editing/useChangeCourseVersion';
import { formatVersion } from '@/app/views/structure/components/CourseDetailsDialog.comp';
import { DialogShell, DialogCloseButton } from './DialogShell.comp';
import type { CourseUnit } from '@/app/api/generated/KoriApi';
import type { Plan } from '@/app/api/generated/OsuvaApi';
import type { CourseEntry, SectionData } from '@/app/views/structure/structureTypes';

interface Props {
  plan: Plan;
  sections: SectionData[];
  onClose: () => void;
}

type VersionUpdate = {
  course: CourseEntry;
  current: CourseUnit;
  latest: CourseUnit;
  academicYear: number | null;
};

function formatAcademicYear(startYear: number): string {
  return `${startYear}-${startYear + 1}`;
}

function getCourseSelection(plan: Plan, courseUnitId: string) {
  return plan.courseUnitSelections.find((selection) => selection.courseUnitId === courseUnitId);
}

function getPlannedPeriods(
  plan: Plan,
  courseUnitId: string,
  periodMap: Map<string, StudyPeriodInfo>,
): StudyPeriodInfo[] {
  return (getCourseSelection(plan, courseUnitId)?.plannedPeriods ?? [])
    .map((locator) => periodMap.get(locator))
    .filter((period): period is StudyPeriodInfo => period != null)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
}

function findPlannedAcademicYear(periods: StudyPeriodInfo[]): number | null {
  return periods[0]?.studyYear ?? null;
}

function coversAcademicYear(unit: CourseUnit, academicYear: number): boolean {
  const startYear = Number(unit.validityPeriod?.startDate?.split('-')[0]);
  const endYear = Number(unit.validityPeriod?.endDate?.split('-')[0]);
  if (!Number.isFinite(startYear)) return false;
  if (startYear > academicYear) return false;
  return !Number.isFinite(endYear) || endYear >= academicYear + 1;
}

function findLatestVersion(versions: CourseUnit[], academicYear: number | null): CourseUnit | null {
  return versions
    .filter((unit) => unit.documentState !== 'DELETED')
    .filter((unit) => academicYear == null || coversAcademicYear(unit, academicYear))
    .reduce<CourseUnit | null>((latest, unit) => {
      const latestStart = latest?.validityPeriod?.startDate ?? '';
      const unitStart = unit.validityPeriod?.startDate ?? '';
      return !latest || unitStart > latestStart ? unit : latest;
    }, null);
}

export const BulkVersionUpdateDialog: React.FC<Props> = ({ plan, sections, onClose }) => {
  const { t } = useTranslationWithPrefix('views.structure');
  const saveStructurePlan = useStructurePlanMutation();
  const { studyPeriodMap, isLoading: periodsLoading } = getStudyPeriodMap();
  const { data: enrolments = [], isLoading: enrolmentsLoading } = useSisuQuery(['enrolments'], fetchEnrolments);

  const enrolledCourseUnitIds = useMemo(
    () =>
      new Set(
        enrolments
          .filter((enrolment) => enrolment.state === 'ENROLLED' || enrolment.state === 'CONFIRMED')
          .map((enrolment) => enrolment.courseUnitId),
      ),
    [enrolments],
  );

  const courses = sections
    .flatMap((section) => section.courses)
    .filter((course) => !course.completed && !enrolledCourseUnitIds.has(course.courseUnitId));
  const courseUnitIds = [...new Set(courses.map((course) => course.courseUnitId))];

  const { data: currentUnits = [], isLoading: currentUnitsLoading } = useSisuQuery(
    ['bulk-version-current-units', ...courseUnitIds],
    () => Promise.all(courseUnitIds.map(fetchCourseUnit)),
    { enabled: courseUnitIds.length > 0 },
  );

  const groupIds = [...new Set(currentUnits.map((unit) => unit.groupId))];
  const { data: versionUnits = [], isLoading: versionsLoading } = useSisuQuery(
    ['bulk-version-units', ...groupIds],
    () => fetchCourseUnitsByGroupIds(groupIds),
    { enabled: groupIds.length > 0 },
  );

  const versionsByGroupId = versionUnits.reduce<Record<string, CourseUnit[]>>((acc, unit) => {
    acc[unit.groupId] = [...(acc[unit.groupId] ?? []), unit];
    return acc;
  }, {});

  const currentById = new Map(currentUnits.map((unit) => [unit.id, unit]));
  const updates: VersionUpdate[] = courses.flatMap((course) => {
    const current = currentById.get(course.courseUnitId);
    if (!current) return [];
    const plannedPeriods = getPlannedPeriods(plan, course.courseUnitId, studyPeriodMap);
    const academicYear = findPlannedAcademicYear(plannedPeriods);
    const latest = findLatestVersion(versionsByGroupId[current.groupId] ?? [], academicYear);
    if (!latest?.id || latest.id === course.courseUnitId) return [];
    return [{ course, current, latest, academicYear }];
  });

  const [selectedCourseUnitIds, setSelectedCourseUnitIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setSelectedCourseUnitIds(new Set(updates.map((update) => update.course.courseUnitId)));
  }, [updates.map((update) => update.course.courseUnitId).join(':')]);

  const groupedUpdates = updates
    .reduce<Array<{ academicYear: number | null; updates: VersionUpdate[] }>>((groups, update) => {
      const existing = groups.find((group) => group.academicYear === update.academicYear);
      if (existing) existing.updates.push(update);
      else groups.push({ academicYear: update.academicYear, updates: [update] });
      return groups;
    }, [])
    .sort((a, b) => {
      if (a.academicYear == null && b.academicYear == null) return 0;
      if (a.academicYear == null) return 1;
      if (b.academicYear == null) return -1;
      return a.academicYear - b.academicYear;
    });

  const selectedUpdates = updates.filter((update) => selectedCourseUnitIds.has(update.course.courseUnitId));
  const isLoading = currentUnitsLoading || versionsLoading || periodsLoading || enrolmentsLoading;

  const applyUpdates = () => {
    const nextPlan = selectedUpdates.reduce(
      (candidate, update) => swapCourseVersion(candidate, update.course.courseUnitId, update.latest.id!),
      plan,
    );
    saveStructurePlan.mutate(nextPlan, { onSuccess: onClose });
  };

  return (
    <DialogShell labelId="bulk-version-update-dialog-title" onClose={onClose} maxWidth="max-w-2xl">
      <div className="relative flex-shrink-0 px-[26px] pt-[22px] pb-4">
        <div className="flex items-start gap-4">
          <div className="min-w-0 flex-1">
            <h2 id="bulk-version-update-dialog-title" className="text-[21px] leading-[1.3] font-semibold text-offwhite">
              {t('bulkUpdate.title')}
            </h2>
            <p className="mt-1 text-[13px] leading-[1.5] text-lightGrey">
              {updates.length > 0 ? t('bulkUpdate.subtitle') : t('bulkUpdate.noneSubtitle')}
            </p>
          </div>
          <DialogCloseButton label={t('dialogs.close')} onClose={onClose} />
        </div>
      </div>

      <div className="min-h-0 overflow-y-auto px-[26px] pb-[26px]">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center text-xs text-lightGrey">
            {t('dialogs.courseDetails.loading')}
          </div>
        ) : updates.length === 0 ? (
          <div className="rounded-[10px] border border-border bg-container2 px-4 py-5">
            <div className="text-[14px] font-semibold text-offwhite">{t('bulkUpdate.noneTitle')}</div>
            <p className="mt-1 text-[13px] leading-[1.5] text-lightGrey">{t('bulkUpdate.noneSubtitle')}</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4">
              {groupedUpdates.map((group) => (
                <section key={group.academicYear ?? 'unscheduled'} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-[12px] font-semibold tracking-[.06em] text-darkishGrey uppercase">
                      {group.academicYear == null
                        ? t('bulkUpdate.unscheduledGroup')
                        : formatAcademicYear(group.academicYear)}
                    </h3>
                    <span className="text-[11px] text-lightGrey">
                      {group.updates.length} {t('bulkUpdate.courseCount')}
                    </span>
                  </div>
                  {group.updates.map((update) => {
                    const selected = selectedCourseUnitIds.has(update.course.courseUnitId);
                    return (
                      <label
                        key={update.course.courseUnitId}
                        className={`flex cursor-pointer gap-3 rounded-[9px] border px-3.5 py-3 transition-colors ${
                          selected
                            ? 'border-border2 bg-container'
                            : 'border-border bg-container/60 text-lightGrey hover:border-border2'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={(event) => {
                            setSelectedCourseUnitIds((current) => {
                              const next = new Set(current);
                              if (event.target.checked) next.add(update.course.courseUnitId);
                              else next.delete(update.course.courseUnitId);
                              return next;
                            });
                          }}
                          className="mt-1 size-4 shrink-0 accent-lighterGreen"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="min-w-0">
                              <div className="truncate text-[13px] font-semibold text-offwhite">
                                {update.course.name ?? pickLabel(update.current.name) ?? update.current.code}
                              </div>
                              <div className="mt-0.5 font-mono text-[10.5px] text-darkishGrey">
                                {update.current.code}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-[12px]">
                              <span className="text-lightGrey">
                                {t('bulkUpdate.oldVersion')}:{' '}
                                <strong className="font-semibold text-offwhite">
                                  {formatVersion(
                                    update.current.validityPeriod?.startDate,
                                    update.current.validityPeriod?.endDate,
                                  )}
                                </strong>
                              </span>
                              <span className="text-darkishGrey">{'->'}</span>
                              <span className="text-lightGrey">
                                {t('bulkUpdate.newVersion')}:{' '}
                                <strong className="font-semibold text-lighterGreen">
                                  {formatVersion(
                                    update.latest.validityPeriod?.startDate,
                                    update.latest.validityPeriod?.endDate,
                                  )}
                                </strong>
                              </span>
                            </div>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </section>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between gap-3">
              <span className="text-[12px] text-lightGrey">
                {selectedUpdates.length} / {updates.length} {t('bulkUpdate.selectedCount')}
              </span>
              <button
                type="button"
                disabled={saveStructurePlan.isPending || selectedUpdates.length === 0}
                onClick={applyUpdates}
                className="rounded-lg border border-accent bg-accent/20 px-4 py-2 text-[12px] font-semibold text-accent transition-colors hover:bg-accent/30 disabled:cursor-not-allowed disabled:border-border disabled:bg-container disabled:text-lightGrey"
              >
                {t('bulkUpdate.applyButton')}
              </button>
            </div>
          </>
        )}
      </div>
    </DialogShell>
  );
};
