import {
  connectToServer,
  requestRoomCreation,
  requestJoinRoom,
  requestLeaveRoom,
  registerMessageHandler
} from '../net/networking.js';
import {
  ROOM_STATUS,
  SERVER_MESSAGES,
  MAX_PLAYERS
} from '../net/messages.js';
import {
  subscribe,
  getRoomState,
  clearError,
  resetRoomState,
  setError
} from '../state/roomState.js';
import {
  normalizeRoomId,
  isValidRoomId,
  sanitizePlayerName
} from '../../shared/validation.js';

const statusMessages = {
  [ROOM_STATUS.IDLE]: 'Enter a room code or create a new lobby.',
  [ROOM_STATUS.CONNECTING]: 'Connecting to server…',
  [ROOM_STATUS.JOINING]: 'Joining lobby…',
  [ROOM_STATUS.JOINED]: 'Joined! Waiting for players…',
  [ROOM_STATUS.ERROR]: 'An error occurred.'
};

export function initializeLobby({ serverUrl, onRoomJoined, onSoloStart }) {
  const overlay = document.getElementById('lobbyOverlay');
  const roomCodeInput = document.getElementById('roomCodeInput');
  const displayNameInput = document.getElementById('displayNameInput');
  const createButton = document.getElementById('createRoomButton');
  const joinButton = document.getElementById('joinRoomButton');
  const leaveButton = document.getElementById('leaveRoomButton');
  const statusText = document.getElementById('lobbyStatusText');
  const playerList = document.getElementById('lobbyPlayerList');
  const errorBanner = document.getElementById('lobbyErrorBanner');
  const errorText = document.getElementById('lobbyErrorText');
  const playSoloButton = document.getElementById('playSoloButton');

  if (!overlay) {
    throw new Error('Lobby overlay element missing.');
  }

  let hasJoined = false;

  function updateStatus(state) {
    const message = state.lastError
      ? `${state.lastError.message} (${state.lastError.code})`
      : statusMessages[state.status] || statusMessages[ROOM_STATUS.IDLE];
    statusText.textContent = message;
    if (state.lastError) {
      errorBanner.classList.remove('hidden');
      errorText.textContent = state.lastError.message;
    } else {
      errorBanner.classList.add('hidden');
      errorText.textContent = '';
    }
    leaveButton.disabled = !state.roomId;
  }

  function renderPlayers(state) {
    playerList.innerHTML = '';
    const players = state.players;
    if (!players || players.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'Waiting for players…';
      playerList.appendChild(li);
      return;
    }
    for (const player of players) {
      const li = document.createElement('li');
      li.className = 'lobby-player';
      li.textContent = player.name || 'Player';
      if (player.isHost) {
        const span = document.createElement('span');
        span.className = 'lobby-player-tag';
        span.textContent = 'Host';
        li.appendChild(span);
      }
      playerList.appendChild(li);
    }
    const remaining = MAX_PLAYERS - players.length;
    for (let i = 0; i < remaining; i += 1) {
      const placeholder = document.createElement('li');
      placeholder.className = 'lobby-player placeholder';
      placeholder.textContent = 'Open Slot';
      playerList.appendChild(placeholder);
    }
  }

  subscribe(state => {
    updateStatus(state);
    renderPlayers(state);
    if (state.status === ROOM_STATUS.JOINED && !hasJoined) {
      hasJoined = true;
      overlay.classList.add('hidden');
      onRoomJoined?.(state);
    }
  });

  registerMessageHandler(SERVER_MESSAGES.ROOM_CLOSED, ({ roomId }) => {
    const state = getRoomState();
    if (state.roomId === roomId) {
      resetRoomState();
      hasJoined = false;
      overlay.classList.remove('hidden');
    }
  });

  function attemptAction(action) {
    clearError();
    const normalizedRoomId = normalizeRoomId(roomCodeInput.value);
    roomCodeInput.value = normalizedRoomId;
    if (!isValidRoomId(normalizedRoomId)) {
      setError('BAD_ROOM_ID', 'Room codes must be 4-8 letters or numbers.');
      return;
    }
    const playerName = sanitizePlayerName(displayNameInput.value);
    displayNameInput.value = playerName;
    action({ roomId: normalizedRoomId, player: { name: playerName } });
  }

  createButton.addEventListener('click', async () => {
    try {
      await connectToServer(serverUrl);
      attemptAction(({ roomId, player }) =>
        requestRoomCreation({ url: serverUrl, roomId, player })
      );
    } catch (error) {
      setError('CONNECTION_ERROR', 'Unable to connect to server.');
      console.error(error);
    }
  });

  joinButton.addEventListener('click', async () => {
    try {
      await connectToServer(serverUrl);
      attemptAction(({ roomId, player }) =>
        requestJoinRoom({ url: serverUrl, roomId, player })
      );
    } catch (error) {
      setError('CONNECTION_ERROR', 'Unable to connect to server.');
      console.error(error);
    }
  });

  leaveButton.addEventListener('click', () => {
    requestLeaveRoom();
    hasJoined = false;
    resetRoomState();
    overlay.classList.remove('hidden');
  });

  if (playSoloButton) {
    playSoloButton.addEventListener('click', () => {
      overlay.classList.add('hidden');
      hasJoined = true;
      resetRoomState();
      clearError();
      onSoloStart?.();
    });
  }

  return {
    show({ playerName = '' } = {}) {
      overlay.classList.remove('hidden');
      displayNameInput.value = sanitizePlayerName(playerName);
      if (!roomCodeInput.value) {
        roomCodeInput.focus();
      }
      const state = getRoomState();
      updateStatus(state);
      renderPlayers(state);
      hasJoined = false;
    },
    hide() {
      overlay.classList.add('hidden');
    }
  };
}
