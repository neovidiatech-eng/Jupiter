import api from "../lib/axios";
import { baseURL } from "../consts";
import { Conversation, Message } from "../types/chat";

export const getMediaUrl = (path?: string | null): string | null => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("blob:") || path.startsWith("data:")) {
    return path;
  }
  const normalizedPath = path.replace(/\\/g, "/");
  const cleanPath = normalizedPath.startsWith("/") ? normalizedPath.slice(1) : normalizedPath;
  const baseHost = baseURL.replace(/\/api\/?$/, "");
  return `${baseHost}/${cleanPath}`;
};

export const getConversations = async (): Promise<{ conversations: Conversation[] }> => {
  const response = await api.get("/chat/conversations/");
  return response.data;
};

export const createConversation = async (data: {
  teacherId: string;
  studentId: string;
}): Promise<Conversation> => {
  const res = await api.post("/chat/conversations", data);
  return res.data.data;
};

export const sendMessage = async (data: {
  conversationId: string;
  content: string;
  type?: string;
}): Promise<Message> => {
  const res = await api.post(`/chat/messages`, data);
  return res.data.data;
};

export const sendMediaMessage = async ({
  conversationId,
  file,
  content,
  isVoice,
  duration,
}: {
  conversationId: string;
  file?: File | Blob | null;
  content?: string;
  isVoice?: boolean;
  duration?: number;
}): Promise<Message> => {
  const formData = new FormData();
  if (file) {
    formData.append("file", file);
  }
  if (content && content.trim()) {
    formData.append("content", content.trim());
  }
  if (isVoice) {
    formData.append("isVoice", "true");
  }
  if (duration !== undefined && duration !== null) {
    formData.append("duration", duration.toString());
  }

  const res = await api.post(`/chat/conversations/${conversationId}/messages`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data.data;
};

export const getConversationMessages = async (
  conversationId: string,
  page = 1,
  limit = 50
): Promise<{
  messages: Message[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}> => {
  const res = await api.get(
    `/chat/conversations/${conversationId}/messages?page=${page}&limit=${limit}`
  );
  return res.data.data;
};