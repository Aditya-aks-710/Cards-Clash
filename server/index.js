import { createServer } from 'http';
import { Server } from 'socket.io';
import { createRoom, getRoom, deleteRoom, publicRoom, MAX_PLAYERS } from './rooms.js';

const PORT = process.env.PORT || 3001;
// In production, set CLIENT_ORIGIN to the deployed frontend URL. '*' is fine for local dev.
const ORIGIN = process.env.CLIENT_ORIGIN || '*';

const httpServer = createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('ok');
    return;
  }
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Card Clash server');
});

const io = new Server(httpServer, {
  cors: { origin: ORIGIN, methods: ['GET', 'POST'] },
});

const sanitizeName = (n) => String(n || '').trim().slice(0, 16) || 'Player';
const ack = (cb, payload) => { if (typeof cb === 'function') cb(payload); };

io.on('connection', (socket) => {
  // which room this socket currently belongs to (null when in none)
  let joinedCode = null;

  socket.on('create_room', ({ name } = {}, cb) => {
    leaveCurrent();
    const player = { id: socket.id, name: sanitizeName(name), connected: true };
    const room = createRoom(player);
    socket.join(room.code);
    joinedCode = room.code;
    ack(cb, { ok: true, code: room.code, playerId: socket.id, room: publicRoom(room) });
    io.to(room.code).emit('room_update', publicRoom(room));
    console.log(`[create] ${player.name} -> ${room.code}`);
  });

  socket.on('join_room', ({ code, name } = {}, cb) => {
    const room = getRoom(code);
    if (!room) return ack(cb, { ok: false, error: 'Room not found' });
    if (room.phase !== 'lobby') return ack(cb, { ok: false, error: 'Game already started' });
    if (room.players.some((p) => p.id === socket.id)) {
      return ack(cb, { ok: true, code: room.code, playerId: socket.id, room: publicRoom(room) });
    }
    if (room.players.length >= MAX_PLAYERS) return ack(cb, { ok: false, error: 'Room is full' });

    leaveCurrent();
    room.players.push({ id: socket.id, name: sanitizeName(name), connected: true });
    socket.join(room.code);
    joinedCode = room.code;
    ack(cb, { ok: true, code: room.code, playerId: socket.id, room: publicRoom(room) });
    io.to(room.code).emit('room_update', publicRoom(room));
    console.log(`[join] ${sanitizeName(name)} -> ${room.code} (${room.players.length}/${MAX_PLAYERS})`);
  });

  socket.on('leave_room', () => leaveCurrent());
  socket.on('disconnect', () => leaveCurrent());

  function leaveCurrent() {
    if (!joinedCode) return;
    const room = getRoom(joinedCode);
    const code = joinedCode;
    joinedCode = null;
    if (!room) return;

    room.players = room.players.filter((p) => p.id !== socket.id);
    socket.leave(code);

    if (room.players.length === 0) {
      deleteRoom(code);
      console.log(`[close] ${code}`);
      return;
    }
    if (room.hostId === socket.id) room.hostId = room.players[0].id; // hand off host
    io.to(code).emit('room_update', publicRoom(room));
  }
});

httpServer.listen(PORT, () => {
  console.log(`Card Clash server listening on :${PORT} (origin: ${ORIGIN})`);
});
