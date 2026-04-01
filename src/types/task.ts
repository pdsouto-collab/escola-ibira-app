export interface Task {
    id: string;
    title: string;
    completed: boolean;
    dueDate?: string;
    priority: "low" | "medium" | "high";
    createdAt?: Date;
    updatedAt?: Date;
}

export type CreateTaskInput = Omit<Task, "id" | "createdAt" | "updatedAt">;
export type UpdateTaskInput = Partial<CreateTaskInput>;
