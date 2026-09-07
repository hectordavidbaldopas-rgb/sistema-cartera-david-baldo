"use client";

import { useState } from "react";
import { buildWhatsAppLink, MESSAGE_SIGNATURE } from "@/lib/whatsapp";
import { inputClass, labelClass, whatsappButtonClass } from "@/lib/ui";
import { recordInviteLinkSentAction } from "../portal-access-actions";
import { formatDate } from "@/lib/dates";

function firstMessage(clientName: string, link: string, username: string, password: string) {
  return `Hola ${clientName} 👋 ¿Cómo estás? ${MESSAGE_SIGNATURE}

Armamos un portal online para que puedas ver tus pólizas, coberturas y vencimientos cuando quieras, y actualizar tus datos de contacto.

Entrá acá: ${link}
Hacé clic en "Portal clientes" (arriba a la derecha) e ingresá con estos datos:
Usuario: ${username}
Contraseña: ${password}

Te recomendamos cambiar la contraseña la primera vez que entres, desde "Mi cuenta". Cualquier duda, escribinos por acá.`;
}

// Mensaje distinto para cuando ya le mandamos el link antes y todavía no
// entró — para no repetirle el mismo texto tal cual una segunda vez.
function reminderMessage(clientName: string, link: string, username: string, password: string) {
  return `Hola ${clientName} 👋 ¿Cómo andás? ${MESSAGE_SIGNATURE}

Te había pasado el acceso al portal hace unos días y no llegué a ver si pudiste entrar. Te reenvío los datos por las dudas:

${link}
Hacé clic en "Portal clientes" (arriba a la derecha) e ingresá con estos datos:
Usuario: ${username}
Contraseña: ${password}

Cualquier problema para entrar, avisame y te ayudo.`;
}

export default function PortalWhatsAppShare({
  clientId,
  clientName,
  phone,
  username,
  password,
  alreadySentBefore,
  lastSentAt,
}: {
  clientId: string;
  clientName: string;
  phone: string;
  username: string;
  password: string;
  alreadySentBefore: boolean;
  lastSentAt: Date | null;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  const [message, setMessage] = useState(() =>
    alreadySentBefore
      ? reminderMessage(clientName, appUrl, username, password)
      : firstMessage(clientName, appUrl, username, password),
  );

  return (
    <div className="mt-3 border-t border-gold-500/20 pt-3">
      {alreadySentBefore && (
        <p className="mb-2 text-sm text-amber-600">
          Ya le habíamos mandado el link{lastSentAt ? ` el ${formatDate(lastSentAt)}` : ""} y todavía no
          entró — este es un mensaje de recordatorio, no el mismo de la primera vez.
        </p>
      )}
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
        onClick={() => {
          recordInviteLinkSentAction(clientId);
        }}
        className={`mt-2 ${whatsappButtonClass}`}
      >
        Compartir por WhatsApp
      </a>
    </div>
  );
}
