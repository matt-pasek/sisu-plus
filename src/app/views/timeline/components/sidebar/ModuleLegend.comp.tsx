import React from 'react';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { getModuleColor } from '@/app/theme/moduleColors';
import { getShortModuleName, type TimelineModule } from '@/app/views/timeline/util/sidebarLists';

interface Props {
  modules: TimelineModule[];
}

export const ModuleLegend: React.FC<Props> = ({ modules }) => {
  const { t } = useTranslationWithPrefix('views.timeline');

  return (
    <ul
      aria-label={t('sidebar.modules')}
      className="flex shrink-0 flex-wrap gap-x-3 gap-y-1.5 border-b border-border px-4 py-2.5"
    >
      {modules.map((module) => (
        <li
          key={module.id}
          title={module.name}
          className="flex min-w-0 items-center gap-1.5 text-[11px] text-lightGrey"
        >
          <span
            aria-hidden="true"
            className="size-2 shrink-0 rounded-full"
            style={{ backgroundColor: getModuleColor(module.id) }}
          />
          <span aria-hidden="true" className="max-w-[16ch] truncate">
            {getShortModuleName(module.name)}
          </span>
          <span className="sr-only">{module.name}</span>
        </li>
      ))}
    </ul>
  );
};
