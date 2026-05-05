import { io, Socket } from "socket.io-client";
import { baseURL } from "../consts";

let socket: Socket | null = null;

export const connectSocket = (token: string) => {
  socket = io(baseURL, {
    auth: { token },
  });
};

export const getSocket = () => {
  return socket;
};
export const disconnectSocket = () => {
  socket?.disconnect();
}