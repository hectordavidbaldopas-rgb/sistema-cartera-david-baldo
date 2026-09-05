// Las fechas de vigencia (start_date/end_date, etc.) son "solo fecha", sin
// hora. Se guardan como medianoche UTC. Formatearlas con el timezone local
// del navegador/servidor puede mostrar el día anterior (ej: 1/9 -> 31/8) si
// esa zona horaria está detrás de UTC. Por eso todo el formateo de estas
// fechas fuerza timeZone: "UTC" acá, en un solo lugar.

export function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "?";
  return new Date(d).toLocaleDateString("es-AR", { timeZone: "UTC" });
}
