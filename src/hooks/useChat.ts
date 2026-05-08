import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getSocket, connectSocket } from "../lib/socket";
import { setMessages, addMessage, setTyping, setOnlineUsers } from "../store/chatSlice";

export const useChatSocket = (conversationId?: string, teacherUserId?: string) => {
  const dispatch = useDispatch();
  let socket = getSocket();

  if (!socket) {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      socket = connectSocket(token);
    }
  }

  useEffect(() => {
    if (!socket || !conversationId) return;

    socket.emit("conversation:open", { conversationId });
    if (teacherUserId) {
      socket.emit("user:status:check", { userIds: [teacherUserId] });
    }

    const onHistory = (data: any) => {
      dispatch(
        setMessages({
          conversationId: data.conversationId,
          messages: data.messages,
        })
      );
    };

    const onNewMessage = (message: any) => {
      dispatch(addMessage(message));
    };

    const onTyping = (data: any) => {
      dispatch(setTyping(data));
    };

    const onStatusList = ({ statuses }: any) => {
      const mapped: Record<string, "online" | "offline"> = {};

      statuses.forEach((u: any) => {
        mapped[u.userId] = u.status;
      });

      dispatch(setOnlineUsers(mapped));
    };

    socket.on("messages:history", onHistory);
    socket.on("message:new", onNewMessage);
    socket.on("typing:update", onTyping);
    socket.on("user:status:list", onStatusList);

    return () => {
      socket.off("messages:history", onHistory);
      socket.off("message:new", onNewMessage);
      socket.off("typing:update", onTyping);
      socket.off("user:status:list", onStatusList);
    };
  }, [socket, conversationId]);
};