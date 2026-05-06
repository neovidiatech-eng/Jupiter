import { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  setMessages,
  addMessage,
  setTyping,
  setOnlineStatus,
  setOnlineUsers,
} from "../store/chatSlice";
import { getSocket } from "../lib/socket";

export const useChatSocket = (conversationId?: string) => {
  const dispatch = useDispatch();
  const socket = getSocket();

  useEffect(() => {
    if (!socket) return;

    // open conversation
    if (conversationId) {
      console.log("🔌 Socket connected:", socket.connected);
      socket.emit("conversation:open", { conversationId });
      // Request initial statuses for participants in this conversation
      socket.emit("user:status:get", { conversationId });
    }

    socket.on("messages:history", ({ messages }) => {
      dispatch(setMessages(messages));
    });

    socket.on("message:new", (message) => {
      dispatch(addMessage(message));
    });

    socket.on("typing:update", (data) => {
      dispatch(setTyping(data));
    });

    socket.on("user:status", (data) => {
      dispatch(setOnlineStatus(data));
    });
    socket.on("user:status:list", ({ statuses }) => {
  dispatch(setOnlineUsers(statuses));
});

    return () => {
      socket.off("messages:history");
      socket.off("message:new");
      socket.off("typing:update");
      socket.off("user:status");
      socket.off("user:status:list");
    };
  }, [conversationId, socket]);
};