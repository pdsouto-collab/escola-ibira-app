import { Student } from "@/types/student";

const BASE_URL = "/api/students";

export async function getStudents(): Promise<Student[]> {
  const res = await fetch(BASE_URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    },
    cache: "no-store"
  });
  if (!res.ok) {
    throw new Error("Erro ao buscar alunos");
  };
  return res.json();
}

export async function getStudentById(id: string): Promise<Student | null> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    },
    cache: "no-store"
  });
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error("Erro ao buscar aluno");
  };
  return res.json();
}

export async function createStudent(student: Student): Promise<Student> {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(student)
  });
  if (!res.ok) {
    throw new Error("Erro ao criar aluno");
  }
  return res.json();
}

export async function updateStudent(id: string, updates: Partial<Student>): Promise<Student> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(updates)
  });
  if (!res.ok) {
    throw new Error("Erro ao atualizar aluno");
  }
  return res.json();
}

export async function deleteStudent(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    }
  });
  if (!res.ok) {
    throw new Error("Erro ao deletar aluno");
  }
}
