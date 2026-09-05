"use client";

import { useFormStatus } from "react-dom";
import { primaryButtonClass } from "@/lib/ui";

export default function ConfirmButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={primaryButtonClass}>
      {pending ? "Importando..." : "Confirmar importación"}
    </button>
  );
}
