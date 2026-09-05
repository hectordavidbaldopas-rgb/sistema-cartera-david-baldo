// Roles del sistema — ver ARQUITECTURA_BASE_DE_DATOS_APP_PAS.md sección 2.
// No hardcodear estos valores en otros lugares: importar siempre desde acá.

export const ROLES = {
  ADMIN: "admin",
  SELLER: "seller",
  CLIENT: "client",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export function isAdmin(role: string | undefined | null) {
  return role === ROLES.ADMIN;
}

export function isSeller(role: string | undefined | null) {
  return role === ROLES.SELLER;
}

export function isClient(role: string | undefined | null) {
  return role === ROLES.CLIENT;
}
