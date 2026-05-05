import { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  setMessages,
  addMessage,
  setTyping,
  setOnlineStatus,
} from "../store/chatSlice";
import { getSocket } from "../lib/socket";

export const useChatSocket = (conversationId?: string) => {
  const dispatch = useDispatch();
  const socket = getSocket();

  useEffect(() => {
    if (!socket) return;

    // open conversation
    if (conversationId) {
      socket.emit("conversation:open", { conversationId });
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

    return () => {
      socket.off("messages:history");
      socket.off("message:new");
      socket.off("typing:update");
      socket.off("user:status");
    };
  }, [conversationId]);
};