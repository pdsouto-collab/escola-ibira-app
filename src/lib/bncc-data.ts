import { LibraryItem } from "./data";

async function getListBncc():Promise<LibraryItem[]> {
    console.log("Buscando BNCC...");
    const res = await fetch("/api/bncc", {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });
    if (!res.ok) {
        throw new Error("Erro ao buscar BNCC");
    };
    const data:LibraryItem[] = await res.json();
    return data;
}

export const bnccData: LibraryItem[] = await getListBncc().catch((err) => {
  console.error("Falha na requisição:", err)
  return []
});