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

export const describeRoomWithBuilding = (
  locationIds: string[],
  rooms: Record<string, RoomInfo>,
  labels: RoomLabels,
): string =>
  describe(locationIds, rooms, labels, (room) => (room.building ? `${room.name} · ${room.building}` : room.name));
