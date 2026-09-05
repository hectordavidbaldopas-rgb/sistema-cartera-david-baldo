// Seed inicial — Etapa 1.
// Crea el catálogo base (ramos, compañías), los vendedores/usuarios,
// la configuración del sistema, y carga la cartera real desde el Excel
// maestro para que la app arranque con datos verdaderos, no de prueba.

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import * as XLSX from "xlsx";
import path from "node:path";
import { initialPasswordFromDocument } from "../src/lib/credentials";

const prisma = new PrismaClient();

const CARTERA_XLSX = path.resolve(
  __dirname,
  "..",
  "..",
  "Base de Cartera - David Baldo.xlsx",
);

// Login: cada usuario entra con su propio DNI, contraseña inicial =
// últimos 4 dígitos de ese DNI (después la puede cambiar en "Mi cuenta").
const SELLER_SEED = [
  {
    key: "lucas",
    fullName: "Lucas Baldo",
    displayName: "Lucas",
    locality: "San Jorge",
    isAdmin: true,
    documentNumber: "36236280" as string | null,
    loginFallbackEmail: "lucas@davidbaldoseguros.local",
    email: "hectordavidbaldo.pas@gmail.com",
    phone: "3406415230",
  },
  {
    key: "david",
    fullName: "Hector David Baldo",
    displayName: "David",
    locality: "Las Parejas",
    isAdmin: false,
    documentNumber: "22543873" as string | null,
    loginFallbackEmail: "david@davidbaldoseguros.local",
    email: "hectordavidbaldo.pas@gmail.com",
    phone: "03471-15583651",
  },
  {
    key: "ruben",
    fullName: "Ruben",
    displayName: "Ruben",
    locality: "Las Rosas",
    isAdmin: false,
    documentNumber: "16398428" as string | null,
    loginFallbackEmail: "ruben@davidbaldoseguros.local",
    email: null as string | null,
    phone: null as string | null,
  },
] as const;

const FALLBACK_PASSWORD = "CambiarPas2026!";

// Catálogo real tomado del desplegable vigente en la Base de Cartera —
// no el listado de ejemplo del documento de arquitectura, que era solo
// ilustrativo.
const BRANCHES = [
  { name: "Auto/Moto/Camioneta/Camion", code: "AUTO" },
  { name: "Combinado Familiar", code: "HOGAR" },
  { name: "Accidentes Personales", code: "AP" },
  { name: "Transporte de Carga", code: "CARGA" },
  { name: "Integral de Comercio", code: "COMERCIO" },
  { name: "ART", code: "ART" },
  { name: "Vida", code: "VIDA" },
  { name: "Otro", code: "OTRO" },
];

const COMPANIES = [
  { name: "Mapfre", code: "MAPFRE" },
  { name: "Mercantil Andina", code: "MERCANTIL_ANDINA" },
  { name: "San Cristobal", code: "SAN_CRISTOBAL" },
  { name: "Swiss Medical", code: "SWISS_MEDICAL" },
  { name: "Asociart", code: "ASOCIART" },
];

async function seedCatalog() {
  for (const b of BRANCHES) {
    await prisma.insuranceBranch.upsert({
      where: { name: b.name },
      update: {},
      create: b,
    });
  }
  for (const c of COMPANIES) {
    await prisma.insuranceCompany.upsert({
      where: { name: c.name },
      update: {},
      create: c,
    });
  }
  console.log(`Ramos: ${BRANCHES.length} · Compañías: ${COMPANIES.length}`);
}

async function seedSellersAndUsers() {
  const sellerIdByDisplayName = new Map<string, string>();

  for (const s of SELLER_SEED) {
    const seller = await prisma.seller.upsert({
      where: { id: `seed-seller-${s.key}` },
      update: {},
      create: {
        id: `seed-seller-${s.key}`,
        fullName: s.fullName,
        displayName: s.displayName,
        locality: s.locality,
        phone: s.phone,
        email: s.email,
        documentNumber: s.documentNumber,
      },
    });
    sellerIdByDisplayName.set(s.displayName, seller.id);

    const loginId = s.documentNumber ?? s.loginFallbackEmail;
    const password = s.documentNumber ? initialPasswordFromDocument(s.documentNumber) : FALLBACK_PASSWORD;
    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.upsert({
      where: { email: loginId },
      update: {},
      create: {
        email: loginId,
        passwordHash,
        role: s.isAdmin ? "admin" : "seller",
        sellerId: seller.id,
      },
    });
    console.log(
      `  ${s.displayName}: login=${loginId} password=${password}${s.documentNumber ? "" : " (provisorio, falta DNI)"}`,
    );
  }

  return sellerIdByDisplayName;
}

async function seedSystemSettings() {
  const settings: Record<string, string> = {
    contact_phone: "3406415230",
    contact_email: "hectordavidbaldo.pas@gmail.com",
    portal_terms_text: [
      "Este portal es un canal informativo para que consultes tus pólizas, coberturas y vigencias contratadas a través de David Baldo Seguros (Productor Asesor de Seguros, matrícula PAS N° 63225).",
      "La información mostrada es de carácter informativo; ante cualquier discrepancia, prevalece la póliza emitida por la compañía aseguradora.",
      "Tus datos personales se utilizan exclusivamente para la gestión de tu cartera de seguros y no se comparten con terceros salvo para trámites propios de la póliza (compañía aseguradora, organismos de control).",
      "Podés solicitar la corrección o eliminación de tus datos personales escribiendo a hectordavidbaldo.pas@gmail.com o al 3406415230.",
      "Para reclamos, renovaciones, siniestros o consultas comerciales, el contacto oficial es siempre: 3406415230 / hectordavidbaldo.pas@gmail.com.",
    ].join("\n\n"),
  };

  for (const [key, value] of Object.entries(settings)) {
    await prisma.systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value, valueType: "string" },
    });
  }
  console.log(`Configuración del sistema: ${Object.keys(settings).length} claves.`);
}

type ExcelRow = {
  idCliente: string;
  nombre: string;
  telefono: string;
  compania: string;
  ramo: string;
  nPoliza: string;
  productor: string;
  notas: string;
  rowNumber: number;
};

function readCarteraExcel(): ExcelRow[] {
  const wb = XLSX.readFile(CARTERA_XLSX);
  const ws = wb.Sheets["Cartera"];
  const raw: unknown[][] = XLSX.utils.sheet_to_json(ws, {
    header: 1,
    defval: "",
    raw: false,
  });

  const rows: ExcelRow[] = [];
  for (let i = 1; i < raw.length; i++) {
    const r = raw[i] as string[];
    const idCliente = (r[0] ?? "").toString().trim();
    if (!idCliente || idCliente.startsWith("Leyenda")) continue;

    rows.push({
      idCliente,
      nombre: (r[1] ?? "").toString().trim(),
      telefono: (r[2] ?? "").toString().trim(),
      compania: (r[5] ?? "").toString().trim(),
      ramo: (r[6] ?? "").toString().trim(),
      nPoliza: (r[7] ?? "").toString().trim(),
      productor: (r[13] ?? "").toString().trim(),
      notas: (r[18] ?? "").toString().trim(),
      rowNumber: i + 1, // fila real en Excel (1-indexed, con header)
    });
  }
  return rows;
}

async function seedCarteraFromExcel(sellerIdByDisplayName: Map<string, string>) {
  const rows = readCarteraExcel();
  console.log(`Excel leído: ${rows.length} filas de póliza a importar.`);

  const branches = await prisma.insuranceBranch.findMany();
  const branchIdByName = new Map(branches.map((b) => [b.name, b.id]));
  const companies = await prisma.insuranceCompany.findMany();
  const companyIdByName = new Map(companies.map((c) => [c.name, c.id]));

  const batch = await prisma.importBatch.create({
    data: {
      fileName: "Base de Cartera - David Baldo.xlsx",
      importedBy: "seed-inicial",
      totalRows: rows.length,
      validRows: rows.length,
      status: "completed",
      importedRows: rows.length,
    },
  });

  // Agrupar filas por ID Cliente para crear un Client por cada uno.
  const byClientId = new Map<string, ExcelRow[]>();
  for (const row of rows) {
    if (!byClientId.has(row.idCliente)) byClientId.set(row.idCliente, []);
    byClientId.get(row.idCliente)!.push(row);
  }

  let clientsCreated = 0;
  let policiesCreated = 0;
  let skippedNoSeller = 0;

  for (const [externalId, group] of byClientId) {
    const nombre = group.find((r) => r.nombre)?.nombre ?? "";
    const telefono = group.find((r) => r.telefono)?.telefono ?? null;
    const informationStatus = telefono ? "partial" : "incomplete";

    const notes = Array.from(
      new Set(group.map((r) => r.notas).filter(Boolean)),
    ).join("\n---\n");

    const client = await prisma.client.create({
      data: {
        fullNameNormalized: nombre.toUpperCase(),
        firstName: null,
        lastName: null,
        phone: telefono,
        notes: notes || null,
        informationStatus,
        additionalData: { legacyClientId: externalId },
      },
    });
    clientsCreated++;

    for (const row of group) {
      const sellerId = sellerIdByDisplayName.get(row.productor);
      if (!sellerId) {
        skippedNoSeller++;
        continue;
      }
      const branchId = branchIdByName.get(row.ramo) ?? branchIdByName.get("Otro")!;
      const companyId = row.compania ? (companyIdByName.get(row.compania) ?? null) : null;

      const policy = await prisma.policy.create({
        data: {
          clientId: client.id,
          branchId,
          companyId,
          sellerId,
          policyNumber: row.nPoliza || null,
          commissionPercentage: 0.1,
          status: "draft",
          importBatchId: batch.id,
          sourceRowNumber: row.rowNumber,
          externalReference: externalId,
        },
      });

      await prisma.policyVersion.create({
        data: {
          policyId: policy.id,
          versionNumber: 1,
          clientId: client.id,
          branchId,
          companyId,
          sellerId,
          policyNumber: row.nPoliza || null,
          commissionPercentage: 0.1,
          changeReason: "import",
        },
      });

      policiesCreated++;
    }
  }

  console.log(
    `Clientes creados: ${clientsCreated} · Pólizas creadas: ${policiesCreated}` +
      (skippedNoSeller ? ` · Filas sin vendedor reconocido (omitidas): ${skippedNoSeller}` : ""),
  );
}

async function main() {
  await seedCatalog();
  const sellerIdByDisplayName = await seedSellersAndUsers();
  await seedSystemSettings();
  await seedCarteraFromExcel(sellerIdByDisplayName);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
