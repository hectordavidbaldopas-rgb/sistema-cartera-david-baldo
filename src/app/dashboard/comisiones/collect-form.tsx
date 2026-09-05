"use client";

import { useActionState } from "react";
import { registerCollectionAction } from "./actions";
import { inputClass } from "@/lib/ui";

export default function CollectForm({ id, maxAmount }: { id: string; maxAmount: number }) {
  const [state, formAction, pending] = useActionState(registerCollectionAction, { error: null });

  return (
    <form action={formAction} className="flex shrink-0 items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <input
        name="amount"
        type="number"
        step="0.01"
        max={maxAmount}
        defaultValue={maxAmount}
        className={`${inputClass} w-28`}
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-60"
      >
        {pending ? "..." : "Registrar cobro"}
      </button>
      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
    </form>
  );
}
