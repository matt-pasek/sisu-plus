import { AnimatePresence, motion } from 'motion/react';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslationWithPrefix } from '@/app/hooks/useTranslationWithPrefix';
import {
  ChangelogAurora,
  ChangelogBackdrop,
  ChangelogFooter,
  ChangelogHeader,
  ChangelogNavButton,
  ChangelogPageContent,
} from './components';
import type { InAppChangelogRelease } from './types';
import { EASE, getAccentStyles, getAccentWash } from './util';

const PAGE_DURATION = 7000;

const AURORA_STYLES = `
  @keyframes clAuroraFlow1 {
    0%   { transform: translateX(-8%) translateY(0) skewX(-8deg) scaleY(1); }
    50%  { transform: translateX(8%) translateY(4%) skewX(6deg) scaleY(1.12); }
    100% { transform: translateX(-8%) translateY(0) skewX(-8deg) scaleY(1); }
  }
  @keyframes clAuroraFlow2 {
    0%   { transform: translateX(6%) translateY(0) skewX(5deg) scaleY(1); }
    50%  { transform: translateX(-6%) translateY(-3%) skewX(-7deg) scaleY(0.94); }
    100% { transform: translateX(6%) translateY(0) skewX(5deg) scaleY(1); }
  }
  @keyframes clAuroraFlow3 {
    0%   { transform: translateX(0) translateY(-2%) skewX(3deg); }
    50%  { transform: translateX(-4%) translateY(2%) skewX(-4deg); }
    100% { transform: translateX(0) translateY(-2%) skewX(3deg); }
  }
  @keyframes clStarDrift {
    from { transform: translateY(0); }
    to   { transform: translateY(-18px); }
  }
  @keyframes clProgressFill {
    from { transform: scaleX(0); }
    to   { transform: scaleX(1); }
  }
  @media (prefers-reduced-motion: reduce) {
    .cl-aurora { animation: none !important; }
    .cl-stars  { animation: none !important; }
    .cl-prog   { animation: none !important; transform: scaleX(1) !important; }
  }
`;

interface Props {
  release: InAppChangelogRelease;
  onClose: () => void;
}

export const InAppChangelog: React.FC<Props> = ({ release, onClose }) => {
  const { t } = useTranslationWithPrefix('components.changelog');
  const [pageIndex, setPageIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [copied, setCopied] = useState(false);

  const page = release.pages[pageIndex];
  const isLastPage = pageIndex === release.pages.length - 1;
  const accentStyles = useMemo(() => getAccentStyles(page.accent), [page.accent]);

  useEffect(() => {
    if (page.outro) setPaused(true);
  }, [pageIndex, page.outro]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') setPageIndex((current) => Math.min(current + 1, release.pages.length - 1));
      if (event.key === 'ArrowLeft') setPageIndex((current) => Math.max(current - 1, 0));
      if (event.key === ' ') setPaused((current) => !current);
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, release.pages.length]);

  const handleShare = async () => {
    const text = t('ui.shareText');
    const url = 'https://sisu-plus.matt-pasek.dev';

    try {
      if (navigator.share) {
        await navigator.share({ title: 'Sisu+', text, url });
      } else {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      }
    } catch (_) {}
  };

  return (
    <>
      <style>{AURORA_STYLES}</style>
      <motion.div
        className="fixed inset-0 z-1200 grid place-items-center overflow-hidden font-sans text-offwhite max-[720px]:items-end"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sisu-changelog-title"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <ChangelogBackdrop />

        <motion.section
          className="@container relative isolate z-2 aspect-video w-[min(960px,93vw,158vh)] overflow-hidden rounded-3xl bg-[#08090d] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_60px_120px_-40px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.07)] max-[720px]:mb-3 max-[720px]:aspect-auto max-[720px]:min-h-[min(84dvh,720px)] max-[720px]:w-[min(calc(100vw-24px),560px)]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          initial={{ scale: 0.22, opacity: 0, filter: 'blur(32px)', y: 16 }}
          animate={{ scale: 1, opacity: 1, filter: 'blur(0px)', y: 0 }}
          transition={{
            scale: { type: 'spring', damping: 13, stiffness: 190, mass: 0.85 },
            y: { type: 'spring', damping: 16, stiffness: 220 },
            filter: { duration: 0.58, ease: EASE },
            opacity: { duration: 0.18, ease: 'easeOut' },
          }}
        >
          <motion.div
            className="pointer-events-none absolute inset-0 z-20 rounded-[inherit]"
            aria-hidden="true"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.2, 0, 0, 1], delay: 0.05 }}
            style={{
              background: `radial-gradient(60% 60% at 50% 50%, ${getAccentWash(page.accent, 0.55)} 0%, rgba(255,255,255,0.06) 55%, transparent 100%)`,
            }}
          />
          <ChangelogAurora accent={page.accent} />
          <div
            className="pointer-events-none absolute inset-0 z-2"
            aria-hidden="true"
            style={{
              backgroundImage:
                'linear-gradient(90deg, rgba(6,7,11,0.86) 0%, rgba(6,7,11,0.46) 44%, rgba(6,7,11,0) 72%), linear-gradient(0deg, rgba(6,7,11,0.72) 0%, transparent 48%)',
            }}
          />

          <ChangelogHeader
            closeLabel={t('ui.close')}
            version={release.version}
            whatsNewLabel={t('ui.whatsNew')}
            onClose={onClose}
          />

          {pageIndex > 0 && (
            <ChangelogNavButton
              direction="previous"
              label={t('ui.prevPage')}
              onClick={() => setPageIndex((current) => Math.max(current - 1, 0))}
            />
          )}
          {!isLastPage && (
            <ChangelogNavButton
              direction="next"
              label={t('ui.nextPage')}
              onClick={() => setPageIndex((current) => Math.min(current + 1, release.pages.length - 1))}
            />
          )}

          <AnimatePresence mode="wait" initial={false}>
            <ChangelogPageContent
              accentStyles={accentStyles}
              allOtherUniversitiesLabel={t('ui.allOtherUniversities')}
              copied={copied}
              exploreNewLabel={t('ui.exploreNew')}
              linkCopiedLabel={t('ui.linkCopied')}
              maybeLaterLabel={t('ui.maybeLater')}
              page={page}
              pageIndex={pageIndex}
              tellFriendsLabel={t('ui.tellFriends')}
              onClose={onClose}
              onShare={handleShare}
            />
          </AnimatePresence>

          <ChangelogFooter
            accentStyles={accentStyles}
            doneLabel={t('ui.done')}
            isLastPage={isLastPage}
            page={page}
            pageDuration={PAGE_DURATION}
            pageIndex={pageIndex}
            paused={paused}
            pauseLabel={t('ui.pause')}
            release={release}
            replayLabel={t('ui.replay')}
            resumeLabel={t('ui.resume')}
            onClose={onClose}
            onPageChange={setPageIndex}
            onPausedChange={setPaused}
          />
        </motion.section>
      </motion.div>
    </>
  );
};
