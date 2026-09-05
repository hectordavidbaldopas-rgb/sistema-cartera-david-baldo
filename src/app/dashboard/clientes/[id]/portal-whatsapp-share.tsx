"use client";

import { useState } from "react";
import { buildWhatsAppLink, MESSAGE_SIGNATURE } from "@/lib/whatsapp";
import { inputClass, labelClass, whatsappButtonClass } from "@/lib/ui";

function defaultMessage(clientName: string, link: string, username: string, password: string) {
  return `Hola ${clientName} 👋 ¿Cómo estás? ${MESSAGE_SIGNATURE}

Armamos un portal online para que puedas ver tus pólizas, coberturas y vencimientos cuando quieras, y actualizar tus datos de contacto.

Entrá acá: ${link}
Usuario: ${username}
Contraseña: ${password}

Te recomendamos cambiar la contraseña la primera vez que entres, desde "Mi cuenta". Cualquier duda, escribinos por acá.`;
}

export default function PortalWhatsAppShare({
  clientName,
  phone,
  username,
  password,
}: {
  clientName: string;
  phone: string;
  username: string;
  password: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  const [message, setMessage] = useState(() => defaultMessage(clientName, appUrl, username, password));

  return (
    <div className="mt-3 border-t border-gold-500/20 pt-3">
      <label className={labelClass}>Mensaje para compartir</label>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={6}
        className={inputClass}
      />
      {!appUrl && (
        <p className="mt-1 text-xs text-amber-600">
          Ojo: todavía no está configurado NEXT_PUBLIC_APP_URL, el link va a salir vacío.
        </p>
      )}
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
