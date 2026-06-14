export type UniversityConfig = {
  name: string;
  sisuDomain: string;
  moodleDomain: string;
  sisuOrigin: string;
  moodleOrigin: string;
};

export const KNOWN_UNIVERSITIES: UniversityConfig[] = [
  {
    name: 'LUT University',
    sisuDomain: 'sisu.lut.fi',
    moodleDomain: 'moodle.lut.fi',
    sisuOrigin: 'https://sisu.lut.fi',
    moodleOrigin: 'https://moodle.lut.fi',
  },
  {
    name: 'LAB University of Applied Sciences',
    sisuDomain: 'sisu.lab.fi',
    moodleDomain: 'moodle.lab.fi',
    sisuOrigin: 'https://sisu.lab.fi',
    moodleOrigin: 'https://moodle.lab.fi',
  },
  {
    name: 'University of Helsinki',
    sisuDomain: 'sisu.helsinki.fi',
    moodleDomain: 'moodle.helsinki.fi',
    sisuOrigin: 'https://sisu.helsinki.fi',
    moodleOrigin: 'https://moodle.helsinki.fi',
  },
  {
    name: 'Aalto University',
    sisuDomain: 'sisu.aalto.fi',
    moodleDomain: 'mycourses.aalto.fi',
    sisuOrigin: 'https://sisu.aalto.fi',
    moodleOrigin: 'https://mycourses.aalto.fi',
  },
  {
    name: 'JYU University of Jyväskylä',
    sisuDomain: 'sisu.jyu.fi',
    moodleDomain: 'moodle.jyu.fi',
    sisuOrigin: 'https://sisu.jyu.fi',
    moodleOrigin: 'https://moodle.jyu.fi',
  },
  {
    name: 'TUNI Tampere Universities',
    sisuDomain: 'sisu.tuni.fi',
    moodleDomain: 'moodle.tuni.fi',
    sisuOrigin: 'https://sisu.tuni.fi',
    moodleOrigin: 'https://moodle.tuni.fi',
  },
];

export function universityConfigFromSisuDomain(sisuDomain: string, name?: string): UniversityConfig {
  const known = KNOWN_UNIVERSITIES.find((u) => u.sisuDomain === sisuDomain);
  const resolvedName = name ?? known?.name ?? '';
  const moodleDomain = known?.moodleDomain ?? sisuDomain.replace(/^sisu\./, 'moodle.');

  return {
    name: resolvedName,
    sisuDomain,
    moodleDomain,
    sisuOrigin: `https://${sisuDomain}`,
    moodleOrigin: `https://${moodleDomain}`,
  };
}

export type SisuDomainValidation = { valid: true; domain: string } | { valid: false; error: string };

export function validateSisuDomain(raw: string): SisuDomainValidation {
  const domain = raw
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '')
    .toLowerCase()
    .trim();

  if (!domain) return { valid: false, error: '' };
  if (!domain.endsWith('.fi')) {
    return { valid: false, error: 'Sisu+ supports only Finnish universities using Sisu.' };
  }
  if (!domain.startsWith('sisu.')) {
    return { valid: false, error: 'Make sure you enter your Sisu URL.' };
  }
  if (!/^sisu\.[a-z0-9-]+(\.[a-z0-9-]+)*\.fi$/.test(domain)) {
    return { valid: false, error: "That doesn't look like a Sisu URL. It should look like sisu.youruni.fi" };
  }

  return { valid: true, domain };
}
