import { BnccProgressData, BnccProgressItem } from "@/types/bncc-progress";
import { LearningStatus } from "@/types/learning-status";

const BASE_URL = "/api/bncc-progress";

export async function getBnccProgress(): Promise<BnccProgressData> {
  const res = await fetch(BASE_URL, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store"
  });
  if (!res.ok) throw new Error("Erro ao buscar progresso da BNCC");
  
  // Transform flat array into Record<string, BnccProgressItem>
  const arrayData = await res.json();
  const record: BnccProgressData = {};
  arrayData.forEach((item: any) => {
    record[item.skillCode] = {
      status: item.status,
      evidenceCount: item.evidenceCount
    };
  });
  return record;
}

export async function updateBNCCStatus(skillCode: string, status: LearningStatus): Promise<BnccProgressItem> {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ skillCode, status })
  });
  if (!res.ok) throw new Error("Erro ao atualizar status da BNCC");
  return res.json();
}
