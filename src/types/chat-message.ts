export interface ChatMessage {
    id: string;
    senderId: string;
    receiverId?: string;
    groupId?: string;
    content: string;
    read: boolean;
    readBy?: string[];
    isMe?: boolean;
    createdAt: string;
    sender: {
        id: string;
        name: string;
        avatar: string | null;
        role: string;
    }
}
