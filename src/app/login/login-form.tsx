"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { loginAction } from "./actions";
import { inputClass, labelClass, primaryButtonClass } from "@/lib/ui";
import PasswordInput from "@/components/password-input";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const portal = searchParams.get("portal");
  const [state, formAction, pending] = useActionState(loginAction, { error: null });

  const placeholder = portal === "cliente" ? "" : portal === "vendedor" ? "DNI" : "DNI o teléfono";
  const helperText =
    portal === "cliente"
      ? null
      : portal === "vendedor"
        ? "Tu DNI."
        : "Vendedores: tu DNI. Clientes: los últimos 6 números de tu teléfono.";

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <div>
        <label className={labelClass}>Usuario</label>
        <input
          name="email"
          type="text"
          inputMode="numeric"
          autoComplete="username"
          required
          className={inputClass}
          placeholder={placeholder}
        />
        {helperText && <p className="mt-1 text-xs text-white/50">{helperText}</p>}
      </div>
      <div>
        <label className={labelClass}>Contraseña</label>
        <PasswordInput name="password" required autoComplete="current-password" placeholder="••••••••" />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button type="submit" disabled={pending} className={`${primaryButtonClass} mt-2 w-full`}>
        {pending ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  );
}
