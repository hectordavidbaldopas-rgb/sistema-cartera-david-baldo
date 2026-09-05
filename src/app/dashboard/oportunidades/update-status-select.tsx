"use client";

import { updateOpportunityStatusAction } from "./actions";

const OPTIONS = [
  { value: "new", label: "Nueva" },
  { value: "contacted", label: "Contactado" },
  { value: "quote_sent", label: "Cotización enviada" },
  { value: "negotiating", label: "Negociando" },
  { value: "won", label: "Ganada" },
  { value: "lost", label: "Perdida" },
];

export default function UpdateStatusSelect({ id, status }: { id: string; status: string }) {
  return (
    <form
      action={updateOpportunityStatusAction}
      onChange={(e) => (e.currentTarget as HTMLFormElement).requestSubmit()}
    >
      <input type="hidden" name="id" value={id} />
      <select
        key={status}
        name="status"
        defaultValue={status}
        className="rounded-lg border border-gold-500/40 px-2 py-1 text-xs"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </form>
  );
}
