import React from 'react';
import type { InAppChangelogPage, InAppChangelogRelease } from '../types';
import type { AccentStyles } from '../util';
import { PauseIcon, PlayIcon, ReplayIcon } from './icons';

interface Props {
  accentStyles: AccentStyles;
  doneLabel: string;
  isLastPage: boolean;
  page: InAppChangelogPage;
  pageIndex: number;
  pageDuration: number;
  paused: boolean;
  pauseLabel: string;
  release: InAppChangelogRelease;
  replayLabel: string;
  resumeLabel: string;
  onClose: () => void;
  onPageChange: (pageIndex: number) => void;
  onPausedChange: (paused: boolean) => void;
}

export const ChangelogFooter: React.FC<Props> = ({
  accentStyles,
  doneLabel,
  isLastPage,
  page,
  pageDuration,
  pageIndex,
  paused,
  pauseLabel,
  release,
  replayLabel,
  resumeLabel,
  onClose,
  onPageChange,
  onPausedChange,
}) => (
  <footer className="absolute right-0 bottom-0 left-0 z-7 flex items-center gap-[1.6cqw] p-[0_4.2cqw_3cqw]">
    <button
      type="button"
      className="grid size-[max(30px,3.4cqw)] shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-white/10 text-[rgba(243,243,255,0.9)] hover:bg-white/20 hover:text-white [&_svg]:size-[42%]"
      aria-label={paused ? resumeLabel : pauseLabel}
      onClick={() => onPausedChange(!paused)}
    >
      {paused ? <PlayIcon /> : <PauseIcon />}
    </button>

    <div
      className="flex flex-1 items-center gap-[0.7cqw]"
      aria-label={`Page ${pageIndex + 1} of ${release.pages.length}`}
    >
      {release.pages.map((item, index) => (
        <button
          type="button"
          className="relative h-0.75 flex-1 cursor-pointer overflow-hidden rounded-full border-0 bg-white/16"
          key={item.title}
          aria-label={`Go to changelog page ${index + 1}`}
          aria-current={index === pageIndex ? 'step' : undefined}
          onClick={() => onPageChange(index)}
        >
          {index < pageIndex && (
            <span
              className="absolute inset-0 origin-left rounded-[inherit]"
              style={{
                backgroundColor: page.accent,
                transform: 'scaleX(1)',
              }}
            />
          )}
          {index === pageIndex && (
            <span
              key={`prog-${pageIndex}`}
              className="cl-prog absolute inset-0 origin-left rounded-[inherit]"
              style={{
                backgroundColor: page.accent,
                boxShadow: `0 0 10px ${accentStyles.glow}`,
                transformOrigin: 'left',
                animation: page.outro ? 'none' : `clProgressFill ${pageDuration}ms linear forwards`,
                animationPlayState: paused ? 'paused' : 'running',
                transform: page.outro ? 'scaleX(0)' : undefined,
              }}
              onAnimationEnd={() => {
                if (page.outro) return;
                if (isLastPage) onClose();
                else onPageChange(pageIndex + 1);
              }}
            />
          )}
        </button>
      ))}
    </div>

    {page.badge && (
      <span
        className="shrink-0 rounded-full px-[1.2cqw] py-[0.5cqw] font-mono text-[clamp(9px,1.05cqw,11px)] font-semibold tracking-widest whitespace-nowrap uppercase"
        style={{
          backgroundColor: accentStyles.subtle,
          boxShadow: `inset 0 0 0 1px ${accentStyles.border}`,
          color: page.accent,
        }}
      >
        {page.badge}
      </span>
    )}

    <button
      type="button"
      className="inline-flex shrink-0 cursor-pointer items-center gap-[0.7cqw] border-0 bg-transparent font-mono text-[clamp(10px,1.1cqw,12px)] font-semibold tracking-widest text-[rgba(243,243,255,0.58)] uppercase hover:text-[rgba(243,243,255,0.94)] [&_svg]:size-[max(12px,1.3cqw)]"
      onClick={() => {
        onPageChange(0);
        onPausedChange(false);
      }}
    >
      {isLastPage ? doneLabel : replayLabel}
      <ReplayIcon />
    </button>
  </footer>
);
