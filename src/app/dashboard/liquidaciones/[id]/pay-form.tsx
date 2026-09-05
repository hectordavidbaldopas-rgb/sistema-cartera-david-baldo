"use client";

import { useActionState } from "react";
import { registerPaymentAction } from "../actions";
import { inputClass, primaryButtonClass } from "@/lib/ui";

export default function PayForm({ id, maxAmount }: { id: string; maxAmount: number }) {
  const [state, formAction, pending] = useActionState(registerPaymentAction, { error: null });

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <input name="amount" type="number" step="0.01" max={maxAmount} defaultValue={maxAmount} className={`${inputClass} w-32`} />
      <button type="submit" disabled={pending} className={primaryButtonClass}>
        {pending ? "..." : "Registrar pago"}
      </button>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
