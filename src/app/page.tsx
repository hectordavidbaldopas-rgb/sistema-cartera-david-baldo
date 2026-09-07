import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import HomeLanding from "./home-landing";

export const metadata: Metadata = {
  title: "David Baldo Seguros — Productor Asesor de Seguros, Mat. N° 63225",
  description:
    "Asesoramiento en seguros de Auto, Hogar, Comercio, Agro, Industrias, Vida, ART y Turismo en Las Parejas y la zona. Multicompañía, con asesoramiento real. Cotizá por WhatsApp.",
};

export default async function Home() {
  const session = await auth();
  if (!session?.user) return <HomeLanding />;
  redirect(session.user.role === "client" ? "/portal" : "/dashboard");
}
