/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { isClassReminderLead, normalizeNotificationPrefs } from './normalizeNotificationPrefs';

describe('normalizeNotificationPrefs', () => {
  test('class reminders are off, 10 minutes before, for all classes by default', () => {
    const prefs = normalizeNotificationPrefs(undefined);
    expect(prefs.delivery['class-reminder']).toBe('off');
    expect(prefs.classReminderLeadMinutes).toBe(10);
    expect(prefs.classReminderScope).toBe('all');
    expect(prefs.registrationOpenLeadMinutes).toBe(0);
  });

  test('keeps stored delivery modes and fills the new type', () => {
    const prefs = normalizeNotificationPrefs({ delivery: { 'moodle-deadline': 'out-of-app' } });
    expect(prefs.delivery['moodle-deadline']).toBe('out-of-app');
    expect(prefs.delivery['class-reminder']).toBe('off');
  });

  test('keeps valid reminder settings', () => {
    const prefs = normalizeNotificationPrefs({ classReminderLeadMinutes: 30, classReminderScope: 'exams' });
    expect(prefs.classReminderLeadMinutes).toBe(30);
    expect(prefs.classReminderScope).toBe('exams');
  });

  test('replaces unknown lead times and scopes with the defaults', () => {
    const prefs = normalizeNotificationPrefs({ classReminderLeadMinutes: 7, classReminderScope: 'labs' });
    expect(prefs.classReminderLeadMinutes).toBe(10);
    expect(prefs.classReminderScope).toBe('all');
  });
});

describe('isClassReminderLead', () => {
  test('accepts only the offered lead times', () => {
    expect([5, 10, 15, 30].every(isClassReminderLead)).toBe(true);
    expect(isClassReminderLead(0)).toBe(false);
    expect(isClassReminderLead('10')).toBe(false);
  });
});
