import { useEffect, useState } from 'react';
import { socket } from './socket';

/** Connects the shared socket on mount and tracks connection status. */
export function useSocket() {
  const [connected, setConnected] = useState(socket.connected);

  useEffect(() => {
    if (!socket.connected) socket.connect();
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  return { socket, connected };
}
