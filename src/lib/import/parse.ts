import * as XLSX from "xlsx";

export type RawImportRow = {
  rowNumber: number;
  nombre: string;
  telefono: string;
  ramo: string;
};

// Formato esperado: lista simple sin encabezado — Nombre | Teléfono | Ramo,
// igual que las listas que pasa David por WhatsApp (ver skill
// pas-actualizar-cartera). Si la primera fila es un encabezado (texto no
// numérico raro en la columna de teléfono), igual entra como fila y queda
// marcada inválida en la previsualización — la persona la descarta ahí.
export function parseClientListFile(buffer: ArrayBuffer): RawImportRow[] {
  const wb = XLSX.read(buffer, { type: "array" });
  const firstSheetName = wb.SheetNames[0];
  const ws = wb.Sheets[firstSheetName];
  const raw: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "", raw: false });

  const rows: RawImportRow[] = [];
  for (let i = 0; i < raw.length; i++) {
    const r = raw[i] as string[];
    const nombre = (r[0] ?? "").toString().trim();
    const telefono = (r[1] ?? "").toString().trim();
    const ramo = (r[2] ?? "").toString().trim();
    if (!nombre && !telefono && !ramo) continue;
    rows.push({ rowNumber: i + 1, nombre, telefono, ramo });
  }
  return rows;
}
