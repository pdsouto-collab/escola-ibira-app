import { Project } from "@/types/project";

const BASE_URL = "/api/projects";

export async function getProjects(): Promise<Project[]> {
  const res = await fetch(BASE_URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    },
    cache: "no-store"
  });
  if (!res.ok) {
    throw new Error("Erro ao buscar projetos");
  }
  return res.json();
}

export async function getProjectById(id: string): Promise<Project | null> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    },
    cache: "no-store"
  });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error("Erro ao buscar projeto");
  }
  return res.json();
}

export async function createProject(project: Project): Promise<Project> {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(project)
  });
  if (!res.ok) {
    throw new Error("Erro ao criar projeto");
  }
  return res.json();
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(updates)
  });
  if (!res.ok) {
    throw new Error("Erro ao atualizar projeto");
  }
  return res.json();
}

export async function deleteProject(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    }
  });
  if (!res.ok) {
    throw new Error("Erro ao deletar projeto");
  }
}
