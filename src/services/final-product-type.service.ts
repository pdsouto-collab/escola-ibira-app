import { FinalProductType } from "@/types/final-product-type";

export async function getFinalProductTypes(): Promise<FinalProductType[]> {
    const res = await fetch("/api/final-product-types", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    });
    if (!res.ok) throw new Error("Falha ao buscar os tipos de produto final");
    return res.json();
}

export async function createFinalProductType(data: Pick<FinalProductType, "id" | "name">): Promise<FinalProductType> {
    const res = await fetch("/api/final-product-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Falha ao criar o tipo de produto final");
    return res.json();
}

export async function updateFinalProductType(id: string, updates: Partial<FinalProductType>): Promise<FinalProductType> {
    const res = await fetch(`/api/final-product-types/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error("Falha ao atualizar o tipo de produto final");
    return res.json();
}

export async function deleteFinalProductType(id: string): Promise<void> {
    const res = await fetch(`/api/final-product-types/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Falha ao remover o tipo de produto final");
}
