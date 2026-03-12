import { Grade } from "./grade";

export interface LibraryItem {
    id: string;
    type: "skill" | "content";
    code?: string; // Only for BNCC skills (e.g. EF01 MA01)
    name: string; // The category, title, or short name
    description: string; // The full text or content detail
    isBNCC: boolean;
    subGroup: string; // e.g. "Ciências", "Matemática", "Projetos Culturais"
    grade: Grade; // Target school stage
}