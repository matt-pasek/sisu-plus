import React, { useState } from 'react';
import { useShareLink } from '@/app/api/dataPoints/calendar/useShareLink';
import { getUserDetails } from '@/app/api/dataPoints/getUserDetails';
import { notify } from '@/app/components/ui/notify';
import { Panel } from '@/app/components/ui/Panel.comp';
import { PanelEyebrow } from '@/app/components/ui/PanelEyebrow.comp';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import { SECTION_TITLE_CLASS } from '../constants/sectionTitle.const';
import { shareFeedUrl, shareLanguage } from '../util';
import { CopyField } from './CopyField.comp';
import { ExportSteps } from './ExportSteps.comp';
import { CloseIcon } from './icons';
import { LayerProblem } from './LayerProblem.comp';

const LINK_BUTTON = 'cursor-pointer text-[12.5px] font-medium underline-offset-2 hover:underline';

interface Props {
  moodleUrl: string | null;
  locale: string;
  onConnectMoodle: () => void;
  onClose: () => void;
}

export const ExportInspector: React.FC<Props> = ({ moodleUrl, locale, onConnectMoodle, onClose }) => {
  const { t } = useTranslationWithPrefix('views.calendar');
  const [confirming, setConfirming] = useState(false);
  const { userDetails } = getUserDetails();
  const link = useShareLink(userDetails?.id ?? null, shareLanguage(locale), {
    onResetDone: () => notify.success(t('exportPanel.resetDone')),
    onResetFailed: () => notify.error(t('exportPanel.resetFailed')),
  });
  const list = (keys: string[]) => (
    <ul className="mt-1 flex flex-col gap-0.5 text-[12.5px] text-offwhite">
      {keys.map((key) => (
        <li key={key}>{t(`exportPanel.${key}`)}</li>
      ))}
    </ul>
  );

  return (
    <Panel
      className="max-lg:fixed max-lg:inset-x-4 max-lg:bottom-4 max-lg:z-40 max-lg:max-h-[60dvh]"
      header={
        <>
          <div className="min-w-0">
            <PanelEyebrow>{t('exportPanel.eyebrow')}</PanelEyebrow>
            <p className="truncate text-sm font-semibold text-offwhite">{t('exportPanel.title')}</p>
          </div>
          <button
            type="button"
            aria-label={t('actions.close')}
            onClick={onClose}
            className="relative cursor-pointer rounded-md p-1 text-lightGrey transition-colors duration-150 after:absolute after:-inset-2 after:content-[''] hover:text-offwhite"
          >
            <CloseIcon className="size-4" />
          </button>
        </>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-4 py-3.5">
        <section className="flex flex-col gap-1.5">
          {link.isLoading ? (
            <p className="text-[12.5px] text-lightGrey">{t('exportPanel.loading')}</p>
          ) : link.isError || !link.token ? (
            <LayerProblem text={t('exportPanel.failed')} retryLabel={t('exportPanel.retry')} onRetry={link.retry} />
          ) : (
            <CopyField label={t('exportPanel.linkLabel')} value={shareFeedUrl(window.location.origin, link.token)} />
          )}
          <p className="text-[11.5px] text-lightGrey">{t('exportPanel.privacy')}</p>
        </section>
        <section className="grid grid-cols-2 gap-3">
          <div>
            <h4 className={SECTION_TITLE_CLASS}>{t('exportPanel.includedTitle')}</h4>
            {list(['includedGroups', 'includedExams', 'includedNotes'])}
          </div>
          <div>
            <h4 className={SECTION_TITLE_CLASS}>{t('exportPanel.notIncludedTitle')}</h4>
            {list(['notIncludedSwaps', 'notIncludedLinked', 'notIncludedMoodle'])}
          </div>
        </section>
        <section>
          <h4 className={SECTION_TITLE_CLASS}>{t('exportPanel.howTitle')}</h4>
          <div className="mt-1">
            <ExportSteps />
          </div>
          <p className="mt-2 text-[11.5px] text-lightGrey">{t('exportPanel.refreshNote')}</p>
        </section>
        <section className="flex flex-col gap-1.5">
          {moodleUrl ? (
            <>
              <CopyField label={t('exportPanel.moodleTitle')} value={moodleUrl} />
              <p className="text-[11.5px] text-lightGrey">{t('exportPanel.moodleHint')}</p>
            </>
          ) : (
            <>
              <h4 className={SECTION_TITLE_CLASS}>{t('exportPanel.moodleTitle')}</h4>
              <button type="button" onClick={onConnectMoodle} className={`${LINK_BUTTON} w-fit text-lighterGreen`}>
                {t('deadlines.connect')}
              </button>
            </>
          )}
        </section>
        {link.token && (
          <section className="flex flex-wrap items-center gap-3 border-t border-border pt-3">
            {confirming ? (
              <>
                <p className="w-full text-[12.5px] text-offwhite">{t('exportPanel.resetQuestion')}</p>
                <button
                  type="button"
                  disabled={link.isResetting}
                  onClick={() => {
                    link.reset();
                    setConfirming(false);
                  }}
                  className={`${LINK_BUTTON} text-warn`}
                >
                  {t('exportPanel.resetConfirm')}
                </button>
                <button type="button" onClick={() => setConfirming(false)} className={`${LINK_BUTTON} text-lightGrey`}>
                  {t('exportPanel.resetCancel')}
                </button>
              </>
            ) : (
              <button
                type="button"
                disabled={link.isResetting}
                onClick={() => setConfirming(true)}
                className={`${LINK_BUTTON} text-lightGrey disabled:cursor-wait disabled:opacity-50`}
              >
                {t('exportPanel.reset')}
              </button>
            )}
          </section>
        )}
      </div>
    </Panel>
  );
};
