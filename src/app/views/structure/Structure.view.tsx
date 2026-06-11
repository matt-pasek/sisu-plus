import React, { useEffect, useRef, useState } from 'react';
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
      sectionRefs.current.get(moduleId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto flex max-w-275 flex-col gap-6 pb-10">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-2xl leading-tight font-semibold text-balance text-offwhite">{t('pageTitle')}</h1>
                <p className="mt-1 text-sm text-pretty text-lightGrey">{t('pageSubtitle')}</p>
              </div>
              <div className="flex shrink-0 gap-2">
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
            </header>
            <div className="flex flex-col gap-5 lg:flex-row lg:items-stretch">
              <PlanHeader
                degreeMinimumCredits={data.degreeMinimumCredits}
                planName={data.planName}
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
              {data.sections.map((section) => {
                const color = getModuleColorObject(section.moduleId);
                const isOpen = expandedSections.has(section.moduleId);

                return (
                  <section
                    key={section.moduleId}
                    ref={(node) => {
                      if (node) sectionRefs.current.set(section.moduleId, node);
                      else sectionRefs.current.delete(section.moduleId);
                    }}
                    className={`scroll-mt-5 overflow-hidden rounded-[10px] bg-container shadow-[0_0_0_1px_rgba(255,255,255,0.07),0_12px_32px_rgba(0,0,0,0.16)] ${color.bgDim}`}
                  >
                    <SectionHeader
                      color={color}
                      isOpen={isOpen}
                      section={section}
                      onToggle={() => toggleSection(section.moduleId)}
                    />
                    {isOpen && isEditing && draftPlan && (
                      <SectionEditPanel
                        color={color}
                        draftPlan={draftPlan}
                        section={section}
                        onDraftPlanChange={setDraftPlan}
                      />
                    )}
                    {isOpen && (
                      <SectionBody
                        color={color}
                        courses={section.courses}
                        onMethodClick={setMethodDialogCourse}
                        onDetailsClick={setAttainmentDialogCourse}
                        onCardClick={setDetailsDialogCourse}
                      />
                    )}
                  </section>
                );
              })}
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
