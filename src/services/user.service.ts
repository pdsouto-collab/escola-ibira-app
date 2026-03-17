import { User } from "@/types/user";

const BASE_URL = "/api/users";

export async function getUsers(): Promise<User[]> {
  const res = await fetch(BASE_URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    },
    cache: "no-store"
  });
  if (!res.ok) {
    throw new Error("Erro ao buscar usuários");
  };
  return res.json();
}

export async function createUser(user: Omit<User, "id">): Promise<User> {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(user)
  });
  if (!res.ok) {
    throw new Error("Erro ao criar usuário");
  }
  return res.json();
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(updates)
  });
  if (!res.ok) {
    const errorData = await res.text().catch(() => "");
    throw new Error(`Erro ao atualizar usuário: ${res.status} ${errorData}`);
  }
  return res.json();
}

export async function deleteUser(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    }
  });
  if (!res.ok) {
    throw new Error("Erro ao deletar usuário");
  }
}
