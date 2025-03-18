'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

interface SettingData {
  fridge_id: number;
  instrument_name: string;
  parameter_name: string;
  applied_value: number;
  timestamp: number;
}

interface WebSocketContextType {
  liveData: SettingData[];
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextType>({
  liveData: [],
  isConnected: false,
  connect: () => {},
  disconnect: () => {},
});

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [liveData, setLiveData] = useState<SettingData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  const connect = () => {
    if (socketRef.current?.readyState === WebSocket.OPEN) return;
    
    const socket = new WebSocket('ws://localhost:8000/ws/live');
    socketRef.current = socket;
    
    socket.onopen = () => {
      console.log('WebSocket connection established');
      setIsConnected(true);
    };
    
    socket.onmessage = (event) => {
      const newData = JSON.parse(event.data);
      setLiveData(prevData => {
        const updatedData = [newData, ...prevData];
        return updatedData.slice(0, 100);
      });
    };
    
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };
    
    socket.onclose = () => {
      console.log('WebSocket connection closed');
      setIsConnected(false);
    };
  };

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
      setIsConnected(false);
    }
  };

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ liveData, isConnected, connect, disconnect }}>
      {children}
    </WebSocketContext.Provider>
  );
};