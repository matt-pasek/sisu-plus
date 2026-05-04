import { en } from '../src/app/locales/en/en';
import { fi } from '../src/app/locales/fi/fi';
import { writeFileSync } from 'node:fs';

function flatten(obj: unknown, prefix = '', out: Record<string, string> = {}) {
  if (typeof obj === 'string') out[prefix] = obj;
  else if (Array.isArray(obj)) obj.forEach((v, i) => flatten(v, `${prefix}.${i}`, out));
  else if (obj && typeof obj === 'object') {
    for (const [key, value] of Object.entries(obj)) {
      flatten(value, prefix ? `${prefix}.${key}` : key, out);
    }
  }
  return out;
}

const enFlat = flatten(en.sisu);
const fiFlat = flatten(fi.sisu);
const keys = [...new Set([...Object.keys(enFlat), ...Object.keys(fiFlat)])].sort();

const escapeCell = (value = '') => value.replaceAll('\t', ' ').replaceAll('\n', ' ');
const rows = [
  ['key', 'english', 'finnish', 'notes'],
  ...keys.map((key) => [key, enFlat[key] ?? '', fiFlat[key] ?? '', '']),
];

writeFileSync('translation-review.tsv', rows.map((row) => row.map(escapeCell).join('\t')).join('\n'));
