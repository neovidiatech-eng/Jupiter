import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { useMessages } from "../../../../hooks/useMessages";
import { setMessages } from "../../../../store/chatSlice";
import ChatHeader from "./components/ChatHeader";
import ChatSidebar from "./components/ChatSidebar";
import ChatMessages from "./components/ChatMessages";
import ChatInput from "./components/ChatInput";
import { useChatSocket } from "../../../../hooks/useChat";
import { getSocket } from "../../../../lib/socket";
import { useTyping } from "../../../../hooks/useTyping";
import { Socket } from "socket.io-client";

export default function StudentChat() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const state = location.state as {
    conversationId: string;
    teacherId?: string;
    teacherUserId?: string;
    teacherName?: string;
    teacherSubject?: string;
    sessionTitle?: string;
    sessionTime?: string;
  } | null;

  // Use session storage as fallback for reload
  const [chatState] = useState(() => {
    if (state) {
      sessionStorage.setItem("currentChat", JSON.stringify(state));
      return state;
    }
    const saved = sessionStorage.getItem("currentChat");
    return saved ? JSON.parse(saved) : null;
  });

  const conversationId = chatState?.conversationId;
  const teacherUserId = chatState?.teacherUserId;
  const teacherName = chatState?.teacherName || "Instructor";
  const teacherSubject = chatState?.teacherSubject || "Specialist";
  const sessionTitle = chatState?.sessionTitle || "General Curriculum";

  // Initialize socket listeners for this conversation
  useChatSocket(conversationId, teacherUserId);
  const socket = getSocket();

  // Socket event logger
  useEffect(() => {
    if (!socket) return;

    const logEvent = (eventName: string, ...args: any[]) => {
      console.log(`📡 [Socket Event] ${eventName}:`, args);
    };

    socket.onAny(logEvent);

    return () => {
      socket.offAny(logEvent);
    };
  }, [socket]);

  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Read state from Redux store
  const { messages, onlineUsers } = useSelector((rootState: any) => rootState.chat);
  console.log("onlineUsers", onlineUsers);

  const { data: messagesData } = useMessages(conversationId);

  useEffect(() => {
    if (messagesData?.messages && conversationId) {
      dispatch(setMessages({ conversationId, messages: messagesData.messages }));
    }
  }, [messagesData, dispatch, conversationId]);

  const isTeacherOnline = teacherUserId ? onlineUsers[teacherUserId] === "online" : false;

  const currentMessages = conversationId ? messages[conversationId] || [] : [];

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !conversationId || !socket) return;

    // Emit message to socket server
    socket.emit("message:send", {
      conversationId,
      content: message,
    });

    setMessage("");
  };

  const emitTyping = useTyping(socket as Socket, conversationId as string);

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);

    if (socket && conversationId) {
      emitTyping();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] overflow-hidden font-sans bg-[#F8FAFC]">
      {/* Top Nav */}
      <div className="px-6 py-4 shrink-0 flex items-center">
        <button
          onClick={() => navigate("/student-dashboard")}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-semibold text-sm transition-colors"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>
      </div>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 px-6 pb-6 min-h-0">

        {/* Sidebar */}
        <ChatSidebar
          teacherName={teacherName}
          isTeacherOnline={isTeacherOnline}
          teacherSubject={teacherSubject}
          sessionTitle={sessionTitle}
        />

        {/* Right Chat Area */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full overflow-hidden">
          <ChatHeader
            teacherName={teacherName}
            isTeacherOnline={isTeacherOnline}
          />
          <ChatMessages
            conversationId={conversationId}
            teacherUserId={teacherUserId}
            messages={currentMessages}
            messagesEndRef={messagesEndRef}
          />
          <ChatInput
            message={message}
            conversationId={conversationId}
            handleTyping={handleTyping}
            handleSendMessage={handleSendMessage}
          />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}} />
    </div>
  );
}
