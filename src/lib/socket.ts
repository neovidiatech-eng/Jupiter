
import { io, Socket } from "socket.io-client";
import { baseURL } from "../consts";

let socket: Socket | null = null;

export const connectSocket = (token: string) => {
  if (!socket) {
    socket = io(baseURL, {
      auth: { token },
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("✅ Socket Connected! ID:", socket?.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Socket Disconnected! Reason:", reason);
    });

    socket.on("connect_error", (error) => {
      console.error("⚠️ Socket Connection Error:", error.message);
    });

    // Global listener for online status
    socket.on("user:status", (data) => {
      import("../store/store").then(({ store }) => {
        import("../store/chatSlice").then(({ setOnlineStatus }) => {
          store.dispatch(setOnlineStatus(data));
        });
      });
    });
  }

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    throw new Error("Socket not connected");
  }

  return socket;
};

export const disconnectSocket = () => {
  socket?.disconnect();
};