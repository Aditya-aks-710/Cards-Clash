import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { socket } from './socket';
import { useSocket } from './useSocket';
import ConnectionBadge from './ConnectionBadge';
import OnlineHome from './screens/OnlineHome';
import Lobby from './screens/Lobby';
import PartnerSelect from './screens/PartnerSelect';
import TeamsReveal from './screens/TeamsReveal';

const variants = {
  initial: { opacity: 0, y: 24, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -20, scale: 0.98 },
};

export default function OnlineApp({ onExit }) {
  const { connected } = useSocket();
  const [room, setRoom] = useState(null);       // authoritative room state from the server
  const [playerId, setPlayerId] = useState(null);
  const [mine, setMine] = useState(null);        // my partner pick (local, optimistic)
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // room_update is the single source of truth; resync on (re)connect and when the tab refocuses
  useEffect(() => {
    const onUpdate = (r) => setRoom(r);
    const resync = () => socket.emit('sync', (res) => { if (res?.room) setRoom(res.room); });
    const onVisible = () => { if (!document.hidden) resync(); };
    socket.on('room_update', onUpdate);
    socket.on('connect', resync);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      socket.off('room_update', onUpdate);
      socket.off('connect', resync);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  // reset my pick whenever we're not actively selecting partners
  useEffect(() => {
    if (room?.phase !== 'partner_select') setMine(null);
  }, [room?.phase]);

  const create = (name) => {
    setError('');
    setBusy(true);
    socket.emit('create_room', { name }, (res) => {
      setBusy(false);
      if (!res?.ok) return setError(res?.error || 'Could not create room');
      setPlayerId(res.playerId);
      setRoom(res.room);
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
    });
  };

  const leaveRoom = () => {
    socket.emit('leave_room');
    setRoom(null);
    setError('');
  };

  // keep the singleton socket connected across offline/online toggles to avoid churn
  const handleExit = () => {
    socket.emit('leave_room');
    setRoom(null);
    onExit?.();
  };

  const pickPartner = (targetId) => {
    setMine(targetId);
    socket.emit('pick_partner', { targetId }, (res) => { if (!res?.ok) setMine(null); });
  };

  const view = !room
    ? 'home'
    : room.phase === 'partner_select'
      ? 'partner'
      : room.phase === 'teams'
        ? 'teams'
        : 'lobby';

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
            {view === 'home' && (
              <OnlineHome onCreate={create} onJoin={join} onExit={handleExit} error={error} busy={busy} />
            )}
            {view === 'lobby' && <Lobby room={room} playerId={playerId} onLeave={leaveRoom} />}
            {view === 'partner' && (
              <PartnerSelect
                players={room.players}
                playerId={playerId}
                mine={mine}
                picked={room.picked}
                total={4}
                onPick={pickPartner}
              />
            )}
            {view === 'teams' && <TeamsReveal data={room.teams} playerId={playerId} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
