import { KnowledgeLevel } from "./knowledge-level";

export interface KnowledgeNode {
    id: string;
    level: KnowledgeLevel;
    type: "skill" | "content";
    name: string; // The label/name of the level (e.g. "Natureza e Sociedade" ou "Compreensão de Adição")
    description?: string | null; // Optional detailed description
    libraryItemId?: string | null; // ONLY for L3 (Micro): points to an item in `libraryItems`
    linkedNodeIds?: string[]; // For Cross-Linking: L3/L4 Contenúdo mapping to L3/L4 Habilidades
    classId?: string | null; // e.g. "all" or a specific class ID. Usually set at the macro (root) level.
    period?: string | null; // e.g. "1º Semestre / 2026". Usually set at the macro (root) level.
    children?: KnowledgeNode[]; // Nested nodes down the hierarchy (optional array)
}
