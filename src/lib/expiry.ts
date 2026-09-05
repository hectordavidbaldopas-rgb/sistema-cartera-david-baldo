// Ver ARQUITECTURA_BASE_DE_DATOS_APP_PAS.md sección 31 — lógica
// centralizada de vencimientos. Los rangos son configurables acá, no
// están repetidos por toda la app.

export const EXPIRY_THRESHOLDS = {
  urgentDays: 7, // ROJO: vencido o <= 7 días
  warningDays: 30, // NARANJA: 8 a 30 días
  // VERDE: > 30 días
};

export type ExpiryLevel = "vencida" | "roja" | "naranja" | "verde" | "sin_fecha";

// endDate se guarda como medianoche UTC (fecha "sin hora"). Comparar sus
// componentes UTC contra la fecha de calendario local de "hoy" evita que
// una zona horaria detrás de UTC (como Argentina) corra el resultado un
// día — ver src/lib/dates.ts para el mismo problema en el formateo.
function dayNumber(y: number, m: number, d: number): number {
  return Math.floor(Date.UTC(y, m, d) / 86400000);
}

export function daysToExpiry(endDate: Date | string | null | undefined): number | null {
  if (!endDate) return null;
  const end = new Date(endDate);
  const endDay = dayNumber(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate());
  const now = new Date();
  const todayDay = dayNumber(now.getFullYear(), now.getMonth(), now.getDate());
  return endDay - todayDay;
}

export function expiryLevel(endDate: Date | null | undefined): ExpiryLevel {
  const days = daysToExpiry(endDate);
  if (days === null) return "sin_fecha";
  if (days < 0) return "vencida";
  if (days <= EXPIRY_THRESHOLDS.urgentDays) return "roja";
  if (days <= EXPIRY_THRESHOLDS.warningDays) return "naranja";
  return "verde";
}

export const EXPIRY_BADGE_CLASS: Record<ExpiryLevel, string> = {
  vencida: "bg-red-100 text-red-700",
  roja: "bg-red-100 text-red-700",
  naranja: "bg-amber-100 text-amber-700",
  verde: "bg-green-100 text-green-700",
  sin_fecha: "bg-navy-800 text-white/70",
};

export function expiryLabel(endDate: Date | null | undefined): string {
  const days = daysToExpiry(endDate);
  if (days === null) return "sin fecha";
  if (days < 0) return `vencida hace ${Math.abs(days)}d`;
  if (days === 0) return "vence hoy";
  return `vence en ${days}d`;
}
