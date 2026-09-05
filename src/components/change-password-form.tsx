"use client";

import { useActionState } from "react";
import { changePasswordAction } from "@/lib/account-actions";
import { inputClass, labelClass, primaryButtonClass, cardClass } from "@/lib/ui";

export default function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, { error: null, ok: false });

  return (
    <form action={formAction} className={`${cardClass} flex flex-col gap-4`}>
      <div>
        <label className={labelClass}>Contraseña actual</label>
        <input name="currentPassword" type="password" required className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Contraseña nueva</label>
        <input name="newPassword" type="password" required minLength={4} className={inputClass} />
      </div>
      <div>
        <label className={labelClass}>Repetir contraseña nueva</label>
        <input name="confirmPassword" type="password" required minLength={4} className={inputClass} />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.ok && <p className="text-sm text-green-700">Contraseña actualizada.</p>}
      <button type="submit" disabled={pending} className={`${primaryButtonClass} self-start`}>
        {pending ? "Guardando..." : "Cambiar contraseña"}
      </button>
    </form>
  );
}
