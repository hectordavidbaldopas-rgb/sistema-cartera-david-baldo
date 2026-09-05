// Ver ARQUITECTURA_BASE_DE_DATOS_APP_PAS.md sección 16 — nunca se
// almacenan mensajes de WhatsApp, solo se arma el link con el texto ya
// completado y se abre wa.me. La conversación en sí vive en WhatsApp.

export type TemplateVars = {
  cliente?: string;
  vendedor?: string;
  ramo?: string;
  fecha_vencimiento?: string;
  compania?: string;
  poliza?: string;
};

export function renderTemplate(text: string, vars: TemplateVars): string {
  return text
    .replaceAll("{{cliente}}", vars.cliente ?? "")
    .replaceAll("{{vendedor}}", vars.vendedor ?? "")
    .replaceAll("{{ramo}}", vars.ramo ?? "")
    .replaceAll("{{fecha_vencimiento}}", vars.fecha_vencimiento ?? "")
    .replaceAll("{{compañia}}", vars.compania ?? "")
    .replaceAll("{{poliza}}", vars.poliza ?? "");
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("54")) return digits;
  // Números argentinos locales (sin 0 ni 15) -> anteponer código de país.
  return `54${digits.replace(/^0/, "").replace(/^15/, "")}`;
}

export function buildWhatsAppLink(phone: string, message: string): string {
  const number = normalizePhone(phone);
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
