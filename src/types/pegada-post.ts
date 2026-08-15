import { PegadaInteraction } from "./pegada-interaction";

export interface PegadaPost {
    id: string;
    authorId: string;
    authorName: string;
    type: 'photo' | 'video' | 'note';
    title: string;
    content: string;
    mediaUrl?: string;
    mediaUrls?: string[]; // Multiple images up to 5
    tags?: string[];
    classId?: string;
    classIds?: string[];
    studentIds?: string[];
    interactions: PegadaInteraction[];
    createdAt: string;
}
