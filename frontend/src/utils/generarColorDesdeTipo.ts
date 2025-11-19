export function generarColorDesdeTipo(tipo: string): string {
  const colors = [
    "#D59B2C",
    "#6B7280",
    "#EF4444",
    "#3B82F6",
    "#10B981",
    "#A855F7",
  ]
  let hash = 0
  for (let i = 0; i < tipo.length; i++) {
    hash = tipo.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}