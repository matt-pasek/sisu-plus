/// <reference types="bun-types" />

import { describe, expect, test } from 'bun:test';

import { buildSession } from '@/app/schedule/__fixtures__/buildSession';
import {
  describeRoom,
  describeRoomShort,
  describeRoomWithBuilding,
  readableRoomName,
  sessionRoom,
  shortRoomName,
} from './rooms';

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

  test('adds the building when known and drops the building code from the room name', () => {
    expect(describeRoomWithBuilding(['loc-aud1b'], rooms, labels)).toBe('AUD1B Auditorio 1 · LAB');
    expect(describeRoomWithBuilding(['loc-2310'], rooms, labels)).toBe('2310');
  });
});

describe('readableRoomName', () => {
  test('keeps the room code and its name, without the building prefix', () => {
    expect(readableRoomName('M19_AUD2B Auditorio 2')).toBe('AUD2B Auditorio 2');
    expect(readableRoomName('NIE73_B103+B104 Teorialuokka')).toBe('B103+B104 Teorialuokka');
  });

  test('leaves names without a building prefix alone', () => {
    expect(readableRoomName('Virtual classroom')).toBe('Virtual classroom');
    expect(readableRoomName('2310')).toBe('2310');
  });
});

describe('sessionRoom', () => {
  const labels = { noRoom: 'No room', unavailable: 'Room unavailable' };

  test('uses the linked event location or says there is no room', () => {
    const linked = buildSession('l', '2026-10-27', 12, 14, { source: 'linked', locationText: 'Teams' });
    expect(sessionRoom(linked, {}, labels)).toBe('Teams');
    expect(sessionRoom({ ...linked, locationText: null }, {}, labels)).toBe('No room');
  });

  test('describes Sisu rooms with the chosen describer', () => {
    const sisu = buildSession('s', '2026-10-27', 12, 14, { locationIds: ['r1'] });
    const rooms = { r1: { id: 'r1', name: 'M19_AUD1B Auditorio 1', building: 'LAB' } };
    expect(sessionRoom(sisu, rooms, labels)).toBe('AUD1B');
    expect(sessionRoom(sisu, rooms, labels, describeRoomWithBuilding)).toBe('AUD1B Auditorio 1 · LAB');
  });
});
