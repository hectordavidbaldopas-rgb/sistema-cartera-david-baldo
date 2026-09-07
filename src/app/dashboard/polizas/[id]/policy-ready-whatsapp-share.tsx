"use client";

import { useState } from "react";
import { buildWhatsAppLink, sellerSignature } from "@/lib/whatsapp";
import { inputClass, labelClass, cardClass, whatsappButtonClass } from "@/lib/ui";

function defaultMessage(params: {
  clientFirstName: string;
  sellerName: string;
  branchName: string;
  companyName: string;
  policyNumber: string;
  link: string;
}) {
  const coverage = `${params.branchName}${
    params.companyName ? ` (${params.companyName}${params.policyNumber ? ` · Póliza ${params.policyNumber}` : ""})` : ""
  }`;
  return `Hola ${params.clientFirstName} 👋 ¿Cómo estás? ${sellerSignature(params.sellerName)}

Te cuento que ya está lista y cargada tu póliza de ${coverage} — ya contás con la cobertura activa.

La podés ver y descargar cuando quieras entrando a la app: ${params.link} — hacé clic en "Portal clientes" (arriba a la derecha).

Cualquier duda, escribinos.`;
}

export default function PolicyReadyWhatsAppShare({
  clientFirstName,
  phone,
  sellerName,
  branchName,
  companyName,
  policyNumber,
}: {
  clientFirstName: string;
  phone: string;
  sellerName: string;
  branchName: string;
  companyName: string;
  policyNumber: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  const [message, setMessage] = useState(() =>
    defaultMessage({ clientFirstName, sellerName, branchName, companyName, policyNumber, link: appUrl }),
  );

  return (
    <div className={cardClass}>
      <p className="mb-1 text-sm font-semibold text-white/90">Avisarle al cliente</p>
      <p className="mb-2 text-sm text-white/70">
        Mensaje para avisar que la póliza ya está cargada y disponible en el portal.
      </p>
      <label className={labelClass}>Mensaje para compartir</label>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={7}
        className={inputClass}
      />
      <a
        href={buildWhatsAppLink(phone, message)}
        target="_blank"
        rel="noopener noreferrer"
        className={`mt-2 ${whatsappButtonClass}`}
      >
        Compartir por WhatsApp
      </a>
    </div>
  );
}
