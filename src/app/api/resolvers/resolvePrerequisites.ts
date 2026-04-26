import { koriApi } from '@/app/api/client';
import { pickLabel } from '@/app/api/resolvers/helpers/pickLabel';
import type {
  CourseUnit,
  CourseUnitPrerequisite,
  PrerequisiteGroup as KoriPrerequisiteGroup,
} from '@/app/api/generated/KoriApi';

export interface CourseUnitPrerequisiteInfo {
  courseUnitGroupId: string;
  name: string | null;
}

export interface PrerequisiteGroup {
  prerequisites: CourseUnitPrerequisiteInfo[];
}

export interface PrerequisiteInfo {
  courseUnitId: string;
  compulsory: PrerequisiteGroup[];
  recommended: PrerequisiteGroup[];
}

const prerequisiteCache = new Map<string, PrerequisiteInfo>();

type KoriPrerequisite = NonNullable<KoriPrerequisiteGroup['prerequisites']>[number];

function isCourseUnitPrerequisite(prerequisite: KoriPrerequisite): prerequisite is CourseUnitPrerequisite {
  return (
    typeof prerequisite === 'object' &&
    prerequisite != null &&
    'courseUnitGroupId' in prerequisite &&
    typeof prerequisite.courseUnitGroupId === 'string'
  );
}

function normalizePrerequisiteGroups(groups: KoriPrerequisiteGroup[] | undefined): PrerequisiteGroup[] {
  return (groups ?? []).map((group) => ({
    prerequisites: (group.prerequisites ?? []).filter(isCourseUnitPrerequisite).map((prerequisite) => ({
      courseUnitGroupId: prerequisite.courseUnitGroupId,
      name: null,
    })),
  }));
}

function getPrerequisiteGroupIds(groups: PrerequisiteGroup[]): string[] {
  return [
    ...new Set(groups.flatMap((group) => group.prerequisites.map((prerequisite) => prerequisite.courseUnitGroupId))),
  ];
}

function getCourseUnitLabel(courseUnit: CourseUnit): string {
  const name = pickLabel(courseUnit.name);
  if (courseUnit.code && name) return `${courseUnit.code} ${name}`;
  return courseUnit.code ?? name ?? courseUnit.groupId;
}

function applyPrerequisiteNames(groups: PrerequisiteGroup[], namesByGroupId: Map<string, string>): PrerequisiteGroup[] {
  return groups.map((group) => ({
    prerequisites: group.prerequisites.map((prerequisite) => ({
      ...prerequisite,
      name: namesByGroupId.get(prerequisite.courseUnitGroupId) ?? prerequisite.name,
    })),
  }));
}

async function resolvePrerequisiteNames(
  groupIds: string[],
  universityId: string | undefined,
): Promise<Map<string, string>> {
  if (!universityId || groupIds.length === 0) return new Map();

  try {
    const response = await koriApi.api.findByGroupIdAndCurriculumPeriodId1({
      groupId: groupIds,
      universityId,
      documentStates: ['ACTIVE'],
    });

    return new Map(response.data.map((courseUnit) => [courseUnit.groupId, getCourseUnitLabel(courseUnit)]));
  } catch {
    return new Map();
  }
}

async function buildPrerequisiteInfo(courseUnitId: string, courseUnit: CourseUnit): Promise<PrerequisiteInfo> {
  const compulsory = normalizePrerequisiteGroups(courseUnit.compulsoryFormalPrerequisites);
  const recommended = normalizePrerequisiteGroups(courseUnit.recommendedFormalPrerequisites);
  const namesByGroupId = await resolvePrerequisiteNames(
    getPrerequisiteGroupIds([...compulsory, ...recommended]),
    courseUnit.universityOrgIds[0],
  );

  return {
    courseUnitId,
    compulsory: applyPrerequisiteNames(compulsory, namesByGroupId),
    recommended: applyPrerequisiteNames(recommended, namesByGroupId),
  };
}

export async function resolvePrerequisites(courseUnitId: string): Promise<PrerequisiteInfo> {
  const cached = prerequisiteCache.get(courseUnitId);
  if (cached) return cached;

  try {
    const response = await koriApi.api.getCourseUnit(courseUnitId);
    const result = await buildPrerequisiteInfo(courseUnitId, response.data);
    prerequisiteCache.set(courseUnitId, result);
    return result;
  } catch {
    const fallback: PrerequisiteInfo = { courseUnitId, compulsory: [], recommended: [] };
    prerequisiteCache.set(courseUnitId, fallback);
    return fallback;
  }
}
