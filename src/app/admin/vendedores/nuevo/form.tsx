"use client";

import { useActionState } from "react";
import { createSellerAction } from "../actions";
import { inputClass, labelClass, primaryButtonClass, cardClass } from "@/lib/ui";

export default function NuevoVendedorForm() {
  const [state, formAction, pending] = useActionState(createSellerAction, { error: null });

  return (
    <form action={formAction} className={`${cardClass} flex flex-col gap-4`}>
      <div>
        <label className={labelClass}>Nombre completo</label>
        <input name="fullName" required className={inputClass} placeholder="Nombre y apellido" />
      </div>
      <div>
        <label className={labelClass}>Nombre para mostrar</label>
        <input name="displayName" required className={inputClass} placeholder="Ej: David" />
      </div>
      <div>
        <label className={labelClass}>Localidad</label>
        <input name="locality" className={inputClass} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Teléfono</label>
          <input name="phone" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>WhatsApp</label>
          <input name="whatsapp" className={inputClass} />
        </div>
      </div>
      <div>
        <label className={labelClass}>Email de contacto (opcional)</label>
        <input name="email" type="email" className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>DNI (va a ser su usuario de acceso)</label>
        <input name="documentNumber" required inputMode="numeric" placeholder="12345678" className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Rol</label>
        <select name="role" required className={inputClass} defaultValue="seller">
          <option value="seller">Vendedor</option>
          <option value="admin">Administrador</option>
        </select>
      </div>
      <p className="text-xs text-white/70">
        Usuario = DNI. Contraseña inicial = los últimos 4 dígitos de ese DNI — puede cambiarla
        después desde &quot;Mi cuenta&quot;.
      </p>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button type="submit" disabled={pending} className={primaryButtonClass}>
        {pending ? "Creando..." : "Crear vendedor"}
      </button>
    </form>
  );
}
