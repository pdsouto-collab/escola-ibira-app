import { AppNotification } from "@/types/notification";

export const NotificationService = {
    async getNotifications(userId: string): Promise<AppNotification[]> {
        const response = await fetch(`/api/notifications?userId=${userId}`);
        if (!response.ok) {
            throw new Error("Failed to fetch notifications");
        }
        return response.json();
    },

    async addNotification(data: Omit<AppNotification, "id" | "createdAt" | "isRead">): Promise<AppNotification> {
        const response = await fetch("/api/notifications", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error("Failed to add notification");
        }
        return response.json();
    },

    async markAsRead(id: string): Promise<AppNotification> {
        const response = await fetch(`/api/notifications/${id}`, {
            method: "PATCH",
        });
        if (!response.ok) {
            throw new Error("Failed to mark notification as read");
        }
        return response.json();
    },

    async markAllAsRead(userId: string): Promise<void> {
        const response = await fetch("/api/notifications/mark-all", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId }),
        });
        if (!response.ok) {
            throw new Error("Failed to mark all notifications as read");
        }
    }
};
