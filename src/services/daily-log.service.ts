import { DailyLog } from "@/types/daily-log";

export async function getDailyLogs(filter?: { date?: string; studentId?: string; classId?: string }): Promise<DailyLog[]> {
    const params = new URLSearchParams();
    if (filter?.date) params.append("date", filter.date);
    if (filter?.studentId) params.append("studentId", filter.studentId);
    if (filter?.classId) params.append("classId", filter.classId);

    const queryString = params.toString();
    const url = `/api/daily-logs${queryString ? `?${queryString}` : ""}`;

    const res = await fetch(url);
    if (!res.ok) {
        throw new Error("Failed to fetch daily logs");
    }
    return res.json();
}

/**
 * Cria um ou mais diários de bordo.
 * Pode receber um objeto unico ou um array de objetos para inserção em lote.
 */
export async function createDailyLog(data: Omit<DailyLog, "id" | "createdAt" | "updatedAt"> | Array<Omit<DailyLog, "id" | "createdAt" | "updatedAt">>): Promise<DailyLog | { success: boolean; count: number }> {
    const res = await fetch("/api/daily-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        throw new Error("Failed to create daily log(s)");
    }
    return res.json();
}

export async function updateDailyLog(id: string, data: Partial<DailyLog>): Promise<DailyLog> {
    const res = await fetch(`/api/daily-logs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        throw new Error("Failed to update daily log");
    }
    return res.json();
}

export async function deleteDailyLog(id: string): Promise<void> {
    const res = await fetch(`/api/daily-logs/${id}`, {
        method: "DELETE"
    });

    if (!res.ok) {
        throw new Error("Failed to delete daily log");
    }
}
