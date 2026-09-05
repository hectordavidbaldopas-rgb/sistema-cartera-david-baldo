// Opciones de los desplegables del CRM — ver ARQUITECTURA_BASE_DE_DATOS_APP_PAS.md
// secciones 12-16.

export const FOLLOW_UP_STATUS = [
  { value: "pending", label: "Pendiente" },
  { value: "contacted", label: "Contactado" },
  { value: "quote_sent", label: "Cotización enviada" },
  { value: "negotiating", label: "Negociando" },
  { value: "renewed", label: "Renovado" },
  { value: "lost", label: "Perdido" },
] as const;

export const PRIORITY = [
  { value: "low", label: "Baja" },
  { value: "medium", label: "Media" },
  { value: "high", label: "Alta" },
  { value: "urgent", label: "Urgente" },
] as const;

export const EVENT_TYPE = [
  { value: "whatsapp_sent", label: "WhatsApp enviado" },
  { value: "whatsapp_received", label: "WhatsApp recibido" },
  { value: "phone_call", label: "Llamada" },
  { value: "email_sent", label: "Email enviado" },
  { value: "email_received", label: "Email recibido" },
  { value: "quote_sent", label: "Cotización enviada" },
  { value: "meeting", label: "Reunión" },
  { value: "note", label: "Nota" },
  { value: "status_change", label: "Cambio de estado" },
  { value: "renewal_confirmed", label: "Renovación confirmada" },
  { value: "lost", label: "Perdido" },
  { value: "other", label: "Otro" },
] as const;

export const TASK_TYPE = [
  { value: "renewal", label: "Renovación" },
  { value: "follow_up", label: "Seguimiento" },
  { value: "missing_data", label: "Datos faltantes" },
  { value: "payment", label: "Pago" },
  { value: "quote", label: "Cotización" },
  { value: "client_contact", label: "Contactar cliente" },
  { value: "update_data", label: "Actualizar datos" },
  { value: "other", label: "Otro" },
] as const;

export const TASK_STATUS = [
  { value: "pending", label: "Pendiente" },
  { value: "in_progress", label: "En curso" },
  { value: "completed", label: "Completada" },
  { value: "cancelled", label: "Cancelada" },
] as const;

export function labelFor(list: readonly { value: string; label: string }[], value: string): string {
  return list.find((o) => o.value === value)?.label ?? value;
}
