import type { EnrolmentWithStudyEvents } from '@/app/api/generated/IlmoApi';

const realisationBase = {
  universityOrgIds: ['org'],
  assessmentItemIds: [],
  publishDate: '2026-01-01',
  activityPeriod: {},
  responsibilityInfos: [],
  organisations: [],
  nameSpecifier: { en: 'Contact teaching, Lahti' },
};

const eventBase = { universityOrgIds: ['org'] };

export const FIXTURE_RANGE = { startKey: '2026-08-01', endKey: '2027-01-01' };

export const CALENDAR_ROWS = [
  {
    enrolment: {
      id: 'enr-chn',
      courseUnitRealisationId: 'cur-chn',
      courseUnitId: 'cu-chn',
      assessmentItemId: 'ai-chn',
      colorIndex: 2,
      isInCalendar: true,
      studySubGroups: [
        { studySubGroupId: 'sub-chn-t2', enrolmentStudySubGroupPriority: 'PRIMARY', isInCalendar: true },
      ],
    },
    courseUnitRealisation: {
      ...realisationBase,
      id: 'cur-chn',
      name: { en: 'Basic Chinese 1', fi: 'Kiinan alkeet 1' },
      courseUnitRealisationTypeUrn: 'urn:code:course-unit-realisation-type:teaching-participation-contact',
      studyGroupSets: [
        {
          localId: 'set-teaching',
          name: { en: 'LAHTI-Teaching' },
          subGroupRange: { min: 1, max: 1 },
          studySubGroups: [
            { id: 'sub-chn-lec', name: { en: 'HDD7010 1 LAHTI Lectures for everyone' }, studyEventIds: ['se-chn-lec'] },
          ],
        },
        {
          localId: 'set-exercises',
          name: { en: 'LAHTI-Excercises' },
          subGroupRange: { min: 1, max: 1 },
          studySubGroups: [
            { id: 'sub-chn-t1', name: { en: 'HDD7010 1 LAHTI Tutorial 1' }, studyEventIds: ['se-chn-t1'] },
            { id: 'sub-chn-t2', name: { en: 'HDD7010 1 LAHTI Tutorial 2' }, studyEventIds: ['se-chn-t2'] },
          ],
        },
      ],
    },
    studyEvents: [
      {
        ...eventBase,
        id: 'se-chn-lec',
        recursEvery: 'WEEKLY',
        startTime: '2026-10-20T11:00:00.000Z',
        duration: 'PT2H',
        recursUntil: '2026-11-03',
        locationIds: ['loc-aud1b'],
      },
      {
        ...eventBase,
        id: 'se-chn-t2',
        recursEvery: 'WEEKLY',
        startTime: '2026-10-19T13:00:00.000Z',
        duration: 'PT2H',
        recursUntil: '2026-11-02',
        locationIds: ['loc-2310'],
        events: [
          { start: '2026-10-19T13:00:00.000Z', end: '2026-10-19T15:00:00.000Z' },
          { start: '2026-10-26T14:00:00.000Z', excluded: true },
          {
            start: '2026-11-02T14:00:00.000Z',
            cancelled: true,
            irregularLocationIds: ['loc-6218'],
            notice: { en: 'Moved to lab' },
          },
        ],
      },
    ],
  },
  {
    enrolment: {
      id: 'enr-cni',
      courseUnitRealisationId: 'cur-cni',
      courseUnitId: 'cu-cni',
      assessmentItemId: 'ai-cni',
      colorIndex: 5,
    },
    courseUnitRealisation: {
      ...realisationBase,
      id: 'cur-cni',
      name: { en: 'Computer Networks and Internet' },
      courseUnitRealisationTypeUrn: 'urn:code:course-unit-realisation-type:teaching-participation-lectures',
      studyGroupSets: [],
    },
    studyEvents: [
      {
        ...eventBase,
        id: 'se-cni-lec',
        name: { en: 'Lectures for everyone' },
        recursEvery: 'WEEKLY',
        startTime: '2026-10-27T12:00:00.000Z',
        duration: 'PT2H',
        recursUntil: '2026-11-03',
      },
    ],
  },
  {
    enrolment: {
      id: 'enr-exam',
      courseUnitRealisationId: 'cur-exam',
      courseUnitId: 'cu-cni',
      assessmentItemId: 'ai-exam',
      colorIndex: 5,
    },
    courseUnitRealisation: {
      ...realisationBase,
      id: 'cur-exam',
      name: { en: 'Computer Networks and Internet, exam' },
      courseUnitRealisationTypeUrn: 'urn:code:course-unit-realisation-type:exam-exam',
      studyGroupSets: [],
    },
    studyEvents: [
      {
        ...eventBase,
        id: 'se-exam',
        recursEvery: 'NEVER',
        startTime: '2026-12-02T14:30:00.000Z',
        duration: 'PT3H',
        locationIds: ['loc-aud1b'],
      },
    ],
  },
  {
    enrolment: {
      id: 'enr-ghost',
      courseUnitRealisationId: 'cur-ghost',
      courseUnitId: 'cu-ghost',
      assessmentItemId: 'ai-ghost',
    },
  },
  {
    enrolment: {
      id: 'enr-empty',
      courseUnitRealisationId: 'cur-empty',
      courseUnitId: 'cu-empty',
      assessmentItemId: 'ai-empty',
      isInCalendar: false,
    },
    courseUnitRealisation: {
      ...realisationBase,
      id: 'cur-empty',
      name: { en: 'Empty Course' },
      courseUnitRealisationTypeUrn: 'urn:code:course-unit-realisation-type:teaching-participation-online',
      studyGroupSets: [],
    },
  },
] as unknown as EnrolmentWithStudyEvents[];

export const CHINESE_SHARED_ROW = {
  enrolment: {
    id: 'enr-hdd',
    courseUnitRealisationId: 'cur-hdd',
    courseUnitId: 'cu-hdd',
    assessmentItemId: 'ai-hdd',
    colorIndex: 3,
    isInCalendar: true,
    state: 'ENROLLED',
    studySubGroups: [
      { studySubGroupId: 'sub-hdd-ssg', enrolmentStudySubGroupPriority: 'NOT_SUITABLE', isInCalendar: false },
      { studySubGroupId: 'sub-hdd-lec', enrolmentStudySubGroupPriority: 'NOT_SUITABLE', isInCalendar: false },
      { studySubGroupId: 'sub-hdd-t1', enrolmentStudySubGroupPriority: 'NOT_SUITABLE', isInCalendar: true },
      { studySubGroupId: 'sub-hdd-t2', enrolmentStudySubGroupPriority: 'NOT_SUITABLE', isInCalendar: true },
    ],
  },
  courseUnitRealisation: {
    ...realisationBase,
    id: 'cur-hdd',
    name: { en: 'Contact teaching, Lahti' },
    courseUnitRealisationTypeUrn: 'urn:code:course-unit-realisation-type:teaching-participation-contact',
    studyGroupSets: [
      {
        localId: 'set-ssg',
        name: { en: 'Studygroupset' },
        subGroupRange: { min: 0, max: 0 },
        studySubGroups: [{ id: 'sub-hdd-ssg', name: { fi: 'Opetusryhmä' }, studyEventIds: [] }],
      },
      {
        localId: 'set-teaching',
        name: { en: 'LAHTI-Teaching' },
        subGroupRange: { min: 0, max: 0 },
        studySubGroups: [
          {
            id: 'sub-hdd-lec',
            name: { en: 'HDD7010 1 LAHTI Lectures for everyone' },
            studyEventIds: ['se-hdd-shared'],
          },
        ],
      },
      {
        localId: 'set-exercises',
        name: { en: 'LAHTI-Excercises' },
        subGroupRange: { min: 0, max: 0 },
        studySubGroups: [
          { id: 'sub-hdd-t1', name: { en: 'HDD7010 1 LAHTI Tutorial 1' }, studyEventIds: ['se-hdd-shared'] },
          { id: 'sub-hdd-t2', name: { en: 'HDD7010 1 LAHTI Tutorial 2' }, studyEventIds: ['se-hdd-t2'] },
        ],
      },
    ],
  },
  studyEvents: [
    {
      ...eventBase,
      id: 'se-hdd-shared',
      recursEvery: 'NEVER',
      startTime: '2026-10-05T14:00:00',
      duration: 'PT2H',
      recursUntil: null,
      locationIds: ['loc-aud1b'],
      events: [{ start: '2026-10-05T14:00:00', end: '2026-10-05T16:00:00' }],
    },
    {
      ...eventBase,
      id: 'se-hdd-t2',
      recursEvery: 'NEVER',
      startTime: '2026-10-05T16:00:00',
      duration: 'PT2H',
      recursUntil: null,
      locationIds: ['loc-aud1b'],
      events: [{ start: '2026-10-05T16:00:00', end: '2026-10-05T18:00:00' }],
    },
  ],
} as unknown as EnrolmentWithStudyEvents;
