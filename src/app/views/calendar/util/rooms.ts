import type { RoomInfo } from '@/app/api/dataPoints/calendar/types';
import type { RoomLabels } from '../types';

const describe = (
  locationIds: string[],
  rooms: Record<string, RoomInfo>,
  labels: RoomLabels,
  toText: (room: RoomInfo) => string,
): string => {
  if (locationIds.length === 0) return labels.noRoom;
  const known = locationIds.map((id) => rooms[id]).filter((room): room is RoomInfo => room != null);
  return known.length === locationIds.length ? known.map(toText).join(', ') : labels.unavailable;
};

export const describeRoom = (locationIds: string[], rooms: Record<string, RoomInfo>, labels: RoomLabels): string =>
  describe(locationIds, rooms, labels, (room) => room.name);

const BUILDING_PREFIX = /^[A-Za-z]+\d*_/;
const HAS_DIGIT = /\d/;

// Room names often lead with a code ("M19_AUD1B Auditorio 1"); grid cells only have room for the code itself.
export const shortRoomName = (name: string): string => {
  const [first = name] = name.trim().split(/\s+/);
  if (!HAS_DIGIT.test(first)) return name;
  const withoutBuilding = first.replace(BUILDING_PREFIX, '');
  return HAS_DIGIT.test(withoutBuilding) ? withoutBuilding : first;
};

export const describeRoomShort = (locationIds: string[], rooms: Record<string, RoomInfo>, labels: RoomLabels): string =>
  describe(locationIds, rooms, labels, (room) => shortRoomName(room.name));

export const describeRoomWithBuilding = (
  locationIds: string[],
  rooms: Record<string, RoomInfo>,
  labels: RoomLabels,
): string =>
  describe(locationIds, rooms, labels, (room) => (room.building ? `${room.name} · ${room.building}` : room.name));
