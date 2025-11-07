export const MAX_PLAYERS = 4;

export const CLIENT_MESSAGES = {
  CREATE_ROOM: 'create_room',
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  PLAYER_UPDATE: 'player_update'
};

export const SERVER_MESSAGES = {
  ROOM_CREATED: 'room_created',
  ROOM_JOINED: 'room_joined',
  ROOM_UPDATE: 'room_update',
  ROOM_CLOSED: 'room_closed',
  ROOM_ERROR: 'room_error'
};

export const ROOM_STATUS = {
  IDLE: 'idle',
  CONNECTING: 'connecting',
  JOINING: 'joining',
  JOINED: 'joined',
  ERROR: 'error'
};

export const DEFAULT_SERVER_PORT = 3001;
