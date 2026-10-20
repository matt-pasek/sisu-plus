/// <reference types="bun-types" />
import { describe, expect, test } from 'bun:test';
import { QueryClient } from '@tanstack/react-query';
import type { TimelineCourse } from '@/app/api/dataPoints/getTimelineCourses';
import {
  getCachedCourseGroupIds,
  insertTimelineCourse,
  removeTimelineCourse,
  restoreTimelineCourses,
  snapshotTimelineCourses,
  updateTimelineCourses,
} from './timelineCoursesCache';

const course = (courseUnitId: string, courseUnitGroupId: string | null = `g-${courseUnitId}`): TimelineCourse => ({
  courseUnitId,
  courseUnitGroupId,
  courseCode: courseUnitId,
  courseName: courseUnitId,
  credits: 5,
  moduleId: null,
  moduleName: null,
  plannedPeriods: [],
  completionPeriod: null,
  attainmentDate: null,
  isPassed: false,
  grade: null,
  isEnrolled: false,
  parentModuleId: null,
  teachingPeriodLocators: [],
});

const seeded = () => {
  const client = new QueryClient();
  client.setQueryData(['timeline-courses', 'p1', 'en'], [course('a')]);
  client.setQueryData(['timeline-courses', 'p1', 'fi'], [course('a')]);
  client.setQueryData(['timeline-courses', 'p2', 'en'], [course('z')]);
  return client;
};

const ids = (client: QueryClient, key: unknown[]) =>
  client.getQueryData<TimelineCourse[]>(key)?.map((entry) => entry.courseUnitId);

describe('timeline courses cache', () => {
  test('an optimistic insert reaches every language copy of the plan only', () => {
    const client = seeded();
    updateTimelineCourses(client, 'p1', (courses) => insertTimelineCourse(courses, course('b')));
    expect(ids(client, ['timeline-courses', 'p1', 'en'])).toEqual(['a', 'b']);
    expect(ids(client, ['timeline-courses', 'p1', 'fi'])).toEqual(['a', 'b']);
    expect(ids(client, ['timeline-courses', 'p2', 'en'])).toEqual(['z']);
  });

  test('inserting a course that is already there keeps one copy', () => {
    const courses = [course('a')];
    expect(insertTimelineCourse(courses, course('a'))).toBe(courses);
  });

  test('removal drops the course from every language copy', () => {
    const client = seeded();
    updateTimelineCourses(client, 'p1', (courses) => removeTimelineCourse(courses, 'a'));
    expect(ids(client, ['timeline-courses', 'p1', 'en'])).toEqual([]);
    expect(ids(client, ['timeline-courses', 'p1', 'fi'])).toEqual([]);
  });

  test('restores a snapshot in every language', () => {
    const client = seeded();
    const snapshot = snapshotTimelineCourses(client, 'p1');
    updateTimelineCourses(client, 'p1', (courses) => insertTimelineCourse(courses, course('b')));
    restoreTimelineCourses(client, snapshot);
    expect(ids(client, ['timeline-courses', 'p1', 'en'])).toEqual(['a']);
    expect(ids(client, ['timeline-courses', 'p1', 'fi'])).toEqual(['a']);
  });

  test('looks up the group ids of the given course units in any language copy', () => {
    const client = new QueryClient();
    client.setQueryData(['timeline-courses', 'p1', 'en'], [course('a'), course('n', null)]);
    client.setQueryData(['timeline-courses', 'p1', 'fi'], [course('b')]);
    expect([...getCachedCourseGroupIds(client, 'p1', new Set(['a', 'b', 'n']))].sort()).toEqual(['g-a', 'g-b']);
    expect([...getCachedCourseGroupIds(client, 'p1', new Set(['b']))]).toEqual(['g-b']);
  });
});
