import React from "react";
import { Send, Paperclip } from "lucide-react";

interface ChatInputProps {
  message: string;
  conversationId: string | undefined;
  handleTyping: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSendMessage: (e: React.FormEvent, file?: File | null) => void;
  isSocketReady?: boolean;
}

export default function ChatInput({
  message,
  conversationId,
  handleTyping,
  handleSendMessage,
  isSocketReady = true,
}: ChatInputProps) {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(e, selectedFile);
    setSelectedFile(null); // clear after send
  };

  return (
    <div className="p-4 sm:p-6 bg-white shrink-0 border-t border-slate-100 flex flex-col gap-2">
      {/* File Preview */}
      {selectedFile && (
        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200 w-max">
          <span className="text-xs text-slate-600 font-medium truncate max-w-[200px]">
            {selectedFile.name}
          </span>
          <button
            type="button"
            onClick={() => setSelectedFile(null)}
            className="text-red-500 hover:text-red-700 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      <form
        onSubmit={onSubmit}
        className="flex items-center gap-4"
      >
        <input 
          type="file" 
          hidden 
          ref={fileInputRef} 
          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} 
        />
        <button 
          type="button" 
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <Paperclip size={20} />
        </button>

        <div className="flex-1 bg-[#F8FAFC] rounded-xl flex items-center px-4 py-3">
          <input
            type="text"
            placeholder={isSocketReady ? "Type your message..." : "Connecting..."}
            className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-[15px] text-slate-700 placeholder:text-slate-400"
            value={message}
            onChange={handleTyping}
            disabled={!conversationId || !isSocketReady}
          />
        </div>

        <button
          type="submit"
          disabled={(!message.trim() && !selectedFile) || !conversationId || !isSocketReady}
          className={`p-3.5 rounded-xl flex items-center justify-center transition-all ${
            (message.trim() || selectedFile) && conversationId && isSocketReady
              ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
              : "bg-slate-50 text-slate-300"
          }`}
        >
          <Send size={18} className="ml-0.5" />
        </button>
      </form>
    </div>
  );
}
