import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";
import TemplateRow from "./template-row";

export default async function PlantillasPage() {
  await requireAdmin();
  const [templates, branches] = await Promise.all([
    prisma.messageTemplate.findMany({ orderBy: { name: "asc" } }),
    prisma.insuranceBranch.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div>
      <h2 className="mb-2 text-base font-semibold text-gold-300">Plantillas de WhatsApp</h2>
      <p className="mb-6 text-sm text-white/70">
        Variables disponibles: <code>{"{{cliente}}"}</code> <code>{"{{vendedor}}"}</code>{" "}
        <code>{"{{ramo}}"}</code> <code>{"{{fecha_vencimiento}}"}</code>{" "}
        <code>{"{{compañia}}"}</code> <code>{"{{poliza}}"}</code>
      </p>
      <div className="space-y-3">
        <TemplateRow template={null} branches={branches} />
        {templates.map((t) => (
          <TemplateRow key={t.id} template={t} branches={branches} />
        ))}
      </div>
    </div>
  );
}
