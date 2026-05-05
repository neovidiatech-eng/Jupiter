export interface Message {
    id: string;
    senderId: string;
    content: string;
    createdAt: string;
    isMine?: boolean;
}

export interface Conversation {
    id: string;
    teacher: {
        id: string;
        name: string;
    };
    student: {
        id: string;
        name: string;
    };
    lastMessage?: {
        content: string;
        createdAt: string;
    };
}