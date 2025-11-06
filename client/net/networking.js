import {
  CLIENT_MESSAGES,
  SERVER_MESSAGES,
  ROOM_STATUS
} from './messages.js';
import {
  setStatus,
  applyRoomSnapshot,
  setLocalPlayerId,
  setError,
  clearError,
  getRoomState
} from '../state/roomState.js';

let socket = null;
let connectionPromise = null;
const messageListeners = new Map();

function dispatchMessage(eventType, payload) {
  const listeners = messageListeners.get(eventType);
  if (!listeners) return;
  for (const listener of listeners) {
    listener(payload);
  }
}

function registerSocketListeners(ws) {
  ws.addEventListener('message', event => {
    try {
      const { type, payload } = JSON.parse(event.data);
      switch (type) {
        case SERVER_MESSAGES.ROOM_CREATED:
          applyRoomSnapshot(payload.room);
          dispatchMessage(type, payload);
          break;
        case SERVER_MESSAGES.ROOM_JOINED:
          applyRoomSnapshot(payload.room);
          setLocalPlayerId(payload.playerId);
          setStatus(ROOM_STATUS.JOINED);
          clearError();
          dispatchMessage(type, payload);
          break;
        case SERVER_MESSAGES.ROOM_UPDATE:
          applyRoomSnapshot(payload.room);
          dispatchMessage(type, payload);
          break;
        case SERVER_MESSAGES.ROOM_CLOSED:
          dispatchMessage(type, payload);
          break;
        case SERVER_MESSAGES.ROOM_ERROR:
          setError(payload.code, payload.message);
          dispatchMessage(type, payload);
          break;
        default:
          dispatchMessage(type, payload);
      }
    } catch (error) {
      console.error('Failed to parse message', error);
    }
  });

  ws.addEventListener('close', () => {
    const state = getRoomState();
    socket = null;
    connectionPromise = null;
    if (state.status !== ROOM_STATUS.ERROR) {
      setStatus(ROOM_STATUS.IDLE);
    }
  });
}

export function connectToServer(url) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    return Promise.resolve(socket);
  }
  if (!connectionPromise) {
    setStatus(ROOM_STATUS.CONNECTING);
    connectionPromise = new Promise((resolve, reject) => {
      const ws = new WebSocket(url);
      ws.addEventListener('open', () => {
        socket = ws;
        setStatus(ROOM_STATUS.IDLE);
        registerSocketListeners(ws);
        resolve(ws);
      });
      ws.addEventListener('error', event => {
        connectionPromise = null;
        reject(event);
      });
      ws.addEventListener('close', () => {
        if (!socket) {
          connectionPromise = null;
        }
      });
    });
  }
  return connectionPromise;
}

function send(type, payload) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    throw new Error('Socket is not connected');
  }
  socket.send(JSON.stringify({ type, payload }));
}

export async function requestRoomCreation({ url, roomId, player }) {
  await connectToServer(url);
  setStatus(ROOM_STATUS.JOINING);
  send(CLIENT_MESSAGES.CREATE_ROOM, { roomId, player });
}

export async function requestJoinRoom({ url, roomId, player }) {
  await connectToServer(url);
  setStatus(ROOM_STATUS.JOINING);
  send(CLIENT_MESSAGES.JOIN_ROOM, { roomId, player });
}

export function requestLeaveRoom() {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    return;
  }
  send(CLIENT_MESSAGES.LEAVE_ROOM);
}

export function registerMessageHandler(type, handler) {
  const handlers = messageListeners.get(type) || new Set();
  handlers.add(handler);
  messageListeners.set(type, handlers);
  return () => {
    handlers.delete(handler);
    if (handlers.size === 0) {
      messageListeners.delete(type);
    }
  };
}
