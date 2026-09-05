import { prisma } from "@/lib/prisma";
import { requireClient } from "@/lib/authz";
import { cardClass, primaryButtonClass } from "@/lib/ui";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EncuestasPortalPage() {
  const session = await requireClient();
  const clientId = session.user.clientId;
  if (!clientId) notFound();

  const [surveys, myResponses] = await Promise.all([
    prisma.survey.findMany({ where: { isActive: true }, orderBy: { createdAt: "desc" } }),
    prisma.surveyResponse.findMany({ where: { clientId, status: "completed" }, select: { surveyId: true } }),
  ]);
  const answeredIds = new Set(myResponses.map((r) => r.surveyId));

  return (
    <div className="min-h-screen bg-texture-navy">
      <header className="border-b border-gold-500/30 bg-navy-900 px-6 py-4">
        <Link href="/portal" className="text-sm text-white/70 hover:underline">
          ← Volver
        </Link>
        <h1 className="text-lg font-semibold text-gold-300">Encuestas</h1>
      </header>
      <main className="mx-auto max-w-2xl space-y-3 px-6 py-8">
        {surveys.map((s) => {
          const done = answeredIds.has(s.id);
          return (
            <div key={s.id} className={`${cardClass} flex items-center justify-between`}>
              <div>
                <p className="font-medium text-gold-300">{s.name}</p>
                {s.description && <p className="text-sm text-white/70">{s.description}</p>}
              </div>
              {done ? (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                  Completada
                </span>
              ) : (
                <Link href={`/portal/encuestas/${s.id}`} className={primaryButtonClass}>
                  Responder
                </Link>
              )}
            </div>
          );
        })}
        {surveys.length === 0 && (
          <p className="text-sm text-white/70">No hay encuestas disponibles por ahora.</p>
        )}
      </main>
    </div>
  );
}
