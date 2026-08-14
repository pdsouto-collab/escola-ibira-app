import { MuralEvent } from "@/types/mural";

const BASE_URL = "/api/mural-events";

/**
 * Fetch all mural events.
 * If classId is provided, filters by class.
 */
export async function getMuralEvents(classId?: string): Promise<MuralEvent[]> {
    const url = classId ? `${BASE_URL}?classId=${classId}` : BASE_URL;
    const res = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store"
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erro ao buscar eventos do mural");
    }
    return res.json();
}

export async function createMuralEvent(event: Partial<MuralEvent>): Promise<MuralEvent> {
    const res = await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event)
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erro ao criar evento");
    }
    return res.json();
}

export async function updateMuralEvent(id: string, updates: Partial<MuralEvent>): Promise<MuralEvent> {
    const res = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erro ao atualizar evento");
    }
    return res.json();
}

export async function deleteMuralEvent(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erro ao excluir evento");
    }
}

export async function addMuralComment(eventId: string, comment: { author: string; text: string }): Promise<any> {
    const res = await fetch(`${BASE_URL}/${eventId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(comment)
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Erro ao adicionar comentário");
    }
    return res.json();
}
