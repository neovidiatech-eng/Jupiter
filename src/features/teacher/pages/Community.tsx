import {
  Users,
  MessageSquare,
  Heart,
  TrendingUp,
  Smile,
  Send,
  MoreVertical,
} from "lucide-react";
import { useMystudents } from "../hooks/useMystudents";
import { TeacherStudent } from "../../../types/teacherStudents";
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  getConversationMessages, 
  sendMessage, 
  createConversation 
} from "../../../services/chatServices";
import { useChatSocket } from "../../../hooks/useChat";
import { addMessage, setMessages, clearMessages } from "../../../store/chatSlice";
import { getSocket } from "../../../lib/socket";
import { format } from "date-fns";
export default function CommunityPage() {
  const dispatch = useDispatch();
  const { data: students } = useMystudents();
  const [selectedStudent, setSelectedStudent] = useState<TeacherStudent | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Read from Redux
  const { messages, onlineUsers, typingUsers } = useSelector((rootState: any) => rootState.chat);
  const socket = getSocket();

  // Initialize socket for the conversation
  useChatSocket(conversationId || undefined);

  const { mutate: openChat } = useMutation({
    mutationFn: (studentId: string) => {
      const teacherId = localStorage.getItem("userId") || "";

      return createConversation({ teacherId, studentId });
    },
    onSuccess: (data) => {
      setConversationId(data.id);
    }
  });

  const { data: historyData, isLoading: isHistoryLoading } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () => getConversationMessages(conversationId!, 1, 50),
    enabled: !!conversationId,
  });

  useEffect(() => {
    if (historyData?.messages) {
      dispatch(setMessages(historyData.messages));
    }
  }, [historyData, dispatch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !conversationId) return;

    const tempId = Date.now().toString();
    const messageData = {
      conversationId,
      content: messageText,
      type: "text",
    };

    // Optimistic update
    dispatch(addMessage({
      id: tempId,
      content: messageText,
      senderId: "me", // Will be replaced by actual user ID from server
      createdAt: new Date().toISOString(),
      status: "sending"
    }));

    setMessageText("");

    try {
      await sendMessage(messageData);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleTyping = () => {
    if (socket && conversationId) {
      socket.emit("typing:start", { conversationId });
      
      const timeout = setTimeout(() => {
        socket.emit("typing:stop", { conversationId });
      }, 3000);
      
      return () => clearTimeout(timeout);
    }
  };

  const isStudentOnline = selectedStudent ? onlineUsers[selectedStudent.id] === "online" : false;
  const isStudentTyping = selectedStudent ? typingUsers[conversationId || ""] : false;

  const stats = [
    { label: "Active Members", value: "342", icon: Users, color: "blue" },
    {
      label: "Discussions",
      value: "1,248",
      icon: MessageSquare,
      color: "purple",
    },
    { label: "Helpful Posts", value: "856", icon: Heart, color: "pink" },
    { label: "This Week", value: "+48", icon: TrendingUp, color: "green" },
  ];

  return (
    <div className="animate-fade-in max-w-[1600px] mx-auto pb-12 p-7">
      {/* Page Header */}
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-2 font-['Inter']">
          Instructor Community
        </h1>
        <p className="text-slate-400 font-medium">
          Connect, share, and learn with fellow instructors
        </p>
      </header>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white p-8 rounded-3xl border border-gray-100/50 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-start gap-4 mb-4">
              <div
                className={`p-3 rounded-2xl ${
                  stat.color === "blue"
                    ? "bg-blue-50 text-blue-500"
                    : stat.color === "purple"
                      ? "bg-purple-50 text-purple-500"
                      : stat.color === "pink"
                        ? "bg-pink-50 text-pink-500"
                        : "bg-green-50 text-green-500"
                }`}
              >
                <stat.icon size={22} />
              </div>
            </div>
            <p className="text-sm font-bold text-slate-400 mb-1">
              {stat.label}
            </p>
            <h3 className="text-2xl font-black text-slate-800">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chat Area */}
        <div className="lg:col-span-2 flex flex-col h-[700px] bg-white rounded-3xl border border-gray-100/50 shadow-sm overflow-hidden content-chat pt-8">
          {selectedStudent ? (
            <>
              {/* Chat Header */}
              <div className="px-8 pb-6 border-b border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-500 uppercase italic border-2 border-white shadow-sm">
                      {selectedStudent.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    {isStudentOnline && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{selectedStudent.name}</h3>
                    <p className="text-xs font-medium text-slate-400">
                      {isStudentTyping ? (
                        <span className="text-blue-500 animate-pulse">Typing...</span>
                      ) : (
                        isStudentOnline ? 'Online' : 'Offline'
                      )}
                    </p>
                  </div>
                </div>
                <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                  <MoreVertical size={20} />
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar bg-slate-50/30">
                {messages.length === 0 && !isHistoryLoading ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4 opacity-60">
                    <MessageSquare size={48} />
                    <p className="font-medium">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg: any) => {
                    const isMe = msg.senderId === "me" || msg.sender?.role === "teacher"; // Adjust based on your auth logic
                    return (
                      <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] space-y-1`}>
                          <div className={`p-4 rounded-2xl shadow-sm text-sm font-medium leading-relaxed ${
                            isMe 
                              ? 'bg-blue-600 text-white rounded-tr-none' 
                              : 'bg-white text-slate-600 rounded-tl-none border border-slate-100'
                          }`}>
                            {msg.content}
                          </div>
                          <p className={`text-[10px] font-bold text-slate-300 uppercase ${isMe ? 'text-right' : 'text-left'}`}>
                            {msg.createdAt ? format(new Date(msg.createdAt), 'hh:mm a') : 'Just now'}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-6 border-t border-slate-50">
                <form onSubmit={handleSendMessage} className="relative flex items-center gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={messageText}
                      onChange={(e) => {
                        setMessageText(e.target.value);
                        handleTyping();
                      }}
                      placeholder="Type your message..."
                      className="w-full px-6 py-4 bg-slate-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-medium"
                    />
                    <button type="button" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <Smile size={20} />
                    </button>
                  </div>
                  <button 
                    type="submit"
                    disabled={!messageText.trim()}
                    className="p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:shadow-none"
                  >
                    <Send size={20} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-6 animate-pulse">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                <Users size={40} className="text-slate-200" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-slate-800 mb-2">Select a Student</h3>
                <p className="text-sm font-medium">Choose a student from the list to start chatting</p>
              </div>
            </div>
          )}
        </div>

        {/* Students Sidebar */}
        <div className="h-[700px] bg-white rounded-3xl border border-gray-100/50 shadow-sm p-8 flex flex-col">
          <h3 className="text-xl font-bold text-slate-800 mb-8 h-fit">
            Students Chat
          </h3>
          <div className="space-y-6 flex-1 overflow-y-auto no-scrollbar">
            {students?.map((student: TeacherStudent) => (
              <div
                key={student.id}
                onClick={() => {
                  setSelectedStudent(student);
                  openChat(student.id);
                }}
                className={`flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer group border ${
                  selectedStudent?.id === student.id 
                    ? "bg-blue-50/50 border-blue-100 shadow-sm" 
                    : "hover:bg-slate-50 border-transparent"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                      selectedStudent?.id === student.id ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"
                    }`}>
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    {onlineUsers[student.id] === "online" && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                    )}
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold transition-colors ${
                      selectedStudent?.id === student.id ? "text-blue-600" : "text-slate-800"
                    }`}>
                      {student.name}
                    </h4>
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                      {student.code}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
