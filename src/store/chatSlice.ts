import { Message } from "../types/chat";
import { createSlice } from "@reduxjs/toolkit";

interface ChatState {
  messages: Message[];
  typingUsers: Record<string, boolean>;
  onlineUsers: Record<string, string>;
}

const initialState: ChatState = {
  messages: [],
  typingUsers: {},
  onlineUsers: {},
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    setTyping: (state, action) => {
      const { userId, isTyping } = action.payload;
      state.typingUsers[userId] = isTyping;
    },
    setOnlineStatus: (state, action) => {
      const { userId, status } = action.payload;
      state.onlineUsers[userId] = status;
    },
    setOnlineUsers: (state, action) => {
      if (Array.isArray(action.payload)) {
        action.payload.forEach((user: any) => {
          state.onlineUsers[user.userId || user.id] = user.status;
        });
      } else if (typeof action.payload === 'object' && action.payload !== null) {
        state.onlineUsers = { ...state.onlineUsers, ...action.payload };
      }
    },
  },
});

export const {
  setMessages,
  addMessage,
  setTyping,
  setOnlineStatus,
  setOnlineUsers
} = chatSlice.actions;

export default chatSlice.reducer;