export interface AppNotification {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: "info" | "warning" | "success" | "alert" | string;
    isRead: boolean;
    studentId?: string | null;
    createdAt: string;
}
