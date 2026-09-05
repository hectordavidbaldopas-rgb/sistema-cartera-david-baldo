export const QUESTION_TYPE = [
  { value: "single_choice", label: "Opción única" },
  { value: "multiple_choice", label: "Opción múltiple" },
  { value: "text", label: "Texto libre" },
  { value: "number", label: "Número" },
  { value: "date", label: "Fecha" },
  { value: "boolean", label: "Sí / No" },
] as const;

// Lógica condicional de una pregunta: se muestra solo si otra pregunta ya
// respondida tiene ese valor de opción cargado. Sin condición, siempre se
// muestra. Ver ARQUITECTURA_BASE_DE_DATOS_APP_PAS.md sección 17.
export type ConditionalLogic = {
  dependsOnQuestionId: string;
  showWhenOptionValue: string;
};
