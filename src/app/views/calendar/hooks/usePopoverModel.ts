import { useMemo } from 'react';
import type { CalendarData } from '@/app/api/dataPoints/calendar/types';
import { nearestSwapTo, otherTimes, seriesKeyOf, weekSwaps, type Session } from '@/app/schedule';
import type {
  CalendarActions,
  PopoverActionHandlers,
  PopoverModel,
  PopoverViewCallbacks,
  SessionBadge,
} from '../types';
import { clashPartner, groupContext, groupMenuFor, swapSuggestionFor } from '../util';

export const usePopoverModel = (
  session: Session | null,
  data: CalendarData,
  badges: Map<string, SessionBadge>,
  sessionsById: Map<string, Session>,
  actions: CalendarActions,
  view: PopoverViewCallbacks,
): PopoverModel | null =>
  useMemo(() => {
    if (!session) return null;
    const course = data.courses.find((item) => item.realisationId === session.courseKey);
    const status = data.statusById.get(session.id) ?? 'attended';
    const attended = status === 'attended';
    const context = groupContext(session, course);
    const attendedIds = new Set(data.attended.map((item) => item.id));
    const dismissed = Object.values(data.plans).flatMap((plan) => plan.dismissed);
    const suggestion = attended
      ? swapSuggestionFor(session, data.clashesBySession, data.attended, data.pool, data.groups, dismissed)
      : null;
    const partner = attended ? clashPartner(session, data.clashesBySession, sessionsById) : null;
    const goInstead = status === 'alternative' ? nearestSwapTo(session, data.attended, data.groups) : null;
    const week = status === 'alternative' ? weekSwaps(session, data.attended, data.pool, data.groups) : [];
    const courseOf = (sessionId: string): string => sessionsById.get(sessionId)?.courseKey ?? session.courseKey;
    const thenClose = (run: () => void) => () => {
      run();
      view.close();
    };

    const handlers: PopoverActionHandlers = {
      onShowAllSessions: () => view.showAllSessions(seriesKeyOf(session)),
      onGoTo: (other) => {
        actions.swap(session.courseKey, [{ fromSessionId: session.id, toSessionId: other.id }]);
        view.close();
      },
      onSwitchToSuggestion: thenClose(() => {
        if (suggestion) actions.swap(courseOf(suggestion.swap.fromSessionId), [suggestion.swap]);
      }),
      onKeep: () => {
        if (suggestion) actions.dismiss(courseOf(suggestion.swap.fromSessionId), suggestion.clashId);
      },
      onSkip: (everyTime) => {
        if (partner) actions.skip(session, partner, everyTime);
        view.close();
      },
      onUndoSkip: thenClose(() => actions.undoSkip(session)),
      onGoInstead: thenClose(() => {
        if (goInstead) actions.swap(session.courseKey, [goInstead]);
      }),
      onSwapWeek: thenClose(() => actions.swap(session.courseKey, week)),
      onMakeUsual: thenClose(() => {
        if (context) actions.makeUsual(session.courseKey, context.set.id, context.group.id);
      }),
      onUndoSwap: thenClose(() => actions.undoSwap(session)),
      onSwitchGroup: () => {
        if (context) view.openGroups(session.courseKey, context.set.id);
      },
      onHideGroup: thenClose(() => {
        if (course && context) actions.setGroups(course, [{ groupId: context.group.id, visible: false }]);
      }),
    };

    return {
      status,
      badge: badges.get(session.id) ?? null,
      otherTimes: attended ? otherTimes(session, data.pool, data.groups, attendedIds) : [],
      suggestion,
      partner,
      groupMenu: attended && context ? groupMenuFor(session, context) : null,
      groupName: context?.group.name ?? null,
      canGoInstead: goInstead != null,
      canSwapWeek: week.length > 0,
      handlers,
    };
  }, [session, data, badges, sessionsById, actions, view]);
