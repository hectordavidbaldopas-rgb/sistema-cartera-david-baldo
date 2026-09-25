"use client";

import { useActionState } from "react";
import { reassignAndDeactivateSellerAction } from "../actions";
import { inputClass, labelClass, cardClass } from "@/lib/ui";

export default function ReassignSellerForm({
  sellerId,
  sellerName,
  policyCount,
  otherSellers,
}: {
  sellerId: string;
  sellerName: string;
  policyCount: number;
  otherSellers: { id: string; displayName: string }[];
}) {
  const [state, formAction, pending] = useActionState(reassignAndDeactivateSellerAction, {
    error: null,
    ok: false,
  });

  if (state.ok) {
    return (
      <div className={`${cardClass} border-emerald-500/40`}>
        <p className="text-sm text-emerald-400">
          Listo: las pólizas de {sellerName} se reasignaron y su cuenta quedó desactivada.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className={`${cardClass} flex flex-col gap-4 border-red-500/30`}>
      <input type="hidden" name="sellerId" value={sellerId} />
      <div>
        <p className="font-medium text-white/90">Dar de baja a {sellerName}</p>
        <p className="mt-1 text-sm text-white/60">
          Pasa las {policyCount} pólizas a nombre de otro vendedor (queda registrado como un cambio más en
          el historial de cada póliza) y desactiva su cuenta: no va a poder volver a entrar ni va a
          aparecer más como opción al cargar o editar pólizas.
        </p>
      </div>
      <div>
        <label className={labelClass}>Pasar las pólizas a</label>
        <select name="newSellerId" required className={inputClass} defaultValue="">
          <option value="" disabled>
            Elegí un vendedor
          </option>
          {otherSellers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.displayName}
            </option>
          ))}
        </select>
      </div>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition duration-150 hover:bg-red-500 disabled:opacity-60"
      >
        {pending ? "Reasignando..." : `Reasignar pólizas y dar de baja`}
      </button>
    </form>
  );
}
