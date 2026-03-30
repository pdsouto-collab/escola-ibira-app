import { PegadaPost } from "@/types/pegada-post";
import { PegadaInteraction } from "@/types/pegada-interaction";

const BASE_URL = "/api/pegadas";

export async function getPegadas(): Promise<PegadaPost[]> {
    const res = await fetch(BASE_URL, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store"
    });
    if (!res.ok) throw new Error("Erro ao buscar pegadas");
    return res.json();
}

export async function createPegada(post: Partial<PegadaPost>): Promise<PegadaPost> {
    const res = await fetch(BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(post)
    });
    if (!res.ok) throw new Error("Erro ao criar pegada");
    return res.json();
}

export async function updatePegada(id: string, updates: Partial<PegadaPost>): Promise<PegadaPost> {
    const res = await fetch(`${BASE_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error("Erro ao atualizar pegada");
    return res.json();
}

export async function deletePegada(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
    });
    if (!res.ok) throw new Error("Erro ao excluir pegada");
}

export async function addPegadaInteraction(postId: string, interaction: Omit<PegadaInteraction, 'id' | 'createdAt' | 'pegadaPostId'>): Promise<PegadaInteraction> {
    const res = await fetch(`${BASE_URL}/${postId}/interactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(interaction)
    });
    if (!res.ok) throw new Error("Erro ao interagir com pegada");
    return res.json();
}
