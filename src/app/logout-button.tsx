"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton({ variant = "light" }: { variant?: "light" | "dark" }) {
  const className =
    variant === "dark"
      ? "rounded-full border border-white/25 px-3 py-1.5 text-sm text-white transition duration-150 hover:bg-navy-900/10 active:translate-y-px active:bg-navy-900/20"
      : "rounded-full border border-gold-500/40 px-3 py-1.5 text-sm text-white/80 transition duration-150 hover:bg-navy-800 active:translate-y-px active:bg-navy-950";

  return (
    <button onClick={() => signOut({ callbackUrl: "/login" })} className={className}>
      Salir
    </button>
  );
}
