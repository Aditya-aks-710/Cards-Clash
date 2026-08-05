import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { socket } from './socket';
import { useSocket } from './useSocket';
import ConnectionBadge from './ConnectionBadge';
import OnlineHome from './screens/OnlineHome';
import Lobby from './screens/Lobby';

const variants = {
  initial: { opacity: 0, y: 24, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.98 },
};

export default function OnlineApp({ onExit }) {
  const { connected } = useSocket();
  const [view, setView] = useState('home'); // home | lobby
  const [room, setRoom] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // keep the lobby roster live
  useEffect(() => {
    const onUpdate = (r) => setRoom(r);
    socket.on('room_update', onUpdate);
    return () => socket.off('room_update', onUpdate);
  }, []);

  const create = (name) => {
    setError('');
    setBusy(true);
    socket.emit('create_room', { name }, (res) => {
      setBusy(false);
      if (!res?.ok) return setError(res?.error || 'Could not create room');
      setPlayerId(res.playerId);
      setRoom(res.room);
      setView('lobby');
    });
  };

  const join = (name, code) => {
    if (!String(code || '').trim()) return setError('Enter a room code');
    setError('');
    setBusy(true);
    socket.emit('join_room', { name, code }, (res) => {
      setBusy(false);
      if (!res?.ok) return setError(res?.error || 'Could not join room');
      setPlayerId(res.playerId);
      setRoom(res.room);
      setView('lobby');
    });
  };

  const leaveRoom = () => {
    socket.emit('leave_room');
    setRoom(null);
    setError('');
    setView('home');
  };

  // keep the singleton socket connected across offline/online toggles to avoid churn
  const handleExit = () => {
    socket.emit('leave_room');
    setRoom(null);
    onExit?.();
  };

  return (
    <main className="relative z-0 mx-auto w-full max-w-4xl px-4 sm:px-6 py-6 sm:py-10 min-h-[100dvh] flex items-center">
      <ConnectionBadge connected={connected} />
      <div className="w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {view === 'home' ? (
              <OnlineHome onCreate={create} onJoin={join} onExit={handleExit} error={error} busy={busy} />
            ) : (
              <Lobby room={room} playerId={playerId} onLeave={leaveRoom} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
