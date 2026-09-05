import { auth } from "@/auth";
import { redirect } from "next/navigation";

// Ver ARQUITECTURA_BASE_DE_DATOS_APP_PAS.md sección 35 — la autorización
// también se valida acá (no solo en el proxy/middleware) para que cada
// Server Action quede protegida aunque cambie el matcher de rutas.

export async function requireSession() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session;
}

export async function requireAdmin() {
  const session = await requireSession();
  if (session.user.role !== "admin") redirect("/dashboard");
  return session;
}

export async function requireStaff() {
  const session = await requireSession();
  if (session.user.role === "client") redirect("/portal");
  return session;
}

export async function requireClient() {
  const session = await requireSession();
  if (session.user.role !== "client") redirect("/dashboard");
  return session;
}

// Filtro Prisma para "clientes que puedo ver": todos si admin, solo los
// que tienen alguna póliza con mi sellerId si soy vendedor — más los que
// el propio vendedor acaba de crear y todavía no tienen ninguna póliza
// cargada (si no, un cliente recién creado sería invisible hasta la
// Etapa 3, cuando se puedan cargar pólizas).
export function clientScopeWhere(session: { user: { id: string; role: string; sellerId: string | null } }) {
  if (session.user.role === "admin") return {};
  return {
    OR: [
      { policies: { some: { sellerId: session.user.sellerId ?? "__none__" } } },
      { createdBy: session.user.id },
    ],
  };
}

// Filtro Prisma para "pólizas que puedo ver": todas si admin, solo las
// propias si soy vendedor.
export function policyScopeWhere(session: { user: { role: string; sellerId: string | null } }) {
  if (session.user.role === "admin") return {};
  return { sellerId: session.user.sellerId ?? "__none__" };
}
