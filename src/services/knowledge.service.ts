import { KnowledgeNode } from "@/types/knowledge-node";

const BASE_URL = "/api/knowledge";

export async function getKnowledgeTrees(type: "skill" | "content"): Promise<KnowledgeNode[]> {
  const res = await fetch(`${BASE_URL}?type=${type}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store"
  });
  if (!res.ok) throw new Error("Erro ao buscar árvores de conhecimento");
  return res.json();
}

export async function addKnowledgeNode(parentId: string | null, node: KnowledgeNode): Promise<KnowledgeNode> {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ parentId, node })
  });
  if (!res.ok) throw new Error("Erro ao adicionar nó");
  return res.json();
}

export async function updateKnowledgeNode(id: string, updates: Partial<KnowledgeNode>): Promise<KnowledgeNode> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates)
  });
  if (!res.ok) throw new Error("Erro ao atualizar nó");
  return res.json();
}

export async function removeKnowledgeNode(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Erro ao remover nó");
}

export async function duplicateKnowledgeNode(id: string): Promise<any> {
  const res = await fetch(`${BASE_URL}/${id}/duplicate`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Erro ao duplicar nó");
  return res.json();
}
