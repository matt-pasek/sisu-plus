import React, { useEffect, useRef, useState } from 'react';
import { getStructureData } from '@/app/api/dataPoints/getStructureData';
import { InlineError } from '@/app/components/InlineError.comp';
import { SpinnerLoader } from '@/app/components/ui/SpinnerLoader.comp';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { MODULE_COLORS } from '@/app/theme/moduleColors';
import { CategorySidebar } from '@/app/views/structure/components/CategorySidebar.comp';
import { PlanHeader } from '@/app/views/structure/components/PlanHeader.comp';
import { SectionBody } from '@/app/views/structure/components/SectionBody.comp';
import { SectionEditPanel } from '@/app/views/structure/components/SectionEditPanel.comp';
import { SectionHeader } from '@/app/views/structure/components/SectionHeader.comp';
import { useStructurePlanMutation } from '@/app/views/structure/editing/useStructurePlanMutation';
import type { Plan } from '@/app/api/generated/OsuvaApi';

const StructureView: React.FC = () => {
  const { t } = useTranslationWithPrefix('views.structure');
  const { data, isLoading } = getStructureData();
  const saveStructurePlan = useStructurePlanMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [draftPlan, setDraftPlan] = useState<Plan | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const sectionRefs = useRef(new Map<string, HTMLElement>());

  useEffect(() => {
    if (!data?.sections.length) return;
    setExpandedSections((current) => (current.size > 0 ? current : new Set([data.sections[0].moduleId])));
  }, [data?.sections]);

  useEffect(() => {
    if (!isEditing) setDraftPlan(data?.plan ?? null);
  }, [data?.plan, isEditing]);

  if (isLoading) return <SpinnerLoader />;

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
    <main className="flex flex-1 overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1100px] flex-col gap-6">
          <div className="flex flex-wrap items-center justify-end gap-2">
            {isEditing ? (
              <>
                <button
                  className="rounded-md px-4 py-2 text-sm font-bold text-lightGrey transition-colors hover:bg-container2"
                  type="button"
                  onClick={cancelEditing}
                >
                  {t('edit.cancel')}
                </button>
                <button
                  className="rounded-md bg-accent px-4 py-2 text-sm font-bold text-offwhite transition-[opacity,scale] hover:opacity-90 active:scale-[0.97] disabled:opacity-50"
                  type="button"
                  disabled={saveStructurePlan.isPending}
                  onClick={saveEditing}
                >
                  {saveStructurePlan.isPending ? t('edit.saving') : t('edit.save')}
                </button>
              </>
            ) : (
              <button
                className="rounded-md bg-container px-4 py-2 text-sm font-bold text-offwhite shadow-[0_0_0_1px_rgba(255,255,255,0.07)] transition-colors hover:bg-container2"
                type="button"
                onClick={startEditing}
              >
                {t('edit.edit')}
              </button>
            )}
          </div>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-stretch">
            <PlanHeader
              degreeMinimumCredits={data.degreeMinimumCredits}
              planName={data.planName}
              studyRightUntil={data.studyRightUntil}
              totalCompleted={data.totalCompleted}
              totalTarget={data.totalTarget}
            />
            <CategorySidebar colors={MODULE_COLORS} sections={data.sections} onSectionClick={focusSection} />
          </div>

          <div className="flex flex-col gap-3">
            {data.sections.map((section, index) => {
              const color = MODULE_COLORS[index % MODULE_COLORS.length];
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
                  {isOpen && <SectionBody color={color} courses={section.courses} />}
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
};

export default StructureView;
