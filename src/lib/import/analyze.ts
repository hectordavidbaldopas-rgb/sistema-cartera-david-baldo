import { prisma } from "@/lib/prisma";
import type { RawImportRow } from "./parse";
import { splitRamoText, mapRamoToken, type RamoToken } from "./branch-mapping";

// Ver ARQUITECTURA_BASE_DE_DATOS_APP_PAS.md sección 24 — prioridad de
// deduplicación: DNI > email > teléfono > nombre. Esta lista solo trae
// nombre/teléfono, así que la prioridad real acá es teléfono exacto
// ("confirmed") y, si no hay teléfono, nombre normalizado ("possible" —
// nunca se fusiona sola, la persona decide en la previsualización).

export type RowAnalysis = {
  rowNumber: number;
  nombre: string;
  telefono: string;
  ramoTokens: RamoToken[];
  validationStatus: "valid" | "incomplete" | "error";
  validationErrors: string[];
  duplicateStatus: "none" | "possible" | "confirmed";
  matchedClientId: string | null;
  matchedClientName: string | null;
  suggestedAction: "create" | "update" | "skip";
  duplicatePhoneInBatch: string[];
};

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

function normalizeName(name: string): string {
  return name.toUpperCase().replace(/\s+/g, " ").trim();
}

export async function analyzeImportRows(rows: RawImportRow[]): Promise<RowAnalysis[]> {
  const existingClients = await prisma.client.findMany({
    select: { id: true, phone: true, fullNameNormalized: true },
  });
  const byPhone = new Map<string, { id: string; name: string }>();
  const byName = new Map<string, { id: string; name: string }>();
  for (const c of existingClients) {
    if (c.phone) byPhone.set(normalizePhone(c.phone), { id: c.id, name: c.fullNameNormalized });
    byName.set(normalizeName(c.fullNameNormalized), { id: c.id, name: c.fullNameNormalized });
  }

  const phoneCountInBatch = new Map<string, string[]>();
  for (const row of rows) {
    if (!row.telefono) continue;
    const key = normalizePhone(row.telefono);
    if (!key) continue;
    if (!phoneCountInBatch.has(key)) phoneCountInBatch.set(key, []);
    phoneCountInBatch.get(key)!.push(row.nombre);
  }

  return rows.map((row): RowAnalysis => {
    const errors: string[] = [];
    if (!row.nombre) errors.push("Falta nombre");
    if (!row.telefono) errors.push("Falta teléfono");
    if (!row.ramo) errors.push("Falta ramo");

    const validationStatus: RowAnalysis["validationStatus"] = !row.nombre
      ? "error"
      : errors.length > 0
        ? "incomplete"
        : "valid";

    const ramoTokens = row.ramo ? splitRamoText(row.ramo).map(mapRamoToken) : [];

    const phoneKey = row.telefono ? normalizePhone(row.telefono) : "";
    const phoneMatch = phoneKey ? byPhone.get(phoneKey) : undefined;
    const nameMatch = !phoneMatch ? byName.get(normalizeName(row.nombre)) : undefined;

    let duplicateStatus: RowAnalysis["duplicateStatus"] = "none";
    let matchedClientId: string | null = null;
    let matchedClientName: string | null = null;
    if (phoneMatch) {
      duplicateStatus = "confirmed";
      matchedClientId = phoneMatch.id;
      matchedClientName = phoneMatch.name;
    } else if (nameMatch) {
      duplicateStatus = "possible";
      matchedClientId = nameMatch.id;
      matchedClientName = nameMatch.name;
    }

    const suggestedAction: RowAnalysis["suggestedAction"] =
      validationStatus === "error"
        ? "skip"
        : duplicateStatus === "confirmed"
          ? "update"
          : "create";

    const duplicatePhoneInBatch =
      phoneKey && (phoneCountInBatch.get(phoneKey)?.length ?? 0) > 1
        ? phoneCountInBatch.get(phoneKey)!.filter((n) => n !== row.nombre)
        : [];

    return {
      rowNumber: row.rowNumber,
      nombre: row.nombre,
      telefono: row.telefono,
      ramoTokens,
      validationStatus,
      validationErrors: errors,
      duplicateStatus,
      matchedClientId,
      matchedClientName,
      suggestedAction,
      duplicatePhoneInBatch,
    };
  });
}
