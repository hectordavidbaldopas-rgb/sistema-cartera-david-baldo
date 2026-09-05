// Ver ARQUITECTURA_BASE_DE_DATOS_APP_PAS.md sección 32 — el estado de
// información no se guarda a mano, se calcula a partir de campos
// obligatorios y siempre se puede saber específicamente qué falta.

export type ClientLike = {
  documentNumber?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  birthDate?: Date | null;
};

const FIELD_LABELS: Record<keyof ClientLike, string> = {
  documentNumber: "DNI",
  phone: "teléfono",
  email: "email",
  address: "domicilio",
  birthDate: "fecha de nacimiento",
};

export function missingFields(client: ClientLike): string[] {
  return (Object.keys(FIELD_LABELS) as (keyof ClientLike)[])
    .filter((key) => !client[key])
    .map((key) => FIELD_LABELS[key]);
}

export function computeInformationStatus(client: ClientLike): "complete" | "partial" | "incomplete" {
  const missing = missingFields(client);
  if (missing.length === 0) return "complete";
  if (missing.length === Object.keys(FIELD_LABELS).length) return "incomplete";
  return "partial";
}
