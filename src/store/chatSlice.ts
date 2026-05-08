import {
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";

import {
  Message,
  TypingPayload,
  OnlineStatus,
} from "../types/chat";

interface ChatState {

  messages:
    Record<string, Message[]>;

  typingUsers:
    Record<string, string[]>;

  onlineUsers:
    Record<
      string,
      "online" | "offline"
    >;
}

const initialState: ChatState = {

  messages: {},

  typingUsers: {},

  onlineUsers: {},
};

const chatSlice = createSlice({
  name: "chat",

  initialState,

  reducers: {

    setMessages: (
      state,
      action: PayloadAction<{
        conversationId: string;
        messages: Message[];
      }>
    ) => {

      state.messages[
        action.payload.conversationId
      ] = action.payload.messages;
    },

    addMessage: (
      state,
      action: PayloadAction<Message>
    ) => {

      const message =
        action.payload;

      const conversationId =
        message.conversationId;

      if (
        !state.messages[
          conversationId
        ]
      ) {
        state.messages[
          conversationId
        ] = [];
      }

      state.messages[
        conversationId
      ].push(message);
    },

    setTyping: (
      state,
      action:
      PayloadAction<TypingPayload>
    ) => {

      const {
        conversationId,
        userId,
        isTyping,
      } = action.payload;

      if (
        !state.typingUsers[
          conversationId
        ]
      ) {
        state.typingUsers[
          conversationId
        ] = [];
      }

      if (isTyping) {

        if (
          !state.typingUsers[
            conversationId
          ].includes(userId)
        ) {
          state.typingUsers[
            conversationId
          ].push(userId);
        }

      } else {

        state.typingUsers[
          conversationId
        ] =
          state.typingUsers[
            conversationId
          ].filter(
            (id) => id !== userId
          );
      }
    },

    setOnlineStatus: (
      state,
      action:
      PayloadAction<OnlineStatus>
    ) => {

      const {
        userId,
        status,
      } = action.payload;

      state.onlineUsers[
        userId
      ] = status;
    },

    setOnlineUsers: (
      state,
      action: PayloadAction<Record<string, "online" | "offline">>
    ) => {
      state.onlineUsers = {
        ...state.onlineUsers,
        ...action.payload
      };
    },

    clearMessages: (
      state,
      action:
      PayloadAction<string>
    ) => {

      delete state.messages[
        action.payload
      ];
    },
  },
});

export const {

  setMessages,

  addMessage,

  setTyping,

  setOnlineStatus,

  setOnlineUsers,

  clearMessages,

} = chatSlice.actions;

export default chatSlice.reducer;