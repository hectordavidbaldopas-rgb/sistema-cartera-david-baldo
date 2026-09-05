// Convención de acceso acordada con el equipo.
//
// Vendedores/admin: usuario = su DNI, contraseña inicial = últimos 4
// dígitos de ese DNI.
//
// Clientes: no tenemos DNI cargado para casi nadie, pero sí teléfono. Por
// eso el usuario es el teléfono sin el 0, sin el 15 y sin característica de
// zona — en la práctica, sus últimos 6 dígitos, que es el número de abonado
// real. La contraseña inicial es fija, "0000", para todos los clientes.
//
// Cualquiera puede cambiar su contraseña después desde "Mi cuenta".

export function normalizeDocumentNumber(dni: string): string {
  return dni.replace(/\D/g, "");
}

export function initialPasswordFromDocument(dni: string): string {
  const digits = normalizeDocumentNumber(dni);
  return digits.slice(-4);
}

export function isValidDocumentNumber(dni: string): boolean {
  const digits = normalizeDocumentNumber(dni);
  return digits.length >= 6 && digits.length <= 9;
}

export const CLIENT_DEFAULT_PASSWORD = "0000";

export function clientUsernameFromPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.slice(-6);
}

export function isValidPhoneForLogin(phone: string): boolean {
  return phone.replace(/\D/g, "").length >= 6;
}
