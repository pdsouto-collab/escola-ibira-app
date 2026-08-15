import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Aplica máscara de telefone brasileiro (10 ou 11 dígitos)
 * Ex: (11) 98765-4321 ou (11) 3456-7890
 */
export function formatPhone(value: string | null | undefined): string {
  if (!value) return "";
  const clean = value.replace(/\D/g, "").slice(0, 11);
  if (clean.length === 0) return "";
  if (clean.length <= 2) return `(${clean}`;
  if (clean.length <= 6) return `(${clean.slice(0, 2)}) ${clean.slice(2)}`;
  if (clean.length <= 10) return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
  return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7, 11)}`;
}
