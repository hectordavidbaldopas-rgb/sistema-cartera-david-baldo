import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/auth";
import { EMAIL, FACEBOOK_HREF, INSTAGRAM_HREF, WHATSAPP_NUMBER } from "@/lib/contact";
import HomeLanding from "./home-landing";

const TITLE = "Baldo Seguros — David Baldo, Productor Asesor de Seguros, Mat. N° 63225";
const DESCRIPTION =
  "Asesoramiento en seguros de Auto, Hogar, Comercio, Agro, Industrias, Vida, ART y Turismo en Las Parejas y la zona. Multicompañía, con asesoramiento real. Cotizá por WhatsApp.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  // La imagen la toma Next solo de app/opengraph-image.jpg.
  openGraph: {
    type: "website",
    locale: "es_AR",
    url: "/",
    siteName: "Baldo Seguros",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

// Datos estructurados para Google (búsquedas locales tipo "seguros Las Parejas").
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "InsuranceAgency",
  name: "Baldo Seguros — David Baldo",
  description: DESCRIPTION,
  url: "https://davidbaldo.vercel.app",
  image: "https://davidbaldo.vercel.app/opengraph-image.jpg",
  telephone: `+${WHATSAPP_NUMBER}`,
  email: EMAIL,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Las Parejas",
    addressRegion: "Santa Fe",
    addressCountry: "AR",
  },
  areaServed: "Las Parejas y zona, Santa Fe",
  founder: { "@type": "Person", name: "David Baldo", jobTitle: "Productor Asesor de Seguros, Mat. N° 63225" },
  sameAs: [INSTAGRAM_HREF, FACEBOOK_HREF],
};

export default async function Home() {
  const session = await auth();
  if (!session?.user)
    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <HomeLanding />
      </>
    );
  redirect(session.user.role === "client" ? "/portal" : "/dashboard");
}
