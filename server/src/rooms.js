import { MAX_PLAYERS, SERVER_MESSAGES } from '../../shared/constants.js';
import { sanitizePlayerName } from '../../shared/validation.js';

class RoomError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
    this.name = 'RoomError';
  }
}

const rooms = new Map();

function createRoom(roomId, hostSocket) {
  if (rooms.has(roomId)) {
    throw new RoomError('ROOM_EXISTS', 'Room already exists.');
  }
  const room = {
    id: roomId,
    hostId: hostSocket.clientId,
    createdAt: Date.now(),
    members: new Map()
  };
  rooms.set(roomId, room);
  return room;
}

function getRoom(roomId) {
  return rooms.get(roomId);
}

function getOrCreateRoom(roomId, hostSocket) {
  return rooms.get(roomId) || createRoom(roomId, hostSocket);
}

function serializeRoom(room) {
  return {
    id: room.id,
    hostId: room.hostId,
    createdAt: room.createdAt,
    players: Array.from(room.members.values()).map(({ state }) => state)
  };
}

function attachPlayer(room, socket, playerPayload = {}) {
  if (room.members.has(socket.clientId)) {
    return room.members.get(socket.clientId);
  }
  if (room.members.size >= MAX_PLAYERS) {
    throw new RoomError('ROOM_FULL', 'Room is full.');
  }
  const playerState = {
    id: socket.clientId,
    name: sanitizePlayerName(playerPayload.name),
    isHost: room.hostId === socket.clientId,
    joinedAt: Date.now()
  };
  const participant = { socket, state: playerState };
  room.members.set(socket.clientId, participant);
  return participant;
}

function joinRoom(roomId, socket, playerPayload) {
  const room = rooms.get(roomId);
  if (!room) {
    throw new RoomError('ROOM_NOT_FOUND', 'Room not found.');
  }
  const participant = attachPlayer(room, socket, playerPayload);
  return { room, participant };
}

function leaveRoom(roomId, socket) {
  const room = rooms.get(roomId);
  if (!room) {
    return null;
  }
  const participant = room.members.get(socket.clientId);
  if (!participant) {
    return room;
  }
  room.members.delete(socket.clientId);
  if (room.hostId === socket.clientId) {
    const nextHost = room.members.values().next().value;
    room.hostId = nextHost ? nextHost.state.id : null;
    if (nextHost) {
      nextHost.state.isHost = true;
    }
  }
  if (room.members.size === 0) {
    rooms.delete(roomId);
    return null;
  }
  return room;
}

function destroyRoom(roomId) {
  const room = rooms.get(roomId);
  if (!room) return null;
  rooms.delete(roomId);
  return room;
}

function broadcastRoomState(room, type = SERVER_MESSAGES.ROOM_UPDATE) {
  const snapshot = serializeRoom(room);
  for (const { socket } of room.members.values()) {
    if (socket.readyState === socket.OPEN) {
      socket.send(JSON.stringify({ type, payload: { room: snapshot } }));
    }
  }
}

export {
  createRoom,
  getRoom,
  getOrCreateRoom,
  joinRoom,
  leaveRoom,
  destroyRoom,
  broadcastRoomState,
  serializeRoom,
  RoomError
};
