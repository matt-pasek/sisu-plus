import {
  abortOwnEnrolment,
  cancelEnrolment,
  createOwnEnrolment,
  enrol,
  updateOwnEnrolment,
} from '@/app/api/endpoints/enrolments';
import type { RegistrationCourse, RegistrationImplementation } from '@/app/api/dataPoints/getRegistrationCourses';
import type { Enrolment, EnrolmentStudySubGroup, EnrolRequest } from '@/app/api/generated/IlmoApi';
import type { SelectionState } from './registrationTypes';
import { canCancelImplementation, getEnrolmentForImplementation, isImplementationFinished } from './registrationUtils';

export const buildStudySubGroups = (selections: SelectionState): EnrolmentStudySubGroup[] =>
  Object.values(selections)
    .flat()
    .map((studySubGroupId) => ({
      enrolmentStudySubGroupPriority: 'PRIMARY',
      isInCalendar: true,
      studySubGroupId,
    }));

export const buildStudyGroupSets = (implementation: RegistrationImplementation, selections: SelectionState) =>
  implementation.studyGroupSets.map((set) => ({
    studyGroupSetId: set.id,
    targetStudySubGroupAmount: selections[set.id]?.length ?? set.min,
  }));

export const updateEnrolmentsStudyRightId = async (
  course: RegistrationCourse,
  implementation: RegistrationImplementation,
  studyRightId?: string,
): Promise<void> => {
  const currentEnrolment = getEnrolmentForImplementation(course, implementation);
  if (!currentEnrolment || !studyRightId) return;

  const updatedEnrolment: Enrolment = { ...currentEnrolment, studyRightId };
  await updateOwnEnrolment(currentEnrolment.id!, updatedEnrolment);
};

export const submitRegistration = async (
  course: RegistrationCourse,
  implementation: RegistrationImplementation,
  selections: SelectionState,
  studyRightId?: string,
): Promise<Enrolment> => {
  const studySubGroups = buildStudySubGroups(selections);
  const studyGroupSets = buildStudyGroupSets(implementation, selections);
  let currentEnrolment = getEnrolmentForImplementation(course, implementation);

  if (!currentEnrolment) {
    const assessmentItemId = implementation.assessmentItemIds[0];
    if (!assessmentItemId) {
      throw new Error('This implementation does not expose an assessment item, so Sisu cannot register it.');
    }
    if (!studyRightId && !course.studyRightId) {
      throw new Error("Study right id is required to create an enrolment, but it's missing for this course.");
    }

    const draftEnrolment: Enrolment = {
      assessmentItemId,
      courseUnitId: course.courseUnitId,
      courseUnitRealisationId: implementation.id,
      documentState: 'ACTIVE',
      isInCalendar: true,
      state: 'NOT_ENROLLED',
      studyGroupSets,
      studyRightId: studyRightId ?? course.studyRightId ?? undefined,
      studySubGroups,
    };

    currentEnrolment = await createOwnEnrolment(draftEnrolment);
  }

  if (!currentEnrolment.id) {
    throw new Error('Sisu did not return an enrolment id.');
  }

  const request: EnrolRequest = {
    enrolmentId: currentEnrolment.id,
    studyGroupSets,
    studyRightId: studyRightId ?? course.studyRightId ?? currentEnrolment.studyRightId,
    studySubGroups,
  };

  return enrol(currentEnrolment.id, request);
};

export const cancelRegistration = async ({
  enrolment,
  implementation,
}: {
  enrolment: Enrolment;
  implementation: RegistrationImplementation | null;
}): Promise<Enrolment | null> => {
  if (isImplementationFinished(implementation)) return null;
  if (!enrolment.id) return null;
  if (canCancelImplementation(implementation)) {
    return cancelEnrolment(enrolment.id);
  }
  return abortOwnEnrolment(enrolment.id);
};
