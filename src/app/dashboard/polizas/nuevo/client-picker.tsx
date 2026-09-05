"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { inputClass, tileLinkClass } from "@/lib/ui";

export default function ClientPicker({
  clients,
}: {
  clients: { id: string; fullNameNormalized: string; phone: string | null }[];
}) {
  const [search, setSearch] = useState("");

  const results = useMemo(() => {
    const term = search.trim().toUpperCase();
    if (!term) return clients.slice(0, 20);
    return clients.filter((c) => c.fullNameNormalized.includes(term)).slice(0, 20);
  }, [search, clients]);

  return (
    <div>
      <input
        autoFocus
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar cliente por nombre..."
        className={inputClass}
      />
      <div className="mt-3 space-y-2">
        {results.map((c) => (
          <Link
            key={c.id}
            href={`/dashboard/clientes/${c.id}/polizas/nuevo`}
            className={`block rounded-xl border border-gold-500/30 bg-navy-900 p-3 hover:border-gold-500/50 ${tileLinkClass}`}
          >
            <p className="font-medium text-gold-300">{c.fullNameNormalized}</p>
            <p className="text-sm text-white/70">{c.phone ?? "—"}</p>
          </Link>
        ))}
        {results.length === 0 && (
          <p className="text-sm text-white/70">
            No se encontró ningún cliente con ese nombre.
          </p>
        )}
      </div>
    </div>
  );
}
