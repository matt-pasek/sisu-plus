import type { GroupEvents, SharedRelation } from './types';

const relationTo = (own: Set<string>, other: GroupEvents): SharedRelation | null => {
  const theirs = new Set(other.eventIds);
  const count = [...theirs].filter((id) => own.has(id)).length;
  if (count === 0) return null;
  return { groupId: other.id, kind: count === own.size && count === theirs.size ? 'identical' : 'partial', count };
};

export const sharedRelations = (groups: GroupEvents[]): Map<string, SharedRelation[]> =>
  new Map(
    groups.map((group) => {
      const own = new Set(group.eventIds);
      const relations = groups
        .filter((other) => other.id !== group.id)
        .map((other) => relationTo(own, other))
        .filter((relation): relation is SharedRelation => relation != null);
      return [group.id, relations];
    }),
  );

export const stillShownThrough = (groupId: string, groups: GroupEvents[]): string[] => {
  const own = new Set(groups.find((group) => group.id === groupId)?.eventIds ?? []);
  return groups
    .filter((other) => other.id !== groupId && other.visible && other.eventIds.some((id) => own.has(id)))
    .map((other) => other.id);
};
