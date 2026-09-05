import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { policyScopeWhere } from "@/lib/authz";
import { getPolicyPdfSignedUrl } from "@/lib/storage";
import { NextResponse } from "next/server";

// Ruta compartida por staff y clientes del portal: siempre resuelve el
// permiso de nuevo acá (no solo en la UI) antes de generar la signed URL,
// como marca la sección 35 de ARQUITECTURA_BASE_DE_DATOS_APP_PAS.md.
export async function GET(_req: Request, ctx: RouteContext<"/api/policies/[id]/pdf">) {
  const session = await auth();
  if (!session?.user) return NextResponse.redirect(new URL("/login", _req.url));

  const { id } = await ctx.params;

  const policy =
    session.user.role === "client"
      ? await prisma.policy.findFirst({ where: { id, clientId: session.user.clientId ?? "__none__" } })
      : await prisma.policy.findFirst({ where: { id, ...policyScopeWhere(session) } });

  if (!policy) return new NextResponse("No encontrado", { status: 404 });
  if (!policy.pdfPath) return new NextResponse("Esta póliza todavía no tiene PDF cargado", { status: 404 });

  try {
    const signedUrl = await getPolicyPdfSignedUrl(policy.pdfPath);
    return NextResponse.redirect(signedUrl);
  } catch (e) {
    return new NextResponse((e as Error).message, { status: 500 });
  }
}
