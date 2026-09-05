"use client";

import { useActionState } from "react";
import { changePasswordAction } from "@/lib/account-actions";
import { labelClass, primaryButtonClass, cardClass } from "@/lib/ui";
import PasswordInput from "@/components/password-input";

export default function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, { error: null, ok: false });

  return (
    <form action={formAction} className={`${cardClass} flex flex-col gap-4`}>
      <div>
        <label className={labelClass}>Contraseña actual</label>
        <PasswordInput name="currentPassword" required autoComplete="current-password" />
      </div>
      <div>
        <label className={labelClass}>Contraseña nueva</label>
        <PasswordInput name="newPassword" required minLength={4} autoComplete="new-password" />
      </div>
      <div>
        <label className={labelClass}>Repetir contraseña nueva</label>
        <PasswordInput name="confirmPassword" required minLength={4} autoComplete="new-password" />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.ok && <p className="text-sm text-green-700">Contraseña actualizada.</p>}
      <button type="submit" disabled={pending} className={`${primaryButtonClass} self-start`}>
        {pending ? "Guardando..." : "Cambiar contraseña"}
      </button>
    </form>
  );
}
