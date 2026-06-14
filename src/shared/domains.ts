import type { UniversityConfig } from '@/app/types/universityConfig';

export function getCurrentOrigin(): string {
  return window.location.origin;
}

export function getSisuApiBaseUrl(apiPath: string, origin = getCurrentOrigin()): string {
  return `${origin}/${apiPath}`;
}

export function getMoodleOriginFromConfig(config: UniversityConfig): string {
  return config.moodleOrigin;
}

export function getMoodleCalendarExportUrlFromConfig(config: UniversityConfig): string {
  return `${config.moodleOrigin}/calendar/export.php?`;
}
