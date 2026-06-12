import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { getStructureData } from '@/app/api/dataPoints/getStructureData';
import { InlineError } from '@/app/components/InlineError.comp';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { getModuleColorObject } from '@/app/theme/moduleColors';
import { CategorySidebar } from '@/app/views/structure/components/CategorySidebar.comp';
import { PlanHeader } from '@/app/views/structure/components/PlanHeader.comp';
import { SectionBody } from '@/app/views/structure/components/SectionBody.comp';
import { SectionEditPanel } from '@/app/views/structure/components/SectionEditPanel.comp';
import { SectionHeader } from '@/app/views/structure/components/SectionHeader.comp';
import { Button } from '@/app/components/ui/Button.comp';
import { CompletionMethodDialog } from '@/app/views/structure/components/CompletionMethodDialog.comp';
import { AttainmentDialog } from '@/app/views/structure/components/AttainmentDialog.comp';
import { CourseDetailsDialog } from '@/app/views/structure/components/CourseDetailsDialog.comp';
import { BulkVersionUpdateDialog } from '@/app/views/structure/components/BulkVersionUpdateDialog.comp';
import { BulkVersionUpdatePanel } from '@/app/views/structure/components/BulkVersionUpdatePanel.comp';
import type { Plan } from '@/app/api/generated/OsuvaApi';
import { useStructurePlanMutation } from '@/app/views/structure/hooks/useStructurePlanMutation';
import { CourseEntry } from '@/app/views/structure/types';
import { PageLoader } from '@/app/components/PageLoader.comp';

const StructureView: React.FC = () => {
  const { t } = useTranslationWithPrefix('views.structure');
  const { data, isLoading } = getStructureData();
  const saveStructurePlan = useStructurePlanMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [draftPlan, setDraftPlan] = useState<Plan | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [methodDialogCourse, setMethodDialogCourse] = useState<CourseEntry | null>(null);
  const [attainmentDialogCourse, setAttainmentDialogCourse] = useState<CourseEntry | null>(null);
  const [detailsDialogCourse, setDetailsDialogCourse] = useState<CourseEntry | null>(null);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const sectionRefs = useRef(new Map<string, HTMLElement>());
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!data?.sections.length) return;
    setExpandedSections((current) => (current.size > 0 ? current : new Set([data.sections[0].moduleId])));
  }, [data?.sections]);

  useEffect(() => {
    if (!isEditing) setDraftPlan(data?.plan ?? null);
  }, [data?.plan, isEditing]);

  if (isLoading) return <PageLoader />;

  if (!data || data.sections.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <InlineError endpoint="structure" error={new Error(t('errors.noPlan'))} />
      </div>
    );
  }

  const toggleSection = (moduleId: string) => {
    setExpandedSections((current) => {
      const next = new Set(current);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  };

  const focusSection = (moduleId: string) => {
    setExpandedSections((current) => new Set(current).add(moduleId));
    window.requestAnimationFrame(() => {
      sectionRefs.current
        .get(moduleId)
        ?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    });
  };

  const startEditing = () => {
    setDraftPlan(data.plan);
    setIsEditing(true);
    setExpandedSections(new Set(data.sections.map((section) => section.moduleId)));
  };

  const cancelEditing = () => {
    setDraftPlan(data.plan);
    setIsEditing(false);
  };

  const saveEditing = () => {
    if (!draftPlan) return;
    saveStructurePlan.mutate(draftPlan, {
      onSuccess: () => setIsEditing(false),
    });
  };

  return (
    <>
      <main className="flex flex-1 overflow-hidden">
        <div className="sisu-structure flex-1 overflow-y-auto bg-[radial-gradient(120%_60%_at_100%_-10%,rgba(65,150,72,0.05),transparent_55%),var(--color-background)]">
          <div className="mx-auto flex flex-col gap-4.5 pb-18">
            <motion.header
              className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              initial={prefersReducedMotion ? false : { opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold tracking-[0.14em] text-lightGrey uppercase">
                <span className="size-1.5 rounded-full bg-lighterGreen shadow-[0_0_10px_rgba(82,201,137,0.7)]" />
                {t('pageTitle')} &middot; <b className="font-bold text-offwhite">{t('header.planLabel')}</b>
              </span>
              <div className="flex shrink-0 gap-2 sm:justify-end">
                {isEditing ? (
                  <>
                    <Button onClick={cancelEditing}>{t('edit.cancel')}</Button>
                    <Button variant="accent" disabled={saveStructurePlan.isPending} onClick={saveEditing}>
                      {saveStructurePlan.isPending ? t('edit.saving') : t('edit.save')}
                    </Button>
                  </>
                ) : (
                  <Button onClick={startEditing}>{t('edit.edit')}</Button>
                )}
              </div>
            </motion.header>

            <div className="flex flex-col gap-4.5">
              <PlanHeader
                degreeMinimumCredits={data.degreeMinimumCredits}
                planName={data.planName}
                planModifiedOn={data.planModifiedOn}
                curriculumPeriodName={data.curriculumPeriodName}
                degreeProgramName={data.degreeProgramName}
                sections={data.sections}
                studyRightUntil={data.studyRightUntil}
                totalCompleted={data.totalCompleted}
                totalTarget={data.totalTarget}
              />
              <CategorySidebar sections={data.sections} onSectionClick={focusSection} />
            </div>

            <div className="flex flex-col gap-3">
              {!isEditing && (
                <BulkVersionUpdatePanel
                  plan={data.plan}
                  sections={data.sections}
                  onOpen={() => setBulkDialogOpen(true)}
                />
              )}
              <div className="mt-3 font-mono text-[11px] font-semibold tracking-[0.14em] text-lightGrey uppercase">
                Modules &amp; courses
              </div>
              <div className="flex flex-col gap-3 px-1">
                {data.sections.map((section) => {
                  const color = getModuleColorObject(section.moduleId);
                  const isOpen = expandedSections.has(section.moduleId);

                  return (
                    <motion.section
                      key={section.moduleId}
                      layout="position"
                      ref={(node) => {
                        if (node) sectionRefs.current.set(section.moduleId, node);
                        else sectionRefs.current.delete(section.moduleId);
                      }}
                      className="scroll-mt-5 overflow-hidden rounded-[14px] bg-container shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_16px_42px_-30px_rgba(0,0,0,0.85)]"
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <SectionHeader
                        color={color}
                        isOpen={isOpen}
                        section={section}
                        onToggle={() => toggleSection(section.moduleId)}
                      />
                      <AnimatePresence initial={false}>
                        {isOpen && isEditing && draftPlan && (
                          <motion.div
                            key="section-edit"
                            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
                            transition={{ duration: prefersReducedMotion ? 0.01 : 0.18, ease: [0.22, 1, 0.36, 1] }}
                          >
                            <SectionEditPanel
                              color={color}
                              draftPlan={draftPlan}
                              section={section}
                              onDraftPlanChange={setDraftPlan}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            key="section-body"
                            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -8, filter: 'blur(4px)' }}
                            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -6, filter: 'blur(2px)' }}
                            transition={{ duration: prefersReducedMotion ? 0.01 : 0.2, ease: [0.22, 1, 0.36, 1] }}
                          >
                            <SectionBody
                              color={color}
                              courses={section.courses}
                              onMethodClick={setMethodDialogCourse}
                              onDetailsClick={setAttainmentDialogCourse}
                              onCardClick={setDetailsDialogCourse}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.section>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      {methodDialogCourse && (
        <CompletionMethodDialog
          course={methodDialogCourse}
          plan={data.plan}
          onClose={() => setMethodDialogCourse(null)}
        />
      )}
      {attainmentDialogCourse && (
        <AttainmentDialog course={attainmentDialogCourse} onClose={() => setAttainmentDialogCourse(null)} />
      )}
      {detailsDialogCourse && (
        <CourseDetailsDialog
          course={detailsDialogCourse}
          planId={data.planId}
          onClose={() => setDetailsDialogCourse(null)}
          onAttainmentClick={() => {
            setAttainmentDialogCourse(detailsDialogCourse);
            setDetailsDialogCourse(null);
          }}
        />
      )}
      {bulkDialogOpen && (
        <BulkVersionUpdateDialog plan={data.plan} sections={data.sections} onClose={() => setBulkDialogOpen(false)} />
      )}
    </>
  );
};

export default StructureView;
