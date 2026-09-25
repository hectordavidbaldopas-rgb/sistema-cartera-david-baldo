import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Vercel Cron le pega a esta ruta todos los días (ver vercel.json) solo
// para que Supabase vea actividad reciente — el plan gratuito pausa el
// proyecto a los 7 días sin uso, y eso tira abajo los logins hasta que
// alguien lo reanuda a mano desde el dashboard.
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  await prisma.$queryRaw`SELECT 1`;

  return NextResponse.json({ ok: true, ranAt: new Date().toISOString() });
}
