import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { nanoid } from 'nanoid';

import {
  CLIENT_MESSAGES,
  SERVER_MESSAGES,
  DEFAULT_SERVER_PORT
} from '../../shared/constants.js';
import {
  isValidRoomId,
  normalizeRoomId,
  sanitizePlayerName
} from '../../shared/validation.js';
import {
  createRoom,
  joinRoom,
  leaveRoom,
  destroyRoom,
  broadcastRoomState,
  serializeRoom,
  RoomError,
  getRoom
} from './rooms.js';

const PORT = process.env.PORT || DEFAULT_SERVER_PORT;

const httpServer = createServer();
const wss = new WebSocketServer({ server: httpServer });

function send(socket, type, payload = {}) {
  if (socket.readyState === socket.OPEN) {
    socket.send(JSON.stringify({ type, payload }));
  }
}

function ensureRoomId(rawId) {
  const normalized = normalizeRoomId(rawId);
  if (!isValidRoomId(normalized)) {
    throw new RoomError('BAD_ROOM_ID', 'Room codes must be 4-8 alphanumeric characters.');
  }
  return normalized;
}

function handleCreateRoom(socket, payload = {}) {
  const roomId = ensureRoomId(payload.roomId);
  if (socket.activeRoomId) {
    handleLeaveRoom(socket);
  }
  const room = createRoom(roomId, socket);
  const { room: joinedRoom, participant } = joinRoom(roomId, socket, payload.player || {});
  socket.activeRoomId = roomId;
  send(socket, SERVER_MESSAGES.ROOM_CREATED, { room: serializeRoom(room) });
  send(socket, SERVER_MESSAGES.ROOM_JOINED, {
    room: serializeRoom(joinedRoom),
    playerId: participant.state.id
  });
  broadcastRoomState(joinedRoom);
}

function handleJoinRoom(socket, payload = {}) {
  const roomId = ensureRoomId(payload.roomId);
  const player = payload.player || {};
  player.name = sanitizePlayerName(player.name);
  if (socket.activeRoomId && socket.activeRoomId !== roomId) {
    handleLeaveRoom(socket);
  }
  const { room, participant } = joinRoom(roomId, socket, player);
  socket.activeRoomId = roomId;
  send(socket, SERVER_MESSAGES.ROOM_JOINED, {
    room: serializeRoom(room),
    playerId: participant.state.id
  });
  broadcastRoomState(room);
}

function handleLeaveRoom(socket) {
  const roomId = socket.activeRoomId;
  if (!roomId) return;
  const room = leaveRoom(roomId, socket);
  socket.activeRoomId = null;
  if (room) {
    broadcastRoomState(room);
  } else {
    sendRoomClosed(roomId);
  }
}

function sendRoomClosed(roomId) {
  for (const client of wss.clients) {
    if (client.readyState === client.OPEN && client.activeRoomId === roomId) {
      send(client, SERVER_MESSAGES.ROOM_CLOSED, { roomId });
    }
  }
}

function handlePlayerUpdate(socket, payload = {}) {
  const roomId = socket.activeRoomId;
  if (!roomId) return;
  const room = getRoom(roomId);
  if (!room) return;
  const participant = room.members.get(socket.clientId);
  if (!participant) return;
  participant.state = {
    ...participant.state,
    ...payload.state
  };
  broadcastRoomState(room);
}

wss.on('connection', socket => {
  socket.clientId = nanoid(10);
  socket.activeRoomId = null;

  socket.on('message', data => {
    let message;
    try {
      message = JSON.parse(data);
    } catch (err) {
      send(socket, SERVER_MESSAGES.ROOM_ERROR, {
        code: 'BAD_PAYLOAD',
        message: 'Invalid JSON payload.'
      });
      return;
    }

    const { type, payload } = message;
    try {
      switch (type) {
        case CLIENT_MESSAGES.CREATE_ROOM:
          handleCreateRoom(socket, payload);
          break;
        case CLIENT_MESSAGES.JOIN_ROOM:
          handleJoinRoom(socket, payload);
          break;
        case CLIENT_MESSAGES.LEAVE_ROOM:
          handleLeaveRoom(socket);
          break;
        case CLIENT_MESSAGES.PLAYER_UPDATE:
          handlePlayerUpdate(socket, payload);
          break;
        default:
          send(socket, SERVER_MESSAGES.ROOM_ERROR, {
            code: 'UNKNOWN_EVENT',
            message: `Unknown event: ${type}`
          });
      }
    } catch (error) {
      if (error instanceof RoomError) {
        send(socket, SERVER_MESSAGES.ROOM_ERROR, {
          code: error.code,
          message: error.message
        });
      } else {
        console.error('Unexpected room error', error);
        send(socket, SERVER_MESSAGES.ROOM_ERROR, {
          code: 'SERVER_ERROR',
          message: 'An unexpected server error occurred.'
        });
      }
    }
  });

  socket.on('close', () => {
    const roomId = socket.activeRoomId;
    handleLeaveRoom(socket);
    if (roomId && !socket.activeRoomId) {
      const destroyed = destroyRoom(roomId);
      if (destroyed) {
        sendRoomClosed(roomId);
      }
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Strikr multiplayer server listening on port ${PORT}`);
});
