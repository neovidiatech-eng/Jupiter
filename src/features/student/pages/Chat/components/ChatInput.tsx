import React, { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Mic, Trash2, X, Image as ImageIcon, FileText, Music, Film } from "lucide-react";
import ErrorService from "../../../../../utils/ErrorService";

interface ChatInputProps {
  message: string;
  conversationId: string | undefined;
  handleTyping: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSendMessage: (
    e: React.FormEvent,
    file?: File | Blob | null,
    isVoice?: boolean,
    duration?: number
  ) => void;
  isSocketReady?: boolean;
}

export default function ChatInput({
  message,
  conversationId,
  handleTyping,
  handleSendMessage,
  isSocketReady = true,
}: ChatInputProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup timer and stream on unmount
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        ErrorService.error("Voice recording is not supported in this browser.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      audioChunksRef.current = [];

      let mimeType = "audio/webm";
      if (!MediaRecorder.isTypeSupported("audio/webm")) {
        if (MediaRecorder.isTypeSupported("audio/mp4")) {
          mimeType = "audio/mp4";
        } else if (MediaRecorder.isTypeSupported("audio/ogg")) {
          mimeType = "audio/ogg";
        } else {
          mimeType = "";
        }
      }

      const mediaRecorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error("Failed to start voice recording:", err);
      ErrorService.error("Could not access microphone. Please allow microphone permissions.");
    }
  };

  const cancelRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsRecording(false);
    setRecordingTime(0);
    audioChunksRef.current = [];
  };

  const stopAndSendRecording = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaRecorderRef.current) return;

    const duration = recordingTime;

    if (timerRef.current) clearInterval(timerRef.current);

    mediaRecorderRef.current.onstop = () => {
      const mimeType = mediaRecorderRef.current?.mimeType || "audio/webm";
      const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
      const ext = mimeType.includes("mp4") ? "m4a" : mimeType.includes("ogg") ? "ogg" : "webm";
      const voiceFile = new File([audioBlob], `voice_${Date.now()}.${ext}`, { type: mimeType });

      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }

      setIsRecording(false);
      setRecordingTime(0);
      audioChunksRef.current = [];

      handleSendMessage(e, voiceFile, true, duration);
    };

    mediaRecorderRef.current.stop();
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRecording) {
      stopAndSendRecording(e);
      return;
    }
    handleSendMessage(e, selectedFile, false, 0);
    setSelectedFile(null);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const renderFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) return <ImageIcon size={16} className="text-blue-500" />;
    if (file.type.startsWith("video/")) return <Film size={16} className="text-purple-500" />;
    if (file.type.startsWith("audio/")) return <Music size={16} className="text-emerald-500" />;
    return <FileText size={16} className="text-amber-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="p-4 sm:p-5 bg-white shrink-0 border-t border-slate-100 flex flex-col gap-2">
      {/* File Preview */}
      {selectedFile && !isRecording && (
        <div className="flex items-center justify-between gap-3 bg-slate-50 p-2.5 px-3 rounded-xl border border-slate-200 w-max max-w-full">
          <div className="flex items-center gap-2 min-w-0">
            {selectedFile.type.startsWith("image/") ? (
              <img
                src={URL.createObjectURL(selectedFile)}
                alt="Selected preview"
                className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
              />
            ) : (
              renderFileIcon(selectedFile)
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-slate-700 font-semibold truncate max-w-[220px]">
                {selectedFile.name}
              </span>
              <span className="text-[10px] text-slate-400">
                {formatFileSize(selectedFile.size)}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSelectedFile(null)}
            className="p-1 rounded-full text-slate-400 hover:text-red-500 hover:bg-slate-200/50 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Recording Bar UI */}
      {isRecording ? (
        <div className="flex items-center gap-4 bg-red-50/70 border border-red-100 px-4 py-2.5 rounded-xl animate-fade-in">
          <div className="flex items-center gap-2 flex-1">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
            <span className="text-sm font-semibold text-red-600">Recording audio...</span>
            <span className="text-sm font-mono font-bold text-red-700 ml-2">
              {formatTimer(recordingTime)}
            </span>
          </div>

          <button
            type="button"
            onClick={cancelRecording}
            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100/50 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
            title="Cancel recording"
          >
            <Trash2 size={18} />
            <span className="hidden sm:inline">Cancel</span>
          </button>

          <button
            type="button"
            onClick={(e) => stopAndSendRecording(e)}
            className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-all flex items-center gap-1.5 text-xs font-semibold"
            title="Send Voice Note"
          >
            <Send size={16} />
            <span>Send Voice</span>
          </button>
        </div>
      ) : (
        /* Normal Input Form */
        <form onSubmit={onSubmit} className="flex items-center gap-3">
          <input
            type="file"
            hidden
            ref={fileInputRef}
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="Attach file"
          >
            <Paperclip size={20} />
          </button>

          <button
            type="button"
            onClick={startRecording}
            disabled={!conversationId || !isSocketReady}
            className="p-2.5 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-40"
            title="Record Voice Note"
          >
            <Mic size={20} />
          </button>

          <div className="flex-1 bg-[#F8FAFC] rounded-xl flex items-center px-4 py-2.5 border border-transparent focus-within:border-blue-200 transition-all">
            <input
              type="text"
              placeholder={isSocketReady ? "Type your message..." : "Connecting..."}
              className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-[14px] text-slate-700 placeholder:text-slate-400"
              value={message}
              onChange={handleTyping}
              disabled={!conversationId || !isSocketReady}
            />
          </div>

          <button
            type="submit"
            disabled={(!message.trim() && !selectedFile) || !conversationId || !isSocketReady}
            className={`p-3 rounded-xl flex items-center justify-center transition-all shadow-sm ${
              (message.trim() || selectedFile) && conversationId && isSocketReady
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-slate-100 text-slate-300 cursor-not-allowed"
            }`}
          >
            <Send size={18} className="ml-0.5" />
          </button>
        </form>
      )}
    </div>
  );
}
