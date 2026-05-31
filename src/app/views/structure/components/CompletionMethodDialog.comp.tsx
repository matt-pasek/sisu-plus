import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/app/components/ui/Button.comp';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { useCourseUnit } from '@/app/views/structure/hooks/useCourseUnit';
import { useStructurePlanMutation } from '@/app/views/structure/editing/useStructurePlanMutation';
import { setCompletionMethod } from '@/app/views/structure/editing/structurePlanDraft';
import { DialogShell, DialogCloseButton } from './DialogShell.comp';
import type { CourseEntry } from '@/app/views/structure/structureTypes';
import type { CompletionMethod } from '@/app/api/generated/KoriApi';
import type { Plan } from '@/app/api/generated/OsuvaApi';
import { pickLabel } from '@/app/api/resolvers/helpers/pickLabel';

interface Props {
  course: CourseEntry;
  plan: Plan;
  onClose: () => void;
}

export const CompletionMethodDialog: React.FC<Props> = ({ course, plan, onClose }) => {
  const { t } = useTranslationWithPrefix('views.structure.dialogs');
  const { data: unit, isLoading } = useCourseUnit(course.courseUnitId);
  const mutation = useStructurePlanMutation();
  const queryClient = useQueryClient();
  const methods = (unit?.completionMethods ?? []).filter((m) => m.studyType === 'DEGREE_STUDIES');

  const [selectedIndex, setSelectedIndex] = useState<number>(() => {
    if (!course.completionMethodId) return 0;
    const idx = (unit?.completionMethods ?? []).findIndex((m) => m.localId === course.completionMethodId);
    return idx >= 0 ? idx : 0;
  });

  const courseName = course.name ?? course.code ?? course.courseUnitId;
  const courseCode = course.code ?? course.courseUnitId;

  const handleConfirm = () => {
    const selectedMethod = methods[selectedIndex];
    if (!selectedMethod?.localId) return;
    mutation.mutate(setCompletionMethod(plan, course.courseUnitId, selectedMethod.localId), {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ['plans'] });
        await queryClient.invalidateQueries({ queryKey: ['structure-data'] });
        onClose();
      },
    });
  };

  return (
    <DialogShell labelId="method-dialog-title" onClose={onClose}>
      <header className="flex items-start justify-between gap-5 border-b border-border px-5 py-5">
        <div>
          <h2 id="method-dialog-title" className="text-lg font-semibold text-balance text-offwhite">
            {t('completionMethod.title')}
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-pretty text-lightGrey">{t('completionMethod.description')}</p>
        </div>
        <DialogCloseButton label={t('close')} onClose={onClose} />
      </header>

      <div className="min-h-0 overflow-y-auto">
        <section className="grid gap-x-7 gap-y-1.5 border-b border-border bg-container2/70 px-5 py-4 text-xs sm:grid-cols-[7rem_minmax(0,1fr)]">
          <p className="font-semibold tracking-wide text-lightGrey uppercase">{t('completionMethod.courseLabel')}</p>
          <p className="font-semibold text-[#7ea0ff]">
            {courseCode} · {courseName}
          </p>
          <p className="font-semibold tracking-wide text-lightGrey uppercase">{t('completionMethod.creditsLabel')}</p>
          <p className="text-lightGrey">{course.credits ?? unit?.credits?.min ?? '–'} cr</p>
        </section>

        <section className="space-y-3 px-5 py-5">
          <h3 className="text-sm font-semibold text-offwhite">{t('completionMethod.methodsHeading')}</h3>

          {isLoading && (
            <div className="flex h-20 items-center justify-center">
              <span className="text-xs text-lightGrey">{t('courseDetails.loading')}</span>
            </div>
          )}

          {!isLoading && methods.length === 0 && <p className="text-xs text-lightGrey">{t('courseDetails.noData')}</p>}

          {methods.map((method, index) => (
            <MethodOption
              key={method.localId}
              method={method}
              index={index}
              selected={selectedIndex === index}
              credits={course.credits ?? unit?.credits?.min ?? null}
              onSelect={() => setSelectedIndex(index)}
            />
          ))}

          <div className="rounded-[10px] bg-container2 px-4 py-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.07)]">
            <p className="text-xs font-semibold text-offwhite">{t('completionMethod.whatNextHeading')}</p>
            <p className="mt-2 text-xs leading-relaxed text-pretty text-lightGrey">
              {t('completionMethod.whatNextBody')}
            </p>
          </div>
        </section>
      </div>

      <footer className="flex justify-end gap-2 border-t border-border px-5 py-4">
        <Button
          variant="onSurface"
          className="min-w-28 text-xs font-semibold"
          onClick={onClose}
          disabled={mutation.isPending}
        >
          {t('completionMethod.cancel')}
        </Button>
        <Button
          className="min-w-28 text-xs font-semibold"
          onClick={handleConfirm}
          disabled={isLoading || methods.length === 0 || mutation.isPending}
        >
          {mutation.isPending ? t('completionMethod.saving') : t('completionMethod.confirm')}
        </Button>
      </footer>
    </DialogShell>
  );
};

const MethodOption: React.FC<{
  method: CompletionMethod;
  index: number;
  selected: boolean;
  credits: number | null;
  onSelect: () => void;
}> = ({ method, index, selected, credits, onSelect }) => {
  const description = pickLabel((method.description as Record<string, string>) ?? {});
  const itemCount = method.assessmentItemIds?.length ?? 0;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full gap-3 rounded-[9px] p-3 text-left transition-[background-color,box-shadow,transform] duration-150 active:scale-[0.99] ${
        selected
          ? 'bg-accent/15 shadow-[inset_0_0_0_1px_rgba(65,150,72,0.55)]'
          : 'bg-container2 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)] hover:bg-offwhite/5'
      }`}
    >
      <span
        className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
          selected ? 'border-accent bg-accent' : 'border-lightGrey/40'
        }`}
      >
        {selected && <span className="size-2 rounded-full bg-background" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm leading-snug font-semibold text-offwhite">
          Completion method {index + 1}
          {credits != null ? ` (${credits} cr)` : ''}
        </span>
        {description && (
          <span
            className="mt-1 block text-xs leading-relaxed text-lightGrey"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        )}
        {itemCount > 0 && (
          <span className="mt-1.5 block text-xs text-lightGrey">
            {itemCount} assessment item{itemCount !== 1 ? 's' : ''}
          </span>
        )}
      </span>
    </button>
  );
};
