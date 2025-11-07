const ROOM_ID_PATTERN = /^[A-Z0-9]{4,8}$/;
const MAX_NAME_LENGTH = 24;

export function normalizeRoomId(roomId) {
  if (!roomId) return '';
  return roomId.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
}

export function isValidRoomId(roomId) {
  if (!roomId) return false;
  return ROOM_ID_PATTERN.test(roomId);
}

export function sanitizePlayerName(name) {
  if (!name) return 'Player';
  return name.toString().trim().replace(/\s+/g, ' ').slice(0, MAX_NAME_LENGTH);
}
