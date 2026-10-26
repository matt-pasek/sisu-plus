const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

const MAX_DECODE_PASSES = 3;

const decodeEntity = (match: string, entity: string): string => {
  if (entity[0] !== '#') return NAMED_ENTITIES[entity.toLowerCase()] ?? match;
  const code = entity[1] === 'x' || entity[1] === 'X' ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
  return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : match;
};

// Moodle escapes course names for HTML before export, sometimes twice (`&amp;amp;`), so decoding repeats until stable.
export const decodeHtmlEntities = (value: string): string => {
  let decoded = value;
  for (let pass = 0; pass < MAX_DECODE_PASSES; pass += 1) {
    const next = decoded.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, decodeEntity);
    if (next === decoded) break;
    decoded = next;
  }
  return decoded;
};

const endsWithEscape = (value: string): boolean => (value.match(/\\+$/)?.[0].length ?? 0) % 2 === 1;

const unescapeIcsText = (value: string): string =>
  value.replace(/\\([\\;,nN])/g, (_, char: string) => (char === 'n' || char === 'N' ? ' ' : char));

// ts-ics splits CATEGORIES on every comma, including the escaped `\,` inside a Moodle course name.
export const getFirstIcsCategory = (categories: string[] | undefined): string | null => {
  if (!categories?.length) return null;
  const [first, ...rest] = categories;
  let joined = first;
  for (const part of rest) {
    if (!endsWithEscape(joined)) break;
    joined = `${joined},${part}`;
  }
  return decodeHtmlEntities(unescapeIcsText(joined));
};

export const getCategoryLabel = (category: string): string => category.split(', ')[0];
