"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";

// sessionStorage se borra cuando se cierra el navegador (a diferencia de la
// cookie de sesión, que sobrevive). Si al cargar la página no está esta
// marca pero sí hay sesión iniciada, es porque el navegador se cerró y se
// volvió a abrir (o el link se abrió en una pestaña nueva) — por seguridad,
// cerramos la sesión vieja en vez de dejarla entrar directo.
const FLAG = "cartera-session-active";

export default function SessionCloseGuard({ hasSession }: { hasSession: boolean }) {
  useEffect(() => {
    let hadFlag = false;
    try {
      hadFlag = sessionStorage.getItem(FLAG) === "1";
      sessionStorage.setItem(FLAG, "1");
    } catch {
      return;
    }
    if (!hadFlag && hasSession) {
      signOut({ callbackUrl: "/login" });
    }
  }, [hasSession]);

  return null;
}
