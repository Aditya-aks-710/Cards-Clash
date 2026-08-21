import { customAlphabet } from 'nanoid';

// Room-code alphabet with ambiguous characters (0/O, 1/I) removed.
const makeCode = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 6);

export const MAX_PLAYERS = 4;

/** code -> room. In-memory for now (swap for Redis if we ever scale horizontally). */
const rooms = new Map();

export function createRoom(hostPlayer) {
  let code;
  do {
    code = makeCode();
  } while (rooms.has(code));

  const room = {
    code,
    hostId: hostPlayer.id,
    phase: 'lobby', // lobby | partner | trump | bidding | playing | ...
    players: [hostPlayer],
    createdAt: Date.now(),
  };
  rooms.set(code, room);
  return room;
}

export function getRoom(code) {
  return rooms.get(String(code || '').trim().toUpperCase());
}

export function deleteRoom(code) {
  rooms.delete(code);
}

/** The safe, public view of a room (no hidden game state — matters once cards exist). */
export function publicRoom(room) {
  return {
    code: room.code,
    phase: room.phase,
    hostId: room.hostId,
    players: room.players.map((p) => ({
      id: p.id,
      name: p.name,
      isHost: p.id === room.hostId,
      connected: p.connected,
    })),
    picked: room.picks ? Object.keys(room.picks).length : 0,
    teams: room.teamsPublic || null,
  };
}
