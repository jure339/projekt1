import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Združi Tailwind className stringe na varen način.
 * - clsx: pogojno dodajanje classov
 * - twMerge: odstrani podvojene Tailwind classe (npr. "p-2 p-4" -> "p-4")
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
