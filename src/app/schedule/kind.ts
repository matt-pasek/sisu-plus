import type { SessionKind } from './types';

const RULES: [SessionKind, RegExp][] = [
  ['exam', /\bexam|tentti|\bkoe\b/i],
  ['lab', /\blab(s|oratory)?\b|laboratorio/i],
  ['exercise', /tutorial|exercis|excercis|harjoit|demo|workshop|practical/i],
  ['seminar', /seminar/i],
  ['lecture', /lecture|luento|teaching|opetus/i],
];

const kindOf = (text: string): SessionKind | null => RULES.find(([, pattern]) => pattern.test(text))?.[0] ?? null;

export const classifySessionKind = (texts: (string | null | undefined)[], isExamRealisation: boolean): SessionKind => {
  if (isExamRealisation) return 'exam';
  return (
    texts
      .filter((text): text is string => Boolean(text))
      .map(kindOf)
      .find((kind): kind is SessionKind => kind != null) ?? 'other'
  );
};
