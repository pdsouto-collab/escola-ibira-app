export interface ScheduleItem {
    id: string;
    time: string;
    endTime?: string | null;
    title: string;
    type: "activity" | "meal" | "care" | "project" | string;
    description?: string | null;
    date?: string | null;
    classId?: string | null;
    projectId?: string | null;
    routineId?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}
