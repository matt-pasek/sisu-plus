import React from 'react';
import { Panel } from '@/app/components/ui/Panel.comp';
import { PanelEyebrow } from '@/app/components/ui/PanelEyebrow.comp';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import type { TimelineIssue } from '@/app/views/timeline/util/sidebarLists';

interface Props {
  issues: TimelineIssue[];
  onSelect: (courseUnitId: string) => void;
}

export const SchedulingIssuesPanel: React.FC<Props> = ({ issues, onSelect }) => {
  const { t } = useTranslationWithPrefix('views.timeline');

  if (issues.length === 0) return null;

  return (
    <Panel
      className="shrink-0 ring-1 ring-[rgba(240,168,77,0.35)] ring-inset max-lg:max-h-full max-lg:max-w-[360px] max-lg:min-w-[260px]"
      header={<PanelEyebrow>{t('sidebar.issues', { count: issues.length })}</PanelEyebrow>}
    >
      <ul className="grid gap-0.5 p-2 max-lg:min-h-0 max-lg:overflow-y-auto">
        {issues.map(({ courseUnitId, courseName, warning }) => (
          <li key={`${courseUnitId}:${warning.id}`}>
            <button
              type="button"
              onClick={() => onSelect(courseUnitId)}
              className="w-full cursor-pointer rounded-md px-2 py-1.5 text-left text-xs leading-snug text-pretty text-lightGrey transition-colors duration-150 hover:bg-container2 hover:text-offwhite focus-visible:outline-2 focus-visible:outline-lighterGreen"
            >
              <span className="font-semibold text-warn">{courseName}</span>: {warning.message}
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  );
};
