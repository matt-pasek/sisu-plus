import type { InAppChangelogPage } from '../types';

type PageStructure = Pick<InAppChangelogPage, 'accent' | 'mockup'> &
  Partial<Pick<InAppChangelogPage, 'showShare' | 'outro'>>;

export const CHANGELOG_V2: { version: string; pages: PageStructure[] } = {
  version: 'v2.0',
  pages: [
    { accent: '#52c989', mockup: 'none' },
    { accent: '#52c989', mockup: 'university', showShare: true },
    { accent: '#34c7a9', mockup: 'dashboard' },
    { accent: '#5b8df6', mockup: 'structure' },
    { accent: '#f0a84e', mockup: 'registration' },
    { accent: '#a78bfa', mockup: 'notifications' },
    { accent: '#52c989', mockup: 'none', outro: true },
  ],
};
