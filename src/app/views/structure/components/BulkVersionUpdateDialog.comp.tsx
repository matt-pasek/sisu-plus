import React, { useEffect, useMemo, useState } from 'react';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { pickLabel } from '@/app/api/resolvers/helpers/pickLabel';
import { useStructurePlanMutation } from '@/app/views/structure/editing/useStructurePlanMutation';
import { swapCourseVersion } from '@/app/views/structure/editing/useChangeCourseVersion';
import { formatCourseVersion } from '@/app/views/structure/components/CourseDetailsDialog.comp';
import {
  formatAcademicYear,
  useBulkVersionUpdates,
  type VersionUpdate,
} from '@/app/views/structure/hooks/useBulkVersionUpdates';
import { DialogShell, DialogCloseButton } from './DialogShell.comp';
import type { Plan } from '@/app/api/generated/OsuvaApi';
import type { SectionData } from '@/app/views/structure/structureTypes';

interface Props {
  plan: Plan;
  sections: SectionData[];
  onClose: () => void;
}

export const BulkVersionUpdateDialog: React.FC<Props> = ({ plan, sections, onClose }) => {
  const { t } = useTranslationWithPrefix('views.structure');
  const saveStructurePlan = useStructurePlanMutation();
  const { updates, isLoading } = useBulkVersionUpdates(plan, sections);

  const [selectedCourseUnitIds, setSelectedCourseUnitIds] = useState<Set<string>>(new Set());

  const nextAcademicYearStart = useMemo(() => {
    const now = new Date();
    const currentStart = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
    return currentStart + 1;
  }, []);

  const idsKey = useMemo(() => updates.map((u) => u.course.courseUnitId).join(':'), [updates]);
  useEffect(() => {
    setSelectedCourseUnitIds(
      new Set(
        updates
          .filter((u) => u.academicYear == null || u.academicYear <= nextAcademicYearStart)
          .map((u) => u.course.courseUnitId),
      ),
    );
  }, [idsKey, nextAcademicYearStart]);

  const groupedUpdates = useMemo(
    () =>
      updates
        .reduce<Array<{ academicYear: number | null; updates: VersionUpdate[] }>>((groups, update) => {
          const existing = groups.find((group) => group.academicYear === update.academicYear);
          if (existing) return groups.map((g) => (g === existing ? { ...g, updates: [...g.updates, update] } : g));
          return [...groups, { academicYear: update.academicYear, updates: [update] }];
        }, [])
        .sort((a, b) => {
          if (a.academicYear == null && b.academicYear == null) return 0;
          if (a.academicYear == null) return 1;
          if (b.academicYear == null) return -1;
          return a.academicYear - b.academicYear;
        }),
    [updates],
  );

  const selectedUpdates = useMemo(
    () => updates.filter((update) => selectedCourseUnitIds.has(update.course.courseUnitId)),
    [updates, selectedCourseUnitIds],
  );
  const allSelected = updates.length > 0 && selectedUpdates.length === updates.length;

  const toggleAll = () => {
    setSelectedCourseUnitIds(allSelected ? new Set() : new Set(updates.map((update) => update.course.courseUnitId)));
  };

  const toggleGroup = (groupUpdates: VersionUpdate[]) => {
    setSelectedCourseUnitIds((current) => {
      const allGroupSelected = groupUpdates.every((update) => current.has(update.course.courseUnitId));
      return groupUpdates.reduce((next, update) => {
        if (allGroupSelected) next.delete(update.course.courseUnitId);
        else next.add(update.course.courseUnitId);
        return next;
      }, new Set(current));
    });
  };

  const toggleCourse = (courseUnitId: string, checked: boolean) => {
    setSelectedCourseUnitIds((current) => {
      const next = new Set(current);
      if (checked) next.add(courseUnitId);
      else next.delete(courseUnitId);
      return next;
    });
  };

  const applyUpdates = () => {
    const nextPlan = selectedUpdates.reduce(
      (candidate, update) => swapCourseVersion(candidate, update.course.courseUnitId, update.latest.id!),
      plan,
    );
    saveStructurePlan.mutate(nextPlan, { onSuccess: onClose });
  };

  return (
    <DialogShell labelId="bulk-version-update-dialog-title" onClose={onClose} maxWidth="max-w-[740px]">
      <div className="relative flex-shrink-0 border-b border-border px-[26px] pt-6 pb-5">
        <div className="flex items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-[11px] border border-lighterGreen/35 bg-lighterGreen/12 text-lighterGreen">
            <svg className="size-5" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 12a9 9 0 0 1 15.5-6.2M21 12a9 9 0 0 1-15.5 6.2"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
              <path
                d="M18.5 3v3h-3M5.5 21v-3h3"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
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

      <div className="min-h-0 overflow-y-auto">
        {isLoading ? (
          <div className="flex h-32 items-center justify-center text-xs text-lightGrey">
            {t('dialogs.courseDetails.loading')}
          </div>
        ) : updates.length === 0 ? (
          <div className="m-[26px] rounded-[10px] border border-border bg-container2 px-4 py-5">
            <div className="text-[14px] font-semibold text-offwhite">{t('bulkUpdate.noneTitle')}</div>
            <p className="mt-1 text-[13px] leading-[1.5] text-lightGrey">{t('bulkUpdate.noneSubtitle')}</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between gap-3 border-b border-border bg-container2/70 px-[26px] py-[13px]">
              <div className="flex min-w-0 flex-wrap items-center gap-2 text-[11px] font-semibold tracking-[.07em] text-lightGrey uppercase">
                <span>{t('bulkUpdate.coursesToUpdate')}</span>
                <span className="rounded-full border border-lighterGreen/35 bg-lighterGreen/12 px-2.5 py-0.5 tracking-normal text-lighterGreen normal-case tabular-nums">
                  {t('bulkUpdate.availableCount', { count: updates.length })}
                </span>
              </div>
              <button
                type="button"
                onClick={toggleAll}
                className="flex min-h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-[7px] px-2.5 text-[12px] font-medium text-lightGrey transition-[background-color,color,transform] duration-150 hover:bg-offwhite/10 hover:text-offwhite active:scale-[0.96]"
              >
                <svg className="size-3.5" viewBox="0 0 14 14" fill="none">
                  {allSelected ? (
                    <path d="M3 7h8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                  ) : (
                    <path
                      d="M2 7l3.5 3.5L12 3"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                </svg>
                {allSelected ? t('bulkUpdate.deselectAll') : t('bulkUpdate.selectAll')}
              </button>
            </div>

            <div className="flex flex-col gap-1.5 px-[18px] pt-2 pb-3">
              {groupedUpdates.map((group) => {
                const transitions = new Set(
                  group.updates.map((u) => `${formatCourseVersion(u.current)}|${formatCourseVersion(u.latest)}`),
                );
                const uniformTransition = transitions.size === 1 ? [...transitions][0].split('|') : null;
                return (
                  <section key={group.academicYear ?? 'unscheduled'} className="flex flex-col gap-2">
                    <div className="sticky top-0 z-10 flex items-center gap-3 bg-container px-1 py-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-mono text-[13px] font-semibold tracking-[.02em] text-offwhite">
                          {group.academicYear == null
                            ? t('bulkUpdate.unscheduledGroup')
                            : formatAcademicYear(group.academicYear)}
                        </h3>
                        {uniformTransition ? (
                          <span className="font-mono text-[11px] font-medium text-darkishGrey">
                            {t('bulkUpdate.fromVersion', { version: uniformTransition[0] })}
                          </span>
                        ) : (
                          <span className="rounded-full bg-lighterGreen/12 px-2 py-0.5 text-[10.5px] font-semibold tracking-[.06em] text-lighterGreen uppercase">
                            {t('bulkUpdate.newVersionTag')}
                          </span>
                        )}
                      </div>
                      <span className="shrink-0 text-[11px] font-medium text-darkishGrey tabular-nums">
                        {group.updates.filter((update) => selectedCourseUnitIds.has(update.course.courseUnitId)).length}
                        /{group.updates.length}
                      </span>
                      <span className="h-px min-w-4 flex-1 bg-border" />
                      <button
                        type="button"
                        onClick={() => toggleGroup(group.updates)}
                        className="flex min-h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-[7px] px-2 text-[11.5px] font-medium text-lightGrey transition-[background-color,color,transform] duration-150 hover:bg-offwhite/10 hover:text-offwhite active:scale-[0.96]"
                      >
                        {group.updates.every((update) => selectedCourseUnitIds.has(update.course.courseUnitId))
                          ? t('bulkUpdate.deselectYear')
                          : t('bulkUpdate.selectYear')}
                      </button>
                    </div>
                    {group.updates.map((update) => {
                      const selected = selectedCourseUnitIds.has(update.course.courseUnitId);
                      return (
                        <label
                          key={update.course.courseUnitId}
                          className={`flex cursor-pointer items-center gap-3.5 rounded-[11px] border px-4 py-3 transition-[background-color,border-color,box-shadow,transform] duration-150 active:scale-[0.996] ${
                            selected
                              ? 'border-lighterGreen/40 bg-lighterGreen/12 shadow-[inset_0_0_0_1px_rgba(82,201,137,0.10)]'
                              : 'border-border bg-container2 text-lightGrey hover:border-border2 hover:bg-offwhite/5'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={(event) => toggleCourse(update.course.courseUnitId, event.target.checked)}
                            className="peer sr-only"
                          />
                          <span
                            className={`flex size-5 shrink-0 items-center justify-center rounded-md transition-[background-color,box-shadow,color] duration-150 ${
                              selected
                                ? 'bg-lighterGreen text-container shadow-[0_0_0_1px_rgba(82,201,137,0.8)]'
                                : 'text-transparent shadow-[inset_0_0_0_2px_rgba(255,255,255,0.10)]'
                            }`}
                            aria-hidden="true"
                          >
                            <svg className="size-3" viewBox="0 0 11 9" fill="none">
                              <path
                                d="M1 4.5l3 3L10 1"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-[14px] leading-[1.3] font-semibold text-offwhite">
                              {update.course.name ?? pickLabel(update.current.name) ?? update.current.code}
                            </div>
                            <div className="mt-0.5 font-mono text-[11px] tracking-[.02em] text-darkishGrey">
                              {update.current.code}
                            </div>
                          </div>
                          {!uniformTransition && (
                            <div className="flex shrink-0 items-center gap-2 max-sm:flex-col max-sm:items-end max-sm:gap-1">
                              <span className="inline-flex min-w-[78px] flex-col items-center gap-0.5 rounded-lg bg-container2 px-3 py-1.5 leading-none text-lightGrey">
                                <span className="text-[9px] font-semibold tracking-[.06em] uppercase opacity-70">
                                  {t('bulkUpdate.oldVersion')}
                                </span>
                                <span className="font-mono text-[12.5px] font-semibold">
                                  {formatCourseVersion(update.current)}
                                </span>
                              </span>
                              <span className="flex text-darkishGrey max-sm:rotate-90" aria-hidden="true">
                                <svg className="h-3 w-[18px]" viewBox="0 0 18 12" fill="none">
                                  <path
                                    d="M1 6h14M11 1.5L16.5 6 11 10.5"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </span>
                              <span className="inline-flex min-w-[78px] flex-col items-center gap-0.5 rounded-lg bg-lighterGreen/12 px-3 py-1.5 leading-none text-lighterGreen">
                                <span className="text-[9px] font-semibold tracking-[.06em] uppercase opacity-70">
                                  {t('bulkUpdate.newVersion')}
                                </span>
                                <span className="font-mono text-[12.5px] font-semibold">
                                  {formatCourseVersion(update.latest)}
                                </span>
                              </span>
                            </div>
                          )}
                        </label>
                      );
                    })}
                  </section>
                );
              })}
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-border bg-container px-[26px] py-4">
              <span className="text-[12.5px] text-lightGrey">
                <strong className="font-semibold text-offwhite tabular-nums">{selectedUpdates.length}</strong> /{' '}
                <strong className="font-semibold text-offwhite tabular-nums">{updates.length}</strong>{' '}
                {t('bulkUpdate.selectedCount')}
              </span>
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-10 cursor-pointer rounded-lg border border-border2 bg-container2 px-5 text-[13px] font-semibold text-offwhite transition-[background-color,transform] duration-150 hover:bg-offwhite/10 active:scale-[0.96]"
                >
                  {t('bulkUpdate.cancelButton')}
                </button>
                <button
                  type="button"
                  disabled={saveStructurePlan.isPending || selectedUpdates.length === 0}
                  onClick={applyUpdates}
                  className="flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border border-accent bg-accent px-5 text-[13px] font-semibold tracking-[.02em] text-background transition-[background-color,border-color,color,transform,opacity] duration-150 hover:bg-accent/90 active:scale-[0.96] disabled:cursor-not-allowed disabled:border-border disabled:bg-container2 disabled:text-darkishGrey disabled:active:scale-100"
                >
                  <svg className="size-3.5" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M2 7l3.5 3.5L12 3"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {selectedUpdates.length > 0
                    ? t('bulkUpdate.applySelectedButton', { count: selectedUpdates.length })
                    : t('bulkUpdate.applyButton')}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </DialogShell>
  );
};
