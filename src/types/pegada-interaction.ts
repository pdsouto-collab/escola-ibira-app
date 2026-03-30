export interface PegadaInteraction {
    id: string;
    userId: string;
    userName: string;
    type: 'like' | 'comment' | 'audio';
    content?: string;
    audioUrl?: string;
    createdAt: string;
}
