import { createClient } from "@supabase/supabase-js";

// Los PDF originales de las pólizas se guardan en un bucket privado de
// Supabase Storage (mismo proyecto que la base de datos). Nunca se generan
// URLs públicas: siempre se pide una signed URL de corta duración al momento
// de la descarga, desde el server, usando la service role key.
const POLICY_PDF_BUCKET = "policy-pdfs";

function getStorageClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Falta configurar SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY para poder subir/descargar PDFs.",
    );
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function uploadPolicyPdf(policyId: string, file: File): Promise<string> {
  const client = getStorageClient();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${policyId}/${Date.now()}-${safeName}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await client.storage.from(POLICY_PDF_BUCKET).upload(path, buffer, {
    contentType: file.type || "application/pdf",
    upsert: true,
  });
  if (error) throw new Error(`No se pudo subir el PDF: ${error.message}`);

  return path;
}

export async function deletePolicyPdf(path: string): Promise<void> {
  const client = getStorageClient();
  await client.storage.from(POLICY_PDF_BUCKET).remove([path]);
}

export async function getPolicyPdfSignedUrl(path: string): Promise<string> {
  const client = getStorageClient();
  const { data, error } = await client.storage
    .from(POLICY_PDF_BUCKET)
    .createSignedUrl(path, 60 * 5);
  if (error || !data) {
    throw new Error(`No se pudo generar el link de descarga: ${error?.message ?? "desconocido"}`);
  }
  return data.signedUrl;
}
