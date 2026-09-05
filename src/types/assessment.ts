import { AssessmentAttachment } from "./assessment-attachment";
/** A teacher evaluation record. */
export interface Assessment {
    id: string;
    createdAt: string;

    // Context (at least one required)
    projectId?: string;
    sessionId?: string;        // ScheduleItem.id
    routineId?: string;
    knowledgeNodeId?: string;  // KnowledgeNode.id
    period?: string;           // Optional explicit period

    // Scope
    scope: "class" | "student" | string;
    classId?: string;
    studentId?: string;

    // Content
    rating?: 1 | 2 | 3 | 4 | 5;
    observations: string;
    isPublished?: boolean;
    attachments: AssessmentAttachment[];
}
