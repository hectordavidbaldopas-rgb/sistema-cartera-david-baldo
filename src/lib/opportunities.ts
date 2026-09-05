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
