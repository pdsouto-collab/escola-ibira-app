import { SchoolClass } from "@/types/school-class";

const BASE_URL = "/api/school-classes";

export async function getClasses(): Promise<SchoolClass[]> {
  const res = await fetch(BASE_URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    },
    cache: "no-store"
  });
  if (!res.ok) {
    throw new Error("Erro ao buscar turmas");
  };
  return res.json();
}

export async function getClassById(id: string): Promise<SchoolClass | null> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    },
    cache: "no-store"
  });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error("Erro ao buscar turma");
  };
  return res.json();
}

export async function createClass(schoolClass: SchoolClass): Promise<SchoolClass> {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(schoolClass)
  });
  if (!res.ok) {
    throw new Error("Erro ao criar turma");
  }
  return res.json();
}

export async function updateClass(id: string, updates: Partial<SchoolClass>): Promise<SchoolClass> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(updates)
  });
  if (!res.ok) {
    throw new Error("Erro ao atualizar turma");
  }
  return res.json();
}

export async function deleteClass(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    }
  });
  if (!res.ok) {
    throw new Error("Erro ao deletar turma");
  }
}
