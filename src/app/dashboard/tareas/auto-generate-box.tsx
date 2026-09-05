"use client";

import { useState, useTransition } from "react";
import { generateAutoTasksAction } from "./actions";
import { cardClass, primaryButtonClass } from "@/lib/ui";
import type { AutoTaskCandidate } from "@/lib/auto-tasks";

export default function AutoGenerateBox({ candidates }: { candidates: AutoTaskCandidate[] }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<number | null>(null);
  const [confirming, setConfirming] = useState(false);

  const byRule = candidates.reduce<Record<string, { label: string; count: number }>>((acc, c) => {
    acc[c.ruleId] ??= { label: c.ruleLabel, count: 0 };
    acc[c.ruleId].count += 1;
    return acc;
  }, {});

  if (candidates.length === 0) {
    return (
      <div className={cardClass}>
        <p className="text-sm text-white/70">
          No hay tareas automáticas nuevas para proponer (reglas de renovación, seguimiento
          vencido, datos incompletos, etc.).
        </p>
      </div>
    );
  }

  function handleGenerate() {
    startTransition(async () => {
      const count = await generateAutoTasksAction();
      setResult(count);
      setConfirming(false);
    });
  }

  return (
    <div className={`${cardClass} border-amber-200 bg-amber-50`}>
      <p className="mb-2 text-sm font-semibold text-amber-900">
        {candidates.length} tareas automáticas propuestas
      </p>
      <ul className="mb-3 space-y-1 text-sm text-amber-800">
        {Object.values(byRule).map((r) => (
          <li key={r.label}>
            {r.count} — {r.label}
          </li>
        ))}
      </ul>
      {result !== null ? (
        <p className="text-sm font-medium text-green-700">Se crearon {result} tareas.</p>
      ) : confirming ? (
        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerate}
            disabled={pending}
            className={primaryButtonClass}
          >
            {pending ? "Generando..." : `Sí, generar las ${candidates.length}`}
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="text-sm text-amber-700 underline"
          >
            Cancelar
          </button>
        </div>
      ) : (
        <button onClick={() => setConfirming(true)} className={primaryButtonClass}>
          Revisar y generar
        </button>
      )}
    </div>
  );
}
