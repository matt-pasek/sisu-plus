import React from 'react';
import { Panel } from '@/app/components/ui/Panel.comp';
import { PanelEyebrow } from '@/app/components/ui/PanelEyebrow.comp';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { getModuleColor } from '@/app/theme/moduleColors';
import type { TimelineModule } from '@/app/views/timeline/util/sidebarLists';

interface Props {
  modules: TimelineModule[];
}

export const ModulesPanel: React.FC<Props> = ({ modules }) => {
  const { t } = useTranslationWithPrefix('views.timeline');

  return (
    <Panel
      className="shrink-0 max-lg:max-h-full max-lg:max-w-[360px] max-lg:min-w-[260px]"
      header={<PanelEyebrow>{t('sidebar.modules')}</PanelEyebrow>}
    >
      <ul className="grid gap-2 px-4 py-3 max-lg:min-h-0 max-lg:overflow-y-auto">
        {modules.map((module) => (
          <li key={module.id} className="flex min-w-0 items-center gap-2.5 text-xs text-offwhite">
            <span
              aria-hidden="true"
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: getModuleColor(module.id) }}
            />
            <span className="truncate">{module.name}</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
};
