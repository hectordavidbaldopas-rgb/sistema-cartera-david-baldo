"use client";

import { useActionState } from "react";
import { inputClass, labelClass, primaryButtonClass, cardClass } from "@/lib/ui";
import type { Client } from "@prisma/client";

type ActionFn = (
  prevState: { error: string | null },
  formData: FormData,
) => Promise<{ error: string | null }>;

export default function ClientForm({
  action,
  client,
  submitLabel,
}: {
  action: ActionFn;
  client?: Client;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, { error: null });
  const birthDateValue = client?.birthDate
    ? new Date(client.birthDate).toISOString().slice(0, 10)
    : "";

  return (
    <form action={formAction} className={`${cardClass} flex flex-col gap-4`}>
      {client && <input type="hidden" name="id" value={client.id} />}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Nombre</label>
          <input name="firstName" defaultValue={client?.firstName ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Apellido</label>
          <input name="lastName" defaultValue={client?.lastName ?? ""} className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Tipo de documento</label>
          <select
            name="documentType"
            defaultValue={client?.documentType ?? ""}
            className={inputClass}
          >
            <option value="">—</option>
            <option value="DNI">DNI</option>
            <option value="CUIT">CUIT</option>
            <option value="CUIL">CUIL</option>
            <option value="Pasaporte">Pasaporte</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>N° de documento</label>
          <input
            name="documentNumber"
            defaultValue={client?.documentNumber ?? ""}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Fecha de nacimiento</label>
        <input
          name="birthDate"
          type="date"
          defaultValue={birthDateValue}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Teléfono</label>
          <input name="phone" defaultValue={client?.phone ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>WhatsApp</label>
          <input name="whatsapp" defaultValue={client?.whatsapp ?? ""} className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Email</label>
          <input name="email" type="email" defaultValue={client?.email ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Teléfono alternativo / de emergencia</label>
          <input
            name="alternatePhone"
            defaultValue={client?.alternatePhone ?? ""}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Domicilio</label>
        <input name="address" defaultValue={client?.address ?? ""} className={inputClass} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Ciudad</label>
          <input name="city" defaultValue={client?.city ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Provincia</label>
          <input name="province" defaultValue={client?.province ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Código postal</label>
          <input name="postalCode" defaultValue={client?.postalCode ?? ""} className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Ocupación</label>
        <input name="occupation" defaultValue={client?.occupation ?? ""} className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>Notas</label>
        <textarea
          name="notes"
          rows={3}
          defaultValue={client?.notes ?? ""}
          className={inputClass}
        />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button type="submit" disabled={pending} className={primaryButtonClass}>
        {pending ? "Guardando..." : submitLabel}
      </button>
    </form>
  );
}
