import type { CourseUnit } from '@/app/api/generated/KoriApi';
import type { CourseUnitInfo, LabelPicker } from './types';

export const mapCourseUnits = (units: CourseUnit[], label: LabelPicker): Record<string, CourseUnitInfo> =>
  Object.fromEntries(
    units.flatMap((unit) =>
      unit.id
        ? [[unit.id, { id: unit.id, code: unit.code, credits: unit.credits?.min ?? null, name: label(unit.name) }]]
        : [],
    ),
  );
