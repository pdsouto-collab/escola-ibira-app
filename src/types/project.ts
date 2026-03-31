export interface Project {
    id: string;
    title: string;
    description: string;
    status: "planning" | "active" | "completed" | "draft";
    startDate: string;
    endDate?: string;
    students: string[]; // IDs
    classes?: string[]; // IDs of SchoolClass
    period?: string; // e.g. "1º Semestre / 2026"
    tags: string[];
    bnccSkillIds?: string[]; // IDs of BNCC Skills
    contentIds?: string[]; // IDs of Custom Content
    guidingQuestion?: string; // e.g. "Como podemos cuidar da natureza?"
    imageUrl?: string; // Banner image url for the project card
    type?: string; // e.g. "Project"
    summary?: string; // rich text overview
    objectives?: string; // learning objectives
    finalProduct?: string; // "None", "Audio visual", etc.
    createdAt?: string; // API managed
    updatedAt?: string; // API managed
}
