# Strikr Multiplayer Server

Node.js WebSocket backend that manages 4-player rooms for Strikr.

## Setup

```bash
cd server
npm install
npm run dev
```

By default the server listens on port `3001`. Configure an alternative port with the `PORT` environment variable.

## Message schema

### Client ➜ Server

| Event | Payload | Description |
|-------|---------|-------------|
| `create_room` | `{ roomId: string, player: { name: string } }` | Create a room and join as host. |
| `join_room` | `{ roomId: string, player: { name: string } }` | Join an existing room. |
| `leave_room` | `{} or undefined` | Leave the current room. |
| `player_update` | `{ state: object }` | Placeholder for future gameplay synchronization. |

### Server ➜ Client

| Event | Payload | Description |
|-------|---------|-------------|
| `room_created` | `{ room: RoomSnapshot }` | Confirmation that the room was created. |
| `room_joined` | `{ room: RoomSnapshot, playerId: string }` | Confirmation of a successful join. |
| `room_update` | `{ room: RoomSnapshot }` | Broadcast roster update. |
| `room_closed` | `{ roomId: string }` | Room was destroyed (usually because the host left). |
| `room_error` | `{ code: string, message: string }` | Something went wrong. |

```
type RoomSnapshot = {
  id: string;
  hostId: string;
  createdAt: number;
  players: Array<{
    id: string;
    name: string;
    isHost: boolean;
    joinedAt: number;
  }>;
};
```
