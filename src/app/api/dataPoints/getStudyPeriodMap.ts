import { fetchStudyRights } from '@/app/api/endpoints/studyRights';
import { fetchStudyYears } from '@/app/api/endpoints/studyPeriods';
import { fetchEducationById } from '@/app/api/endpoints/educations';
import { pickLabel } from '@/app/api/resolvers/helpers/pickLabel';
import { useSisuQuery } from '@/app/hooks/useSisuQuery';
import type { StudyYear } from '@/app/api/generated/KoriApi';

export interface StudyPeriodInfo {
  locator: string;
  name: string;
  startDate: string;
  endDate: string;
  studyYear: number;
  termName: string;
  visibleByDefault: boolean;
}

export type StudyPeriodMap = Map<string, StudyPeriodInfo>;

function getCurrentAcademicStartYear(): number {
  const now = new Date();
  return now.getMonth() + 1 >= 8 ? now.getFullYear() : now.getFullYear() - 1;
}

export function buildStudyPeriodMap(studyYears: StudyYear[]): StudyPeriodMap {
  const periodMap: StudyPeriodMap = new Map();

  for (const studyYear of studyYears) {
    const studyYearStart = studyYear.startYear;
    if (studyYearStart == null) continue;

    for (const term of studyYear.studyTerms ?? []) {
      const termName = (term.name ? pickLabel(term.name) : null) ?? studyYear.name ?? String(studyYearStart);

      for (const period of term.studyPeriods ?? []) {
        if (!period.locator || !period.valid?.startDate || !period.valid.endDate) continue;

        periodMap.set(period.locator, {
          locator: period.locator,
          name: (period.name ? pickLabel(period.name) : null) ?? period.locator,
          startDate: period.valid.startDate,
          endDate: period.valid.endDate,
          studyYear: studyYearStart,
          termName,
          visibleByDefault: period.visibleByDefault !== false,
        });
      }
    }
  }

  return periodMap;
}

export const getStudyPeriodMap = (): { studyPeriodMap: StudyPeriodMap; isLoading: boolean } => {
  const studyRightsQuery = useSisuQuery(['study-rights'], fetchStudyRights);
  const studyRight = studyRightsQuery.data?.[0];

  const educationQuery = useSisuQuery(
    ['study-period-education', studyRight?.educationId],
    async () => fetchEducationById(studyRight!.educationId),
    { enabled: studyRight?.educationId != null },
  );

  const org = educationQuery.data?.universityOrgIds[0] ?? studyRight?.organisationId;

  const { data: studyPeriodMap, isLoading } = useSisuQuery(
    ['study-period-map', org],
    async () => {
      const firstYear = getCurrentAcademicStartYear() - 2;
      const studyYears = await fetchStudyYears(org!, firstYear, 6);
      return buildStudyPeriodMap(studyYears);
    },
    { enabled: org != null },
  );

  return {
    studyPeriodMap: studyPeriodMap ?? new Map(),
    isLoading: studyRightsQuery.isLoading || educationQuery.isLoading || isLoading,
  };
};
