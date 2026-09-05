"use client";

import { updateTaskStatusAction } from "./actions";

export default function TaskStatusButtons({ taskId, status }: { taskId: string; status: string }) {
  if (status === "completed" || status === "cancelled") {
    return (
      <span className="shrink-0 rounded-full bg-navy-800 px-2 py-0.5 text-xs text-white/70">
        {status === "completed" ? "completada" : "cancelada"}
      </span>
    );
  }

  return (
    <div className="flex shrink-0 gap-2">
      <form action={updateTaskStatusAction}>
        <input type="hidden" name="id" value={taskId} />
        <input type="hidden" name="status" value="completed" />
        <button
          type="submit"
          className="rounded-lg border border-green-200 px-2.5 py-1 text-xs font-medium text-green-700 transition hover:bg-green-50"
        >
          ✓ Completar
        </button>
      </form>
      <form action={updateTaskStatusAction}>
        <input type="hidden" name="id" value={taskId} />
        <input type="hidden" name="status" value="cancelled" />
        <button
          type="submit"
          className="rounded-lg border border-gold-500/30 px-2.5 py-1 text-xs font-medium text-white/70 transition hover:bg-navy-800"
        >
          Descartar
        </button>
      </form>
    </div>
  );
}
