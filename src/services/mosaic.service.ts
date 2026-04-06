import { MosaicNode } from "@/types/mosaic-node";

const BASE_URL = "/api/mosaic";

export async function getMosaicData(): Promise<MosaicNode[]> {
  const res = await fetch(BASE_URL, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store"
  });
  if (!res.ok) throw new Error("Erro ao buscar dados do mosaico");
  return res.json();
}

export async function replaceMosaicData(newData: MosaicNode[]): Promise<void> {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nodes: newData })
  });
  if (!res.ok) throw new Error("Erro ao substituir dados do mosaico");
}
