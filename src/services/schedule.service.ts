import { ScheduleItem } from "@/types/schedule";

const BASE_URL = "/api/schedule";

export async function getSchedules(): Promise<ScheduleItem[]> {
    const res = await fetch(BASE_URL, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store"
    });
    if (!res.ok) throw new Error("Erro ao buscar agenda");
    return res.json();
}

export async function getScheduleById(id: string): Promise<ScheduleItem | null> {
    const res = await fetch(`${BASE_URL}/${id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store"
    });
    if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error("Erro ao buscar item da agenda");
    }
    return res.json();
}

export async function createSchedule(item: Omit<ScheduleItem, "id" | "createdAt" | "updatedAt">): Promise<ScheduleItem> {
    const res = await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item)
    });
    if (!res.ok) throw new Error("Erro ao criar item na agenda");
    return res.json();
}

export async function updateSchedule(id: string, updates: Partial<ScheduleItem>): Promise<ScheduleItem> {
    const res = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error("Erro ao atualizar item da agenda");
    return res.json();
}

export async function deleteSchedule(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Erro ao deletar item da agenda");
}
