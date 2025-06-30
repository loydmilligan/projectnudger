import { useCallback, useEffect, useState } from 'react';
import { m5DialBLEService } from '../services/M5DialBLEService';

export default function useM5Dial() {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null); // raw or parsed JSON from device

  const connect = useCallback(async () => {
    setConnecting(true);
    setError(null);
    try {
      await m5DialBLEService.connect();
    } catch (e) {
      setError(e);
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    m5DialBLEService.disconnect();
  }, []);

  const sendCommand = useCallback((cmd) => m5DialBLEService.sendCommand(cmd), []);

  useEffect(() => {
    function onConnect() { setConnected(true); }
    function onDisconnect() { setConnected(false); }
    function onStatus(e) { setStatus(e.detail); }
    function onError(e) { setError(e.detail); }

    m5DialBLEService.addEventListener('connected', onConnect);
    m5DialBLEService.addEventListener('disconnected', onDisconnect);
    m5DialBLEService.addEventListener('status', onStatus);
    m5DialBLEService.addEventListener('error', onError);

    return () => {
      m5DialBLEService.removeEventListener('connected', onConnect);
      m5DialBLEService.removeEventListener('disconnected', onDisconnect);
      m5DialBLEService.removeEventListener('status', onStatus);
      m5DialBLEService.removeEventListener('error', onError);
    };
  }, []);

  return {
    connected,
    connecting,
    error,
    status,
    connect,
    disconnect,
    sendCommand,
  };
}
