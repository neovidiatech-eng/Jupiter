import { useRef } from "react";
import { Socket } from "socket.io-client";

export const useTyping =
(
  socket: Socket,
  conversationId: string
) => {

  const typingTimeout =
    useRef<NodeJS.Timeout>();

  const emitTyping =
  () => {

    socket.emit(
      "typing:start",
      { conversationId }
    );

    clearTimeout(
      typingTimeout.current
    );

    typingTimeout.current =
      setTimeout(() => {

        socket.emit(
          "typing:stop",
          { conversationId }
        );

      }, 1000);
  };

  return emitTyping;
};