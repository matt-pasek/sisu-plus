import { useCallback, useEffect, useRef, useState } from 'react';
import type { AttendancePlan } from '@/app/schedule';
import { EMPTY_PLAN, isEmptyPlan, parsePlan, parsePlans, planKey, PLAN_KEY_PREFIX } from './attendancePlan';

type Plans = Record<string, AttendancePlan>;

const applyChanges = (current: Plans, changes: Record<string, chrome.storage.StorageChange>): Plans =>
  Object.entries(changes)
    .filter(([key]) => key.startsWith(PLAN_KEY_PREFIX))
    .reduce<Plans>((next, [key, change]) => {
      const courseKey = key.slice(PLAN_KEY_PREFIX.length);
      if (change.newValue === undefined) {
        return Object.fromEntries(Object.entries(next).filter(([existing]) => existing !== courseKey));
      }
      return { ...next, [courseKey]: parsePlan(change.newValue) };
    }, current);

export const useAttendancePlans = (
  onWriteError: () => void,
): {
  plans: Plans;
  isLoaded: boolean;
  updatePlan: (courseKey: string, update: (plan: AttendancePlan) => AttendancePlan) => void;
} => {
  const [plans, setPlans] = useState<Plans>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const latest = useRef(plans);
  latest.current = plans;

  useEffect(() => {
    let active = true;
    chrome.storage.sync
      .get(null)
      .then((items) => {
        if (!active) return;
        setPlans(parsePlans(items));
        setIsLoaded(true);
      })
      .catch(() => {
        if (active) setIsLoaded(true);
      });
    const listener = (changes: Record<string, chrome.storage.StorageChange>, areaName: string) => {
      if (areaName === 'sync') setPlans((current) => applyChanges(current, changes));
    };
    chrome.storage.onChanged.addListener(listener);
    return () => {
      active = false;
      chrome.storage.onChanged.removeListener(listener);
    };
  }, []);

  const updatePlan = useCallback(
    (courseKey: string, update: (plan: AttendancePlan) => AttendancePlan) => {
      const next = update(latest.current[courseKey] ?? EMPTY_PLAN);
      latest.current = { ...latest.current, [courseKey]: next };
      setPlans((current) => ({ ...current, [courseKey]: next }));
      const key = planKey(courseKey);
      const write = isEmptyPlan(next) ? chrome.storage.sync.remove(key) : chrome.storage.sync.set({ [key]: next });
      write.catch(onWriteError);
    },
    [onWriteError],
  );

  return { plans, isLoaded, updatePlan };
};
