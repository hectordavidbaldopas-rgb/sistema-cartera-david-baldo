"use client";

import { useActionState } from "react";
import { updateMyDataAction } from "./actions";
import { inputClass, labelClass, primaryButtonClass, cardClass } from "@/lib/ui";
import type { Client } from "@prisma/client";

export default function EditDataForm({ client }: { client: Client }) {
  const [state, formAction, pending] = useActionState(updateMyDataAction, { error: null });

  return (
    <form action={formAction} className={`${cardClass} flex flex-col gap-4`}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Teléfono</label>
          <input name="phone" defaultValue={client.phone ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>WhatsApp</label>
          <input name="whatsapp" defaultValue={client.whatsapp ?? ""} className={inputClass} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Email</label>
          <input name="email" type="email" defaultValue={client.email ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Teléfono alternativo / de emergencia</label>
          <input
            name="alternatePhone"
            defaultValue={client.alternatePhone ?? ""}
            className={inputClass}
            placeholder="Ej: un familiar, por si no te podemos ubicar"
          />
        </div>
      </div>
      <div>
        <label className={labelClass}>DNI</label>
        <input name="documentNumber" defaultValue={client.documentNumber ?? ""} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Domicilio</label>
        <input name="address" defaultValue={client.address ?? ""} className={inputClass} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Ciudad</label>
          <input name="city" defaultValue={client.city ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Provincia</label>
          <input name="province" defaultValue={client.province ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Código postal</label>
          <input name="postalCode" defaultValue={client.postalCode ?? ""} className={inputClass} />
        </div>
      </div>
      <div>
        <label className={labelClass}>Ocupación</label>
        <input name="occupation" defaultValue={client.occupation ?? ""} className={inputClass} />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button type="submit" disabled={pending} className={`${primaryButtonClass} self-start`}>
        {pending ? "Guardando..." : "Guardar"}
      </button>
    </form>
  );
}
