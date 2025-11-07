import { ROOM_STATUS } from '../net/messages.js';

const state = {
  status: ROOM_STATUS.IDLE,
  roomId: null,
  players: [],
  localPlayerId: null,
  lastError: null
};

const subscribers = new Set();

function notify() {
  const snapshot = getRoomState();
  for (const subscriber of subscribers) {
    subscriber(snapshot);
  }
}

export function subscribe(listener) {
  subscribers.add(listener);
  return () => subscribers.delete(listener);
}

export function getRoomState() {
  return { ...state, players: [...state.players] };
}

export function resetRoomState() {
  state.status = ROOM_STATUS.IDLE;
  state.roomId = null;
  state.players = [];
  state.localPlayerId = null;
  state.lastError = null;
  notify();
}

export function setStatus(status) {
  state.status = status;
  notify();
}

export function applyRoomSnapshot(roomSnapshot) {
  if (!roomSnapshot) {
    state.roomId = null;
    state.players = [];
  } else {
    state.roomId = roomSnapshot.id;
    state.players = roomSnapshot.players || [];
  }
  notify();
}

export function setLocalPlayerId(playerId) {
  state.localPlayerId = playerId;
  notify();
}

export function setError(code, message) {
  state.status = ROOM_STATUS.ERROR;
  state.lastError = { code, message };
  notify();
}

export function clearError() {
  state.lastError = null;
  notify();
}

export function setRoomState(partial) {
  Object.assign(state, partial);
  notify();
}
