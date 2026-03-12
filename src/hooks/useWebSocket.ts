import { useEffect, useRef } from 'react';
import { logger } from '../utils/logger';

export const useWebSocket = (url: string, onMessage?: (data: any) => void) => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = () => {
    try {
      wsRef.current = new WebSocket(url);

      wsRef.current.onopen = () => {
        logger.log('WebSocket connected');
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage?.(data);
        } catch (error) {
          logger.error('WebSocket message parse error:', error);
        }
      };

      wsRef.current.onerror = (error) => {
        logger.error('WebSocket error:', error);
      };

      wsRef.current.onclose = () => {
        logger.log('WebSocket disconnected');
        // Auto-reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      };
    } catch (error) {
      logger.error('WebSocket connection error:', error);
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  };

  useEffect(() => {
    connect();
    return disconnect;
  }, [url]);

  return { disconnect, ws: wsRef.current };
};
