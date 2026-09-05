"use client";

import { useActionState } from "react";
import { updateSellerAction } from "../actions";
import { inputClass, labelClass, primaryButtonClass, cardClass } from "@/lib/ui";
import type { Seller } from "@prisma/client";

export default function EditarVendedorForm({ seller }: { seller: Seller }) {
  const [state, formAction, pending] = useActionState(updateSellerAction, { error: null });

  return (
    <form action={formAction} className={`${cardClass} flex flex-col gap-4`}>
      <input type="hidden" name="id" value={seller.id} />
      <div>
        <label className={labelClass}>Nombre completo</label>
        <input name="fullName" required defaultValue={seller.fullName} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Nombre para mostrar</label>
        <input name="displayName" required defaultValue={seller.displayName} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Localidad</label>
        <input name="locality" defaultValue={seller.locality ?? ""} className={inputClass} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Teléfono</label>
          <input name="phone" defaultValue={seller.phone ?? ""} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>WhatsApp</label>
          <input name="whatsapp" defaultValue={seller.whatsapp ?? ""} className={inputClass} />
        </div>
      </div>
      <div>
        <label className={labelClass}>Email de contacto</label>
        <input name="email" type="email" defaultValue={seller.email ?? ""} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>DNI (usuario de acceso)</label>
        <input
          name="documentNumber"
          inputMode="numeric"
          placeholder={seller.documentNumber ? undefined : "Todavía no cargado"}
          defaultValue={seller.documentNumber ?? ""}
          className={inputClass}
        />
        {!seller.documentNumber && (
          <p className="mt-1 text-xs text-amber-600">
            Sin DNI, este vendedor sigue con un login provisorio. Al cargarlo acá, su usuario pasa
            a ser el DNI y la contraseña se reinicia a los últimos 4 dígitos.
          </p>
        )}
      </div>
      <label className="flex items-center gap-2 text-sm text-white/90">
        <input type="checkbox" name="isActive" defaultChecked={seller.isActive} />
        Activo
      </label>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button type="submit" disabled={pending} className={primaryButtonClass}>
        {pending ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}
