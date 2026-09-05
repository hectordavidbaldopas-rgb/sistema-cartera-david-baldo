"use client";

import { useActionState } from "react";
import { generatePortalAccessAction } from "../portal-access-actions";
import { clientUsernameFromPhone, CLIENT_DEFAULT_PASSWORD } from "@/lib/credentials";
import { cardClass, primaryButtonClass } from "@/lib/ui";
import PortalWhatsAppShare from "./portal-whatsapp-share";
import MissingDataWhatsAppShare from "./missing-data-whatsapp-share";

export default function PortalAccessBox({
  clientId,
  clientName,
  phone,
  hasAccount,
  hasLoggedIn,
  informationStatus,
  missing,
  isAdmin,
  inviteLinkSentCount,
  inviteLinkSentAt,
}: {
  clientId: string;
  clientName: string;
  phone: string | null;
  hasAccount: boolean;
  hasLoggedIn: boolean;
  informationStatus: string;
  missing: string[];
  isAdmin: boolean;
  inviteLinkSentCount: number;
  inviteLinkSentAt: Date | null;
}) {
  const [state, formAction, pending] = useActionState(generatePortalAccessAction, {
    error: null,
    credentials: null,
  });

  const knownUsername = phone ? clientUsernameFromPhone(phone) : null;

  return (
    <div className={cardClass}>
      <p className="mb-1 text-sm font-semibold text-white/90">Portal del cliente</p>
      {hasAccount ? (
        <p className="mb-2 text-sm text-white/70">Ya tiene acceso al portal.</p>
      ) : (
        <p className="mb-2 text-sm text-white/70">Todavía no tiene acceso al portal.</p>
      )}

      {!phone && (
        <p className="text-sm text-amber-600">
          Cargá el teléfono del cliente (botón Editar arriba) para poder generar su acceso.
        </p>
      )}

      {phone && (
        <form action={formAction}>
          <input type="hidden" name="clientId" value={clientId} />
          <button type="submit" disabled={pending} className={primaryButtonClass}>
            {pending ? "Generando..." : hasAccount ? "Reiniciar contraseña del portal" : "Generar acceso al portal"}
          </button>
        </form>
      )}

      {state.error && <p className="mt-2 text-sm text-red-600">{state.error}</p>}
      {state.credentials && (
        <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          <p className="font-medium">Pasale estos datos al cliente:</p>
          <p>
            Usuario: <strong>{state.credentials.user}</strong> · Contraseña:{" "}
            <strong>{state.credentials.password}</strong>
          </p>
          <p className="mt-1 text-xs text-green-700">
            El usuario son los últimos 6 números de su teléfono (sin 0, sin 15, sin
            característica).
          </p>
        </div>
      )}

      {isAdmin && phone && knownUsername && (state.credentials || !hasLoggedIn) && (
        <PortalWhatsAppShare
          clientId={clientId}
          clientName={clientName}
          phone={phone}
          username={state.credentials?.user ?? knownUsername}
          password={state.credentials?.password ?? CLIENT_DEFAULT_PASSWORD}
          alreadySentBefore={!state.credentials && inviteLinkSentCount > 0}
          lastSentAt={inviteLinkSentAt}
        />
      )}

      {isAdmin && phone && hasLoggedIn && !state.credentials && informationStatus !== "complete" && missing.length > 0 && (
        <MissingDataWhatsAppShare clientName={clientName} phone={phone} missing={missing} />
      )}

      {isAdmin && hasLoggedIn && !state.credentials && informationStatus === "complete" && (
        <p className="mt-3 text-sm text-green-500">✓ Datos completos — no hace falta enviarle nada.</p>
      )}
    </div>
  );
}
