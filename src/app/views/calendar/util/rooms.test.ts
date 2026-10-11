/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { describeRoom, describeRoomShort, describeRoomWithBuilding, shortRoomName } from './rooms';

describe('shortRoomName', () => {
  test('keeps the room code after a building prefix', () => {
    expect(shortRoomName('M19_AUD1B Auditorio 1')).toBe('AUD1B');
    expect(shortRoomName('NIE73_B103+B104 Teorialuokka')).toBe('B103+B104');
    expect(shortRoomName('M19_D247 Oppimistila')).toBe('D247');
  });

  test('keeps a bare code as it is', () => {
    expect(shortRoomName('2310')).toBe('2310');
    expect(shortRoomName('AUD1 Lecture hall')).toBe('AUD1');
  });

  test('keeps names that do not start with a code', () => {
    expect(shortRoomName('Virtual classroom')).toBe('Virtual classroom');
    expect(shortRoomName('Room 2310')).toBe('Room 2310');
  });
});

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

  test('short form uses room codes and the same fallbacks', () => {
    expect(describeRoomShort(['loc-aud1b', 'loc-2310'], rooms, labels)).toBe('AUD1B, 2310');
    expect(describeRoomShort([], rooms, labels)).toBe('No room');
    expect(describeRoomShort(['loc-unknown'], rooms, labels)).toBe('Room unavailable');
  });

  test('adds the building when known', () => {
    expect(describeRoomWithBuilding(['loc-aud1b'], rooms, labels)).toBe('M19_AUD1B Auditorio 1 · LAB');
    expect(describeRoomWithBuilding(['loc-2310'], rooms, labels)).toBe('2310');
  });
});
