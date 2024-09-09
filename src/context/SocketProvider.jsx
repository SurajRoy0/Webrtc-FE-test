// Add this line at the very top of the file
"use client";

import { createContext, useContext, useMemo } from 'react';
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
  const socket = useContext(SocketContext);
  if (!socket) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return socket;
};

export const SocketProvider = ({ children }) => {
  console.log(process.env.NEXT_PUBLIC_SOCKET_API, "process.env.NEXT_PUBLIC_SOCKET_API")
  const socket = useMemo(() => io(process.env.NEXT_PUBLIC_SOCKET_API), []);
  

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
