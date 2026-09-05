"use client";

import { useState } from "react";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { inputClass, labelClass } from "@/lib/ui";

function defaultMessage(clientName: string, link: string, missing: string[]) {
  return `Hola ${clientName}! Somos David Baldo Seguros.

Vimos que entraste al portal, ¡genial! Nos falta que completes estos datos para tener todo al día: ${missing.join(", ")}.

Podés hacerlo entrando de nuevo acá: ${link}

Cualquier duda, escribinos por acá.`;
}

export default function MissingDataWhatsAppShare({
  clientName,
  phone,
  missing,
}: {
  clientName: string;
  phone: string;
  missing: string[];
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  const [message, setMessage] = useState(() => defaultMessage(clientName, appUrl, missing));

  return (
    <div className="mt-3 border-t border-gold-500/20 pt-3">
      <p className="mb-1 text-sm text-amber-600">
        Ya tiene acceso al portal — le falta completar: {missing.join(", ")}.
      </p>
      <label className={labelClass}>Mensaje para compartir</label>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={6}
        className={inputClass}
      />
      <a
        href={buildWhatsAppLink(phone, message)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-block rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
      >
        Compartir por WhatsApp
      </a>
    </div>
  );
}
