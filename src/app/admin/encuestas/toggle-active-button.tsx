"use client";

import { toggleSurveyActiveAction } from "./actions";
import { secondaryButtonClass } from "@/lib/ui";

export default function ToggleActiveButton({ id, isActive }: { id: string; isActive: boolean }) {
  return (
    <form action={toggleSurveyActiveAction}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" className={secondaryButtonClass}>
        {isActive ? "Desactivar" : "Activar"}
      </button>
    </form>
  );
}
