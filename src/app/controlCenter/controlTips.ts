import { TFunction } from 'i18next';

export interface ControlTip {
  title: string;
  body: string;
  accentClass: string;
}

const TIP_MATCHERS: Array<{
  test: (pathname: string, isActive: boolean) => boolean;
  tip: (t: TFunction) => ControlTip;
}> = [
  {
    test: (_p, isActive) => !isActive,
    tip: (t) => ({
      title: t('tip.dormantTitle'),
      body: t('tip.dormantBody'),
      accentClass: 'text-warn bg-warn/15 shadow-[inset_0_0_0_1px_rgba(246,185,86,0.18)]',
    }),
  },
  {
    test: (p) => p.startsWith('/student/plan'),
    tip: (t) => ({
      title: t('tip.planningTitle'),
      body: t('tip.planningBody'),
      accentClass: 'text-blue-300 bg-blue-400/15 shadow-[inset_0_0_0_1px_rgba(102,142,255,0.18)]',
    }),
  },
  {
    test: (p) => p.startsWith('/student/structure'),
    tip: (t) => ({
      title: t('tip.structureTitle'),
      body: t('tip.structureBody'),
      accentClass: 'text-violet-300 bg-violet-400/15 shadow-[inset_0_0_0_1px_rgba(167,139,250,0.18)]',
    }),
  },
  {
    test: (p) => p.startsWith('/student/enrolments'),
    tip: (t) => ({
      title: t('tip.enrolmentsTitle'),
      body: t('tip.enrolmentsBody'),
      accentClass: 'text-emerald-300 bg-emerald-400/15 shadow-[inset_0_0_0_1px_rgba(52,211,153,0.18)]',
    }),
  },
  {
    test: () => true,
    tip: (t) => ({
      title: t('tip.dashboardTitle'),
      body: t('tip.dashboardBody'),
      accentClass: 'text-accent bg-accent/15 shadow-[inset_0_0_0_1px_rgba(65,150,72,0.18)]',
    }),
  },
];

export function getControlTip(isActive: boolean, pathname: string, t: TFunction): ControlTip {
  const match = TIP_MATCHERS.find(({ test }) => test(pathname, isActive));
  return match!.tip(t);
}
