import { MuralComment } from "./mural-comment";

export interface MuralEvent {
    id: string;
    title: string;
    description: string;
    date: string | Date;
    author: string;
    type: "event" | "notice" | "activity";
    location?: string | null;
    image?: string | null;
    classId?: string | null;
    isArchived?: boolean;
    likes: number;
    comments: MuralComment[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
}
