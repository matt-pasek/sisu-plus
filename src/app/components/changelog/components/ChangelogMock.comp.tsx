import { motion } from 'motion/react';
import React from 'react';
import type { InAppChangelogPage } from '../types';
import { getAccentWash } from '../util';
import {
  DashboardMock,
  NotificationsMock,
  RegistrationMock,
  StructureMock,
  TimelineMock,
  UniversityMock,
} from './mockups';

interface Props {
  page: InAppChangelogPage;
  allOtherUniversities: string;
}

export const ChangelogMock: React.FC<Props> = ({ page, allOtherUniversities }) => (
  <motion.div
    className="w-full overflow-hidden rounded-[18px] bg-[rgba(20,20,28,0.6)] p-[1.7cqw] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1),0_36px_70px_-34px_rgba(0,0,0,0.95)] backdrop-blur-2xl backdrop-saturate-125 max-[720px]:p-4"
    aria-hidden="true"
    initial={{ opacity: 0, x: 24, scale: 0.96 }}
    animate={{ opacity: 1, x: 0, scale: 1 }}
    transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.52, delay: 0.12 }}
  >
    <div className="mb-[1.5cqw] flex items-center gap-[0.8cqw]">
      <span className="font-mono text-[clamp(10px,1.2cqw,12px)] font-semibold tracking-[0.07em] text-[rgba(243,243,255,0.56)] uppercase">
        {page.eyebrow}
      </span>
      <strong
        className="ml-auto rounded-full p-[0.4cqw_1cqw] text-[clamp(10px,1.1cqw,12px)] font-semibold capitalize"
        style={{ backgroundColor: getAccentWash(page.accent, 0.16), color: page.accent }}
      >
        {page.mockup}
      </strong>
    </div>
    {page.mockup === 'timeline' && <TimelineMock accent={page.accent} />}
    {page.mockup === 'structure' && <StructureMock accent={page.accent} />}
    {page.mockup === 'university' && <UniversityMock accent={page.accent} allOtherLabel={allOtherUniversities} />}
    {page.mockup === 'dashboard' && <DashboardMock accent={page.accent} />}
    {page.mockup === 'registration' && <RegistrationMock accent={page.accent} />}
    {page.mockup === 'notifications' && <NotificationsMock accent={page.accent} />}
  </motion.div>
);
