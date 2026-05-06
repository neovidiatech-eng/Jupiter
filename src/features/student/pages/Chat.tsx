import React, { useState, useEffect, useRef } from "react";
import { Send, Paperclip, ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useChatSocket } from "../../../hooks/useChat";
import { getSocket } from "../../../lib/socket";
import { Message } from "../../../types/chat";
import { getConversationMessages } from "../../../services/chatServices";
import { setMessages } from "../../../store/chatSlice";
import { useQuery } from "@tanstack/react-query";

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
  useChatSocket(conversationId);
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

  const { data } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => getConversationMessages(conversationId!, 1, 50),
    enabled: !!conversationId,
  });

  useEffect(() => {
    if (data?.messages) {
      dispatch(setMessages(data.messages));
    }
  }, [data, dispatch]);

  const isTeacherOnline = teacherUserId ? onlineUsers[teacherUserId] === "online" : false;

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  // const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setMessage(e.target.value);
  //   if (socket && conversationId) {
  //     socket.emit("typing:update", { conversationId, isTyping: e.target.value.length > 0 });
  //   }
  // };

  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);

    if (!socket || !conversationId) return;

    socket.emit("typing:start", { conversationId });

    if (typingTimeout.current) clearTimeout(typingTimeout.current);

    typingTimeout.current = setTimeout(() => {
      socket.emit("typing:stop", { conversationId });
    }, 1000);
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
        <div className="hidden lg:flex flex-col bg-white rounded-2xl shadow-sm border border-slate-100 h-fit p-8 overflow-y-auto custom-scrollbar">
          <div className="flex flex-col items-center border-b border-slate-100 pb-6 mb-6">
            <div className="w-24 h-24 rounded-full border-[3px] border-blue-500 p-1 mb-4">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(teacherName)}&background=random&color=fff`}
                alt={teacherName}
                className="w-full h-full rounded-full object-cover"
              />
            </div>

            <h2 className="text-[1.1rem] font-bold text-slate-800 text-center mb-2">
              {teacherName}
            </h2>

            <div className="flex items-center gap-2 mb-4">
              <div className={`w-2 h-2 rounded-full ${isTeacherOnline ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              <span className={`text-xs font-semibold ${isTeacherOnline ? 'text-emerald-600' : 'text-slate-500'}`}>
                {isTeacherOnline ? 'Online' : 'Offline'}
              </span>
            </div>

            <p className="text-sm font-medium text-slate-500 text-center">
              {teacherSubject}
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-xs text-slate-400 mb-1">Current Curriculum</p>
              <p className="text-sm font-semibold text-slate-800">{sessionTitle}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Response Time</p>
              <p className="text-sm font-semibold text-slate-800">Within 2 hours</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">Availability</p>
              <p className="text-sm font-semibold text-slate-800">Mon-Fri, 9AM-6PM</p>
            </div>
          </div>
        </div>

        {/* Right Chat Area */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-full overflow-hidden">

          {/* Chat Header */}
          <div className="px-8 py-6 border-b border-slate-300 shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[1.1rem] font-bold text-slate-800 mb-1">
                  Chat with {teacherName}
                </h3>
                <p className="text-sm text-slate-500">
                  Ask questions about your curriculum
                </p>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                <div className={`w-2 h-2 rounded-full ${isTeacherOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                <span className={`text-xs font-bold ${isTeacherOnline ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {isTeacherOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-8 bg-white custom-scrollbar">
            {!conversationId ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                  <Send className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-700">No Conversation Selected</h4>
                  <p className="text-sm text-slate-500 mt-1">Please select an instructor to start chatting.</p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                  <Send className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-700">Start the Conversation</h4>
                  <p className="text-sm text-slate-500 mt-1">Send a message to break the ice!</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((msg: Message) => {
                  const isStudent = msg.isMine;
                  const timeString = new Date(msg.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isStudent ? "items-end" : "items-start"} max-w-[70%] ${isStudent ? "ml-auto" : "mr-auto"}`}
                    >
                      <div
                        className={`
                          px-4 py-3 text-[14px] leading-relaxed max-w-full break-words
                          ${isStudent
                            ? "bg-blue-600 text-white rounded-2xl rounded-tr-sm"
                            : "bg-[#F3F4F6] text-slate-800 rounded-2xl rounded-tl-sm"
                          }
                       `}
                      >
                        {msg.content}
                      </div>
                      <span className="text-[11px] text-slate-400 mt-1 px-1 font-medium">
                        {timeString}
                      </span>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} className="h-1" />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 sm:p-6 bg-white shrink-0 border-t border-slate-100">
            <form
              onSubmit={handleSendMessage}
              className="flex items-center gap-4"
            >
              <button type="button" className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <Paperclip size={20} />
              </button>

              <div className="flex-1 bg-[#F8FAFC] rounded-xl flex items-center px-4 py-3">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-[15px] text-slate-700 placeholder:text-slate-400"
                  value={message}
                  onChange={handleTyping}
                  disabled={!conversationId}
                />
              </div>

              <button
                type="submit"
                disabled={!message.trim() || !conversationId}
                className={`p-3.5 rounded-xl flex items-center justify-center transition-all ${message.trim() && conversationId
                  ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  : "bg-slate-50 text-slate-300"
                  }`}
              >
                <Send size={18} className="ml-0.5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(203, 213, 225, 0.4);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.6);
        }
      `}} />
    </div>
  );
}
