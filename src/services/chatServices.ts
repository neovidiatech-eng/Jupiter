import api from "../lib/axios";
import { Conversation } from "../types/chat";

export const getConversations = async (): Promise<{ conversations: Conversation[] }> => {
    const response = await api.get('/chat/conversations/');
    return response.data;
}
export const createConversation = async (data: {
    teacherId: string;
    studentId: string;
}): Promise<Conversation> => {
    const res = await api.post("/chat/conversations", data);
    return res.data.data;
};