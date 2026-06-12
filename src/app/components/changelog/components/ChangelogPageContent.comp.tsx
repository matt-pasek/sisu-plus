import { motion } from 'motion/react';
import React from 'react';
import type { InAppChangelogPage } from '../types';
import type { AccentStyles } from '../util';
import { containerVariants, EASE, itemVariants } from '../util';
import { ChangelogMock } from './ChangelogMock.comp';
import { ChevronRightIcon, ShareIcon } from './icons';

interface Props {
  accentStyles: AccentStyles;
  allOtherUniversitiesLabel: string;
  copied: boolean;
  exploreNewLabel: string;
  linkCopiedLabel: string;
  maybeLaterLabel: string;
  page: InAppChangelogPage;
  pageIndex: number;
  tellFriendsLabel: string;
  onClose: () => void;
  onShare: () => void;
}

export const ChangelogPageContent: React.FC<Props> = ({
  accentStyles,
  allOtherUniversitiesLabel,
  copied,
  exploreNewLabel,
  linkCopiedLabel,
  maybeLaterLabel,
  page,
  pageIndex,
  tellFriendsLabel,
  onClose,
  onShare,
}) => (
  <motion.div
    key={pageIndex}
    className="absolute inset-0 z-3 grid items-center gap-[3cqw] p-[9cqw_5.5cqw_9cqw_5.5cqw] max-[720px]:content-center max-[720px]:gap-6 max-[720px]:p-[82px_24px_88px]"
    style={{
      gridTemplateColumns: page.mockup === 'none' ? '1fr' : '1.08fr 0.92fr',
    }}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0, transition: { duration: 0.18 } }}
    transition={{ duration: 0.25 }}
  >
    <motion.div
      className="flex min-w-0 flex-col gap-[2.2cqw] max-[720px]:gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.p
        className="flex items-center gap-[1.3cqw] font-mono text-[clamp(11px,1.45cqw,15px)] font-semibold tracking-widest uppercase"
        style={{ color: page.accent }}
        variants={itemVariants}
      >
        <span className="h-px w-[5cqw]" style={{ backgroundColor: accentStyles.border }} />
        {page.eyebrow}
      </motion.p>

      <motion.h2
        id="sisu-changelog-title"
        className="text-[clamp(34px,5.1cqw,58px)] leading-[0.98] font-bold text-balance shadow-black/40 [text-shadow:0_2px_30px_rgba(0,0,0,0.45)] max-[720px]:text-[clamp(34px,12vw,52px)]"
        variants={itemVariants}
      >
        {page.titlePrefix && <span className="block text-[#f3f3ff]">{page.titlePrefix}</span>}
        <span style={{ color: page.titleSuffix ? '#f3f3ff' : page.titlePrefix ? page.accent : '#f3f3ff' }}>
          {page.title}
        </span>
        {page.titleSuffix && <span style={{ color: page.accent }}>{page.titleSuffix}</span>}
      </motion.h2>

      <motion.p
        className="max-w-[33ch] text-[clamp(15px,1.72cqw,19px)] leading-normal text-pretty text-[rgba(243,243,255,0.78)] max-[720px]:text-base"
        variants={itemVariants}
      >
        {page.body}
      </motion.p>

      {page.outro ? (
        <motion.div className="flex flex-wrap gap-[1.2cqw] max-[720px]:gap-3" variants={itemVariants}>
          <motion.button
            type="button"
            className="inline-flex cursor-pointer items-center gap-[0.7cqw] rounded-[14px] border-0 px-[2.2cqw] py-[1.2cqw] font-sans text-[clamp(13px,1.6cqw,16px)] font-semibold text-[#06180f] shadow-[0_14px_32px_-10px_rgba(65,150,72,0.8)] [&_svg]:size-[max(13px,1.4cqw)]"
            style={{ backgroundColor: page.accent }}
            onClick={onClose}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            transition={{ ease: EASE, duration: 0.2 }}
          >
            {page.primaryCta ?? exploreNewLabel}
            <ChevronRightIcon />
          </motion.button>
          <motion.button
            type="button"
            className="inline-flex cursor-pointer items-center rounded-[14px] border-0 bg-white/10 px-[2.2cqw] py-[1.2cqw] font-sans text-[clamp(13px,1.6cqw,16px)] font-semibold text-[rgba(243,243,255,0.78)] hover:bg-white/16"
            onClick={onClose}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            transition={{ ease: EASE, duration: 0.2 }}
          >
            {maybeLaterLabel}
          </motion.button>
        </motion.div>
      ) : (
        <motion.div className="flex flex-wrap gap-[1.2cqw] max-[720px]:gap-2" variants={itemVariants}>
          {page.tags.map((tag) => (
            <span
              className="rounded-full p-[0.8cqw_1.4cqw] font-mono text-[clamp(10px,1.2cqw,12px)] font-semibold tracking-wider whitespace-nowrap uppercase max-[720px]:p-[7px_10px]"
              key={tag}
              style={{
                backgroundColor: accentStyles.subtle,
                boxShadow: `inset 0 0 0 1px ${accentStyles.border}`,
                color: page.accent,
              }}
            >
              {tag}
            </span>
          ))}
        </motion.div>
      )}

      {page.showShare && (
        <motion.div className="flex flex-wrap gap-[1cqw] max-[720px]:gap-2" variants={itemVariants}>
          <motion.button
            type="button"
            className="inline-flex cursor-pointer items-center gap-[0.7cqw] rounded-[14px] border-0 px-[2cqw] py-[1.1cqw] font-sans text-[clamp(12px,1.5cqw,15px)] font-semibold text-[#06180f] shadow-[0_14px_32px_-10px_rgba(65,150,72,0.8)] [&_svg]:size-[max(13px,1.4cqw)]"
            style={{ backgroundColor: page.accent }}
            onClick={onShare}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.2 }}
          >
            <ShareIcon />
            {copied ? linkCopiedLabel : tellFriendsLabel}
          </motion.button>
        </motion.div>
      )}
    </motion.div>

    {page.mockup !== 'none' && <ChangelogMock page={page} allOtherUniversities={allOtherUniversitiesLabel} />}
  </motion.div>
);
