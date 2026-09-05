"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton({ variant = "light" }: { variant?: "light" | "dark" }) {
  const className =
    variant === "dark"
      ? "rounded-full border border-white/25 px-3 py-1.5 text-sm text-white transition hover:bg-navy-900/10"
      : "rounded-full border border-gold-500/40 px-3 py-1.5 text-sm text-white/80 transition hover:bg-navy-800";

  return (
    <button onClick={() => signOut({ callbackUrl: "/login" })} className={className}>
      Salir
    </button>
  );
}
