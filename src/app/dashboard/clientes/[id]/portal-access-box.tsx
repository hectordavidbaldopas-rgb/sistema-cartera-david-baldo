"use client";

import { useActionState } from "react";
import { generatePortalAccessAction } from "../portal-access-actions";
import { clientUsernameFromPhone, CLIENT_DEFAULT_PASSWORD } from "@/lib/credentials";
import { cardClass, primaryButtonClass } from "@/lib/ui";
import PortalWhatsAppShare from "./portal-whatsapp-share";

export default function PortalAccessBox({
  clientId,
  clientName,
  phone,
  hasAccount,
}: {
  clientId: string;
  clientName: string;
  phone: string | null;
  hasAccount: boolean;
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

      {phone && knownUsername && (hasAccount || state.credentials) && (
        <PortalWhatsAppShare
          clientName={clientName}
          phone={phone}
          username={state.credentials?.user ?? knownUsername}
          password={state.credentials?.password ?? CLIENT_DEFAULT_PASSWORD}
        />
      )}
    </div>
  );
}
