import { LibraryItem } from "@/types/library-item";
import { subGroupRename } from "@/types/sub-group-rename";

const BASE_URL = "/api/bncc";

export async function getListBncc():Promise<LibraryItem[]> {
    const res = await fetch(BASE_URL, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });
    if (!res.ok) {
        throw new Error("Erro ao buscar BNCC");
    };
    return res.json();
}

export async function createBncc(item: LibraryItem): Promise<LibraryItem> {
    const res = await fetch(BASE_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(item)
    })
    if (!res.ok) {
        throw new Error("Erro ao criar BNCC")
    }
    return res.json()
}

export async function deleteBncc(id: string) {
  const res = await fetch(BASE_URL, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "type": "deleteBncc"
    },
    body: id
  })
  if (!res.ok) {
    throw new Error("Erro ao deletar BNCC")
  }
}

export async function deleteSubGroupBncc(nameSubGroup: string) {
  const res = await fetch(BASE_URL, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "type": "deleteSubGroupBncc"
    },
    body: nameSubGroup
  })
  if (!res.ok) {
    throw new Error("Erro ao deletar BNCC")
  }
}

export async function updateBncc(item: LibraryItem): Promise<LibraryItem> {
  const res = await fetch(BASE_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "type": "updateBncc"
    },
    body: JSON.stringify(item)
  })
  if (!res.ok) {
    throw new Error("Erro ao atualizar BNCC")
  }
  return res.json()
}

export async function renameSubGroupBncc(item: subGroupRename): Promise<any> {
  const res = await fetch(BASE_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "type": "renameSubGroup"
    },
    body: JSON.stringify(item)
  })
  if (!res.ok) {
    throw new Error("Erro ao atualizar subGrupo")
  }
  return res.json();
}