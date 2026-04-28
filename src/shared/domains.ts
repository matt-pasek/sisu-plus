export const SISU_ORIGINS = ['https://sisu.lut.fi', 'https://sisu.lab.fi'] as const;

export const MOODLE_BY_SISU_ORIGIN = {
  'https://sisu.lut.fi': 'https://moodle.lut.fi',
  'https://sisu.lab.fi': 'https://moodle.lab.fi',
} as const satisfies Record<(typeof SISU_ORIGINS)[number], string>;

export function getCurrentOrigin(): string {
  return window.location.origin;
}

export function isSupportedSisuOrigin(origin: string): origin is (typeof SISU_ORIGINS)[number] {
  return SISU_ORIGINS.includes(origin as (typeof SISU_ORIGINS)[number]);
}

export function getSisuApiBaseUrl(apiPath: string, origin = getCurrentOrigin()): string {
  return `${origin}/${apiPath}`;
}

export function getMoodleBaseUrl(origin = getCurrentOrigin()): string {
  if (isSupportedSisuOrigin(origin)) {
    return MOODLE_BY_SISU_ORIGIN[origin];
  }

  return MOODLE_BY_SISU_ORIGIN['https://sisu.lut.fi'];
}

export function getMoodleCalendarExportUrl(origin = getCurrentOrigin()): string {
  return `${getMoodleBaseUrl(origin)}/calendar/export.php?`;
}
