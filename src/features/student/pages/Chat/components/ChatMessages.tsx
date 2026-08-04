import React, { useState } from "react";
import { Message } from "../../../../../types/chat";
import { getMediaUrl } from "../../../../../services/chatServices";
import EmptyChat from "./EmptyChat";
import VoiceNotePlayer from "./VoiceNotePlayer";
import { Download, FileText , ExternalLink, X } from "lucide-react";

interface Props {
  conversationId?: string;
  teacherUserId?: string;
  currentUserId?: string;
  messages: Message[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
  isTyping?: boolean;
}

export default function ChatMessages({
  conversationId,
  teacherUserId,
  currentUserId,
  messages,
  messagesEndRef,
  isTyping,
}: Props) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!conversationId) {
    return (
      <EmptyChat
        title="No Conversation Selected"
        description="Please select an instructor to start chatting."
      />
    );
  }

  if (messages.length === 0) {
    return (
      <EmptyChat
        title="Start the Conversation"
        description="Send a message to break the ice!"
      />
    );
  }

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getNormalizedMediaType = (msg: Message, rawUrl?: string | null): string => {
    if (msg.mediaType) {
      const mt = msg.mediaType.toLowerCase();
      if (mt.includes("image") || mt === "image") return "image";
      if (mt.includes("video") || mt === "video") return "video";
      if (mt === "voice") return "voice";
      if (mt.includes("audio") || mt === "audio") return "audio";
      if (mt.includes("pdf") || mt === "pdf") return "pdf";
      if (mt.includes("doc") || mt === "document") return "document";
    }

    const mime = (msg.attachments?.mimetype || "").toLowerCase();
    if (mime.startsWith("image/")) return "image";
    if (mime.startsWith("video/")) return "video";
    if (mime.startsWith("audio/")) return "audio";
    if (mime.includes("pdf")) return "pdf";
    if (mime.includes("word") || mime.includes("document") || mime.includes("excel") || mime.includes("text")) return "document";

    const url = (rawUrl || msg.mediaUrl || msg.attachments?.path || "").toLowerCase();
    if (/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(url)) return "image";
    if (/\.(mp4|webm|ogg|mov|mkv)$/i.test(url)) return "video";
    if (/\.(mp3|wav|m4a|aac|flac)$/i.test(url)) return "audio";
    if (/\.pdf$/i.test(url)) return "pdf";
    if (/\.(doc|docx|xls|xlsx|txt|csv)$/i.test(url)) return "document";

    return "unknown";
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
      {messages.map((msg) => {
        const isMine = currentUserId
          ? msg.senderId === currentUserId
          : teacherUserId
          ? msg.senderId !== teacherUserId
          : false;

        const timeString = new Date(msg.createdAt).toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });

        const rawMediaUrl = msg.mediaUrl || msg.attachments?.path;
        const mediaSrc = getMediaUrl(rawMediaUrl);
        const mediaType = getNormalizedMediaType(msg, rawMediaUrl);

        return (
          <div
            key={msg.id}
            className={`flex flex-col ${
              isMine ? "items-end ml-auto" : "items-start mr-auto"
            } max-w-[85%] sm:max-w-[70%]`}
          >
            <div
              className={`
                px-4 py-3 text-[14px] leading-relaxed max-w-full break-words shadow-sm flex flex-col gap-2.5
                ${
                  isMine
                    ? "bg-blue-600 text-white rounded-2xl rounded-tr-sm"
                    : "bg-[#F3F4F6] text-slate-800 rounded-2xl rounded-tl-sm border border-slate-100"
                }
              `}
            >
              {/* 1. IMAGE */}
              {mediaType === "image" && mediaSrc && (
                <div className="relative group overflow-hidden rounded-xl bg-slate-900/5 max-w-sm">
                  <img
                    src={mediaSrc}
                    alt="Chat attachment"
                    className="max-h-72 w-full object-cover rounded-xl cursor-pointer hover:opacity-95 transition-opacity"
                    onClick={() => setSelectedImage(mediaSrc)}
                    loading="lazy"
                  />
                  <button
                    onClick={() => setSelectedImage(mediaSrc)}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    title="View Image"
                  >
                    <ExternalLink size={14} />
                  </button>
                </div>
              )}

              {/* 2. VIDEO */}
              {mediaType === "video" && mediaSrc && (
                <div className="overflow-hidden rounded-xl bg-black max-w-sm">
                  <video
                    src={mediaSrc}
                    controls
                    className="max-h-72 w-full rounded-xl"
                  />
                </div>
              )}

              {/* 3. VOICE NOTE / AUDIO */}
              {(mediaType === "voice" || mediaType === "audio") && mediaSrc && (
                <VoiceNotePlayer
                  src={mediaSrc}
                  isMine={isMine}
                  duration={msg.attachments?.duration}
                  messageId={msg.id}
                />
              )}

              {/* 5. DOCUMENT / PDF */}
              {(mediaType === "pdf" || mediaType === "document") && mediaSrc && (
                <div
                  className={`flex items-center gap-3 p-2.5 rounded-xl border ${
                    isMine
                      ? "bg-blue-700/50 border-blue-500/40 text-white"
                      : "bg-white border-slate-200 text-slate-800"
                  }`}
                >
                  <div
                    className={`p-2.5 rounded-lg ${
                      isMine ? "bg-blue-800/60" : "bg-red-50 text-red-500"
                    }`}
                  >
                    <FileText size={22} />
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs font-semibold truncate max-w-[180px] sm:max-w-[220px]">
                      {msg.attachments?.originalname || "Document Attachment"}
                    </span>
                    {msg.attachments?.size && (
                      <span className={`text-[10px] ${isMine ? "text-blue-200" : "text-slate-400"}`}>
                        {formatFileSize(msg.attachments.size)}
                      </span>
                    )}
                  </div>
                  <a
                    href={mediaSrc}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className={`p-2 rounded-lg transition-colors ${
                      isMine
                        ? "bg-blue-500/40 hover:bg-blue-500/70 text-white"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                    }`}
                    title="Download document"
                  >
                    <Download size={16} />
                  </a>
                </div>
              )}

              {/* TEXT CONTENT / CAPTION */}
              {msg.content && <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>}
            </div>

            <span className="text-[11px] text-slate-400 mt-1 px-1 font-medium">
              {timeString}
            </span>
          </div>
        );
      })}

      {isTyping && (
        <div className="flex flex-col items-start max-w-[70%] mr-auto">
          <div className="bg-[#F3F4F6] text-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
            <span className="text-[14px] font-medium text-slate-500">typing</span>
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} className="h-1" />

      {/* Lightbox / Image Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex items-center justify-center">
            <img
              src={selectedImage}
              alt="Enlarged view"
              className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-slate-300 p-2"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}