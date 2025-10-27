//usa internamente para manejar las clases de Tailwind CSS de forma más limpia y segura.
//Lo genera automáticamente cuando haces npx shadcn@latest init

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
