/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { describeRoom, describeRoomWithBuilding } from './rooms';

const rooms = {
  'loc-aud1b': { id: 'loc-aud1b', name: 'M19_AUD1B Auditorio 1', building: 'LAB' },
  'loc-2310': { id: 'loc-2310', name: '2310', building: null },
};
const labels = { noRoom: 'No room', unavailable: 'Room unavailable' };

describe('describeRoom', () => {
  test('says when a session has no room', () => {
    expect(describeRoom([], rooms, labels)).toBe('No room');
  });

  test('names known rooms', () => {
    expect(describeRoom(['loc-aud1b', 'loc-2310'], rooms, labels)).toBe('M19_AUD1B Auditorio 1, 2310');
  });

  test('falls back when a room is unknown or room data failed to load', () => {
    expect(describeRoom(['loc-unknown'], rooms, labels)).toBe('Room unavailable');
    expect(describeRoom(['loc-aud1b'], {}, labels)).toBe('Room unavailable');
  });

  test('adds the building when known', () => {
    expect(describeRoomWithBuilding(['loc-aud1b'], rooms, labels)).toBe('M19_AUD1B Auditorio 1 · LAB');
    expect(describeRoomWithBuilding(['loc-2310'], rooms, labels)).toBe('2310');
  });
});
