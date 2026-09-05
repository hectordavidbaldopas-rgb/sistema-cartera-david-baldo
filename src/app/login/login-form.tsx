"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { loginAction } from "./actions";
import { inputClass, labelClass, primaryButtonClass } from "@/lib/ui";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [state, formAction, pending] = useActionState(loginAction, { error: null });

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
          placeholder="DNI o teléfono"
        />
        <p className="mt-1 text-xs text-white/50">
          Vendedores: tu DNI. Clientes: los últimos 6 números de tu teléfono.
        </p>
      </div>
      <div>
        <label className={labelClass}>Contraseña</label>
        <input
          name="password"
          type="password"
          required
          className={inputClass}
          placeholder="••••••••"
        />
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button type="submit" disabled={pending} className={`${primaryButtonClass} mt-2 w-full`}>
        {pending ? "Ingresando..." : "Ingresar"}
      </button>
    </form>
  );
}
