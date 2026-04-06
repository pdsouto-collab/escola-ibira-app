export async function resetDatabase(): Promise<{ success: boolean, message: string }> {
  const res = await fetch("/api/system/reset", {
    method: "POST",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || "Erro ao resetar banco de dados");
  }

  return res.json();
}

export async function executeDatabaseCommand(commandType: 'migrate-dev' | 'migrate-deploy' | 'seed', options?: { migrationName?: string }): Promise<{ success: boolean, output: string }> {

  // npx prisma migrate dev --name [nome]
  // npx prisma generate
  // npx prisma migrate deploy

  const res = await fetch("/api/system/database", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ commandType, ...options }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Erro ao executar comando no banco de dados");
  }

  return data;
}
