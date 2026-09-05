"use client";

import { useActionState } from "react";
import { uploadPolicyPdfAction } from "./pdf-actions";
import { cardClass, primaryButtonClass } from "@/lib/ui";
import { formatDate } from "@/lib/dates";

export default function PolicyPdfBox({
  policyId,
  pdfPath,
  pdfOriginalName,
  pdfUploadedAt,
}: {
  policyId: string;
  pdfPath: string | null;
  pdfOriginalName: string | null;
  pdfUploadedAt: Date | null;
}) {
  const [state, formAction, pending] = useActionState(uploadPolicyPdfAction, { error: null });

  return (
    <div className={cardClass}>
      <p className="mb-1 text-sm font-semibold text-white/90">PDF de la póliza</p>

      {pdfPath ? (
        <div className="mb-3 text-sm text-white/80">
          <p>
            ✓ Cargado{pdfOriginalName ? `: ${pdfOriginalName}` : ""}
            {pdfUploadedAt ? ` (${formatDate(pdfUploadedAt)})` : ""}
          </p>
          <a
            href={`/api/policies/${policyId}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-block text-gold-300 underline underline-offset-4"
          >
            Ver / descargar PDF
          </a>
        </div>
      ) : (
        <p className="mb-3 text-sm text-white/70">Todavía no se cargó el PDF original de la compañía.</p>
      )}

      <form action={formAction} className="flex flex-wrap items-center gap-3">
        <input type="hidden" name="policyId" value={policyId} />
        <input
          type="file"
          name="pdfFile"
          accept="application/pdf"
          required
          className="text-sm text-white/80 file:mr-3 file:rounded-lg file:border-0 file:bg-navy-800 file:px-3 file:py-1.5 file:text-sm file:text-gold-300"
        />
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {pending ? "Subiendo..." : pdfPath ? "Reemplazar PDF" : "Subir PDF"}
        </button>
      </form>
      {state.error && <p className="mt-2 text-sm text-red-600">{state.error}</p>}
    </div>
  );
}
