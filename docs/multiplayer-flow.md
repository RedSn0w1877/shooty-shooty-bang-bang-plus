# Multiplayer Room Flow

## Creating a room

1. Client connects to the WebSocket endpoint (`ws://<host>:3001`).
2. Client emits `create_room` with the desired room code and player name.
3. Server validates the code, creates the room, assigns the caller as host, and registers them as the first player.
4. Server replies with `room_created` immediately followed by `room_joined`.
5. Client stores the returned `playerId`/`room` payload and transitions to the lobby/gameplay view.

## Joining a room

1. Client connects to the server (reusing the same socket when possible).
2. Client emits `join_room` with the existing room code and player name.
3. Server validates the code, ensures capacity (`MAX_PLAYERS = 4`), and adds the player.
4. Server responds with `room_joined` (to the caller) and `room_update` (to everyone).
5. All connected clients refresh their roster displays based on the broadcast payload.

## Leaving a room / disconnecting

1. Client emits `leave_room` or simply disconnects.
2. Server removes the player from the room.
3. If the room becomes empty it is destroyed and a `room_closed` event is emitted.
4. Remaining players receive a `room_update` broadcast so their lobby reflects the change.

## Error cases

* `ROOM_EXISTS`: Attempted to create a room that already exists.
* `ROOM_NOT_FOUND`: Attempted to join a room that has been closed.
* `ROOM_FULL`: Attempted to join a room that already has four players.
* `BAD_PAYLOAD`: Payload was missing required fields or malformed JSON.

Each error emits `room_error` with both an error `code` and a human-readable `message`.
