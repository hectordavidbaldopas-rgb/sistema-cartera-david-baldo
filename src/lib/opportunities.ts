import { prisma } from "@/lib/prisma";

// Ver ARQUITECTURA_BASE_DE_DATOS_APP_PAS.md sección 18, ejemplo:
// "Cliente tiene Auto pero no Hogar" => oportunidad "Hogar — revisar cobertura".
//
// Convención: cuando una opción de encuesta (SurveyOption.value) coincide
// con el id de un InsuranceBranch, significa "el cliente está interesado en
// este ramo". Si lo respondió y no tiene ninguna póliza vigente de ese
// ramo, se genera una oportunidad automáticamente. No hardcodea ninguna
// encuesta puntual — funciona con cualquier pregunta de opciones que un
// admin arme usando ramos como opciones.
export async function generateOpportunitiesFromResponse(responseId: string) {
  const response = await prisma.surveyResponse.findUnique({
    where: { id: responseId },
    include: {
      client: { include: { policies: { select: { branchId: true, status: true } } } },
      answers: { include: { option: true } },
    },
  });
  if (!response) return 0;

  const branches = await prisma.insuranceBranch.findMany();
  const branchIds = new Set(branches.map((b) => b.id));

  const coveredBranchIds = new Set(
    response.client.policies
      .filter((p) => p.status !== "cancelled" && p.status !== "lost")
      .map((p) => p.branchId),
  );

  const interestedBranchIds = new Set(
    response.answers
      .map((a) => a.option?.value)
      .filter((v): v is string => !!v && branchIds.has(v)),
  );

  const missingBranchIds = [...interestedBranchIds].filter((id) => !coveredBranchIds.has(id));
  if (missingBranchIds.length === 0) return 0;

  // Vendedor responsable: el de la primera póliza del cliente, si tiene.
  const sellerId = response.client.policies.length
    ? (await prisma.policy.findFirst({ where: { clientId: response.clientId }, select: { sellerId: true } }))
        ?.sellerId
    : null;
  if (!sellerId) return 0;

  let created = 0;
  for (const branchId of missingBranchIds) {
    const existing = await prisma.opportunity.findFirst({
      where: { clientId: response.clientId, branchId, status: { notIn: ["won", "lost"] } },
    });
    if (existing) continue;

    const branch = branches.find((b) => b.id === branchId)!;
    await prisma.opportunity.create({
      data: {
        clientId: response.clientId,
        sellerId,
        source: "survey",
        branchId,
        title: `${branch.name} — revisar cobertura`,
        description: "Generada automáticamente a partir de una respuesta de encuesta.",
      },
    });
    created++;
  }
  return created;
}

// Cuando un cliente entra al portal y actualiza sus propios datos de
// contacto, es una señal de buena predisposición: ya mostró que usa el
// portal. Se genera una oportunidad (una sola vez por cliente) para que
// el vendedor lo tenga anotado y le mande las primeras encuestas/ofertas.
export async function generatePortalEngagementOpportunity(clientId: string) {
  const existing = await prisma.opportunity.findFirst({
    where: { clientId, source: "portal_engagement" },
  });
  if (existing) return null;

  const firstPolicy = await prisma.policy.findFirst({
    where: { clientId },
    select: { sellerId: true },
  });

  // Clientes sin ninguna póliza todavía (prospectos importados) no tienen
  // vendedor vía policy — se usa el vendedor de quien lo cargó, si lo tiene.
  let sellerId = firstPolicy?.sellerId;
  if (!sellerId) {
    const client = await prisma.client.findUnique({ where: { id: clientId }, select: { createdBy: true } });
    const creator = client?.createdBy
      ? await prisma.user.findUnique({ where: { id: client.createdBy }, select: { sellerId: true } })
      : null;
    sellerId = creator?.sellerId ?? undefined;
  }
  if (!sellerId) return null;

  return prisma.opportunity.create({
    data: {
      clientId,
      sellerId,
      source: "portal_engagement",
      title: "Cliente activo en el portal — enviar encuesta/oferta",
      description:
        "Generada automáticamente: el cliente ingresó al portal y actualizó sus datos de contacto.",
    },
  });
}
