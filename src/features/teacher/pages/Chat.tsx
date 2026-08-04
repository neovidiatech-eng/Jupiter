import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Search, MoreVertical , MessageSquare } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import { useConversations } from "../../../hooks/useConversations";
import { useMessages } from "../../../hooks/useMessages";
import { useChatSocket } from "../../../hooks/useChat";
import { useTyping } from "../../../hooks/useTyping";
import { setMessages, addMessage } from "../../../store/chatSlice";
import { sendMediaMessage } from "../../../services/chatServices";
import ChatMessages from "../../student/pages/Chat/components/ChatMessages";
import ChatInput from "../../student/pages/Chat/components/ChatInput";
import { Socket } from "socket.io-client";
import ErrorService from "../../../utils/ErrorService";

export default function TeacherChat() {
  const { i18n } = useTranslation();
  const isRtl = i18n.language.split("-")[0] === "ar";
  const primaryColor = "#2563eb";
  const dispatch = useDispatch();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch real conversations from Backend
  const { data: conversationsData, isLoading: isLoadingConversations } = useConversations();

  const conversationsList = conversationsData?.conversations || [];

  // Auto-select first conversation when data loads
  useEffect(() => {
    if (conversationsList.length > 0 && !selectedConversationId) {
      setSelectedConversationId(conversationsList[0].id);
    }
  }, [conversationsList, selectedConversationId]);

  const selectedConversation = conversationsList.find(
    (c) => c.id === selectedConversationId
  );

  const studentName = selectedConversation?.student?.name || "Student";
  const studentUserId = selectedConversation?.student?.user_id;

  // Socket connection
  const socket = useChatSocket(selectedConversationId || undefined);
  const isSocketReady = !!socket?.connected;

  // Fetch messages for selected conversation
  const { data: messagesData } = useMessages(selectedConversationId || undefined);

  useEffect(() => {
    if (messagesData?.messages && selectedConversationId) {
      dispatch(
        setMessages({
          conversationId: selectedConversationId,
          messages: messagesData.messages,
        })
      );
    }
  }, [messagesData, dispatch, selectedConversationId]);

  // Read Redux Chat State
  const { messages, onlineUsers, typingUsers } = useSelector(
    (rootState: RootState) => rootState.chat
  );

  const isStudentOnline = studentUserId ? onlineUsers[studentUserId] === "online" : false;
  const isStudentTyping =
    selectedConversationId && studentUserId
      ? typingUsers[selectedConversationId]?.includes(studentUserId)
      : false;

  const currentMessages = selectedConversationId ? messages[selectedConversationId] || [] : [];

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]);

  const emitTyping = useTyping(socket as Socket, selectedConversationId as string);

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageText(e.target.value);
    if (selectedConversationId) {
      emitTyping();
    }
  };

  const handleSendMessage = async (
    e: React.FormEvent,
    file?: File | Blob | null,
    isVoice?: boolean,
    duration?: number
  ) => {
    e.preventDefault();
    if ((!messageText.trim() && !file) || !selectedConversationId) return;

    try {
      if (file) {
        console.log("📤 [Teacher Chat] Sending media/voice:", file);
        const createdMsg = await sendMediaMessage({
          conversationId: selectedConversationId,
          file,
          content: messageText,
          isVoice,
          duration,
        });

        if (createdMsg) {
          dispatch(addMessage(createdMsg));
        }
      } else {
        console.log("📤 [Teacher Chat] Sending text:", messageText);
        if (socket && isSocketReady) {
          socket.emit("message:send", {
            conversationId: selectedConversationId,
            content: messageText,
          });
        } else {
          const createdMsg = await sendMediaMessage({
            conversationId: selectedConversationId,
            content: messageText,
          });
          if (createdMsg) {
            dispatch(addMessage(createdMsg));
          }
        }
      }
      setMessageText("");
    } catch (error: any) {
      console.error("Failed to send message:", error);
      ErrorService.error("Failed to send message. Please try again.");
    }
  };

  // Filter conversations list
  const filteredConversations = conversationsList.filter((conv) => {
    const sName = conv.student?.name || "";
    const lastMsg = conv.lastMessage?.content || "";
    const query = searchQuery.toLowerCase();
    return sName.toLowerCase().includes(query) || lastMsg.toLowerCase().includes(query);
  });

  return (
    <div
      className="h-[calc(100vh-120px)] animate-fade-in flex flex-col md:flex-row gap-6 font-sans"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Sidebar for Conversations / Students List */}
      <div className="w-full md:w-80 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-1/3 md:h-full shrink-0 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <div
              className={`absolute inset-y-0 ${
                isRtl ? "right-0 pr-3" : "left-0 pl-3"
              } flex items-center pointer-events-none`}
            >
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRtl ? "بحث في المحادثات..." : "Search chats..."}
              className={`block w-full ${
                isRtl ? "pr-9 pl-3" : "pl-9 pr-3"
              } py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
              style={{ "--tw-ring-color": primaryColor } as any}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {isLoadingConversations ? (
            <div className="p-6 text-center text-xs text-slate-400">Loading chats...</div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">No conversations found</div>
          ) : (
            filteredConversations.map((conv) => {
              const name = conv.student?.name || "Student";
              const isSelected = conv.id === selectedConversationId;
              const isOnline = conv.student?.user_id
                ? onlineUsers[conv.student.user_id] === "online"
                : false;

              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversationId(conv.id)}
                  className={`p-4 border-b border-slate-50 flex items-center gap-3 cursor-pointer transition-colors ${
                    isSelected ? "bg-blue-50/70" : "hover:bg-slate-50/50"
                  }`}
                >
                  <div className="relative">
                    <div className="w-11 h-11 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                      {name.substring(0, 2).toUpperCase()}
                    </div>
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-800 text-sm truncate">{name}</h4>
                    <p className="text-xs text-slate-400 truncate">
                      {conv.lastMessage?.content || "No messages yet"}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden h-2/3 md:h-full relative">
        {selectedConversationId ? (
          <>
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white z-10 shrink-0">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: primaryColor }}
                >
                  {studentName.substring(0, 1).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-bold text-slate-800 text-base">{studentName}</h2>
                  <p className="text-xs text-emerald-600 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                    {isStudentOnline ? (isRtl ? "متصل الآن" : "Online") : (isRtl ? "غير متصل" : "Offline")}
                  </p>
                </div>
              </div>
              <button className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <ChatMessages
              conversationId={selectedConversationId}
              teacherUserId={studentUserId}
              messages={currentMessages}
              messagesEndRef={messagesEndRef}
              isTyping={isStudentTyping}
            />

            {/* Input */}
            <ChatInput
              message={messageText}
              conversationId={selectedConversationId}
              handleTyping={handleTyping}
              handleSendMessage={handleSendMessage}
              isSocketReady={isSocketReady}
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-slate-400">
            <MessageSquare size={48} className="mb-3 opacity-30" />
            <p className="text-sm font-medium">Select a conversation to start chatting</p>
          </div>
        )}
      </div>

      <style
        dangerouslySetInnerHTML={{
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
      `,
        }}
      />
    </div>
  );
}
