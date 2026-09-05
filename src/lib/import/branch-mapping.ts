// Mapea el texto libre de "ramo" que suele venir en las listas de David/Ruben
// (auto, moto, pick up, hogar, campo...) a las categorías reales del
// desplegable de InsuranceBranch. Misma convención usada para las
// importaciones manuales anteriores de la cartera — ver
// ARQUITECTURA_BASE_DE_DATOS_APP_PAS.md sección 6.

const SYNONYM_TO_BRANCH_NAME: Record<string, string> = {
  AUTO: "Auto/Moto/Camioneta/Camion",
  AUTOS: "Auto/Moto/Camioneta/Camion",
  MOTO: "Auto/Moto/Camioneta/Camion",
  MOTOS: "Auto/Moto/Camioneta/Camion",
  "PICK UP": "Auto/Moto/Camioneta/Camion",
  CAMION: "Auto/Moto/Camioneta/Camion",
  CAMIONETA: "Auto/Moto/Camioneta/Camion",
  HOGAR: "Combinado Familiar",
  CASA: "Combinado Familiar",
  COMBINADO: "Combinado Familiar",
  COMERCIO: "Integral de Comercio",
  ART: "ART",
  "ACC PERS": "Accidentes Personales",
  AP: "Accidentes Personales",
  ACCIDENTES: "Accidentes Personales",
  CAMPO: "Otro",
  VIDA: "Vida",
  CARGA: "Transporte de Carga",
  TRANSPORTE: "Transporte de Carga",
};

export type RamoToken = { raw: string; branchName: string; mapped: boolean };

// Separa "PICK UP - MOTO - HOGAR" / "CAMION Y PICK UP" / "AUTO-MOTO" en
// tokens individuales — cada uno se convierte en una fila de póliza propia,
// igual que se hizo a mano antes.
export function splitRamoText(ramoText: string): string[] {
  const normalized = ramoText.replace(/\s+Y\s+/gi, "-");
  return normalized
    .split("-")
    .map((t) => t.trim())
    .filter(Boolean);
}

export function mapRamoToken(token: string): RamoToken {
  const key = token.trim().toUpperCase();
  const branchName = SYNONYM_TO_BRANCH_NAME[key];
  return branchName ? { raw: token, branchName, mapped: true } : { raw: token, branchName: "Otro", mapped: false };
}
