// Opciones de los desplegables de Policy — ver ARQUITECTURA_BASE_DE_DATOS_APP_PAS.md
// sección 8. No hardcodear estas listas en los formularios, importar desde acá.

export const POLICY_STATUS = [
  { value: "draft", label: "Borrador (datos incompletos)" },
  { value: "active", label: "Vigente" },
  { value: "pending_renewal", label: "Pendiente de renovación" },
  { value: "cancelled", label: "Cancelada" },
  { value: "expired", label: "Vencida" },
  { value: "lost", label: "Perdida" },
] as const;

export const PAYMENT_METHOD = [
  { value: "unknown", label: "Sin especificar" },
  { value: "cash", label: "Efectivo" },
  { value: "transfer", label: "Transferencia" },
  { value: "debit", label: "Débito automático" },
  { value: "credit_card", label: "Tarjeta de crédito" },
  { value: "other", label: "Otro" },
] as const;

export const PAYMENT_STATUS = [
  { value: "unknown", label: "Sin especificar" },
  { value: "paid", label: "Pagado" },
  { value: "partial", label: "Pago parcial" },
  { value: "pending", label: "Pendiente" },
  { value: "overdue", label: "Vencido" },
] as const;

export const UPDATE_FREQUENCY = [
  { value: "none", label: "Sin actualización" },
  { value: "monthly", label: "Mensual" },
  { value: "bimonthly", label: "Bimestral" },
  { value: "quarterly", label: "Trimestral" },
  { value: "semiannual", label: "Semestral" },
  { value: "annual", label: "Anual" },
  { value: "custom", label: "Otra" },
] as const;

export const CANCELLATION_REASON = [
  { value: "price", label: "Precio" },
  { value: "changed_company", label: "Cambió de compañía" },
  { value: "sold_asset", label: "Vendió el bien asegurado" },
  { value: "moved", label: "Se mudó" },
  { value: "other", label: "Otro" },
  { value: "unknown", label: "Sin especificar" },
] as const;
