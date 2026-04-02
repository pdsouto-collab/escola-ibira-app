export interface ContactUser {
    id: string;
    name: string;
    role: string;
    avatar: string | null;
    lastMessage: string;
    lastMessageTime: string | null;
    unreadCount: number;
    isGroup?: boolean;
    participantIds?: string[];
}
