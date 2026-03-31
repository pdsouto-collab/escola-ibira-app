import type { PortfolioEntry } from "@/types/portfolio-entry";

export async function getPortfolioEntries(studentId?: string): Promise<PortfolioEntry[]> {
    const url = studentId ? `/api/portfolio?studentId=${studentId}` : "/api/portfolio";
    const res = await fetch(url);
    if (!res.ok) throw new Error("Erro ao carregar portfólio");
    return res.json();
}

export async function createPortfolioEntry(entry: Omit<PortfolioEntry, "id" | "createdAt" | "updatedAt">): Promise<PortfolioEntry> {
    const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(entry),
    });
    if (!res.ok) throw new Error("Erro ao criar entrada no portfólio");
    return res.json();
}

export async function updatePortfolioEntry(id: string, updates: Partial<PortfolioEntry>): Promise<PortfolioEntry> {
    const res = await fetch(`/api/portfolio/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error("Erro ao atualizar entrada no portfólio");
    return res.json();
}

export async function deletePortfolioEntry(id: string): Promise<void> {
    const res = await fetch(`/api/portfolio/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Erro ao remover entrada no portfólio");
}
