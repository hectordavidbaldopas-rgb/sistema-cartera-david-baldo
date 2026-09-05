import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import { auth } from "@/auth";
import SessionCloseGuard from "@/components/session-close-guard";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Sistema de Cartera — David Baldo Seguros",
  description: "Gestión de cartera de clientes y pólizas de David Baldo Seguros.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const session = await auth();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SessionCloseGuard hasSession={!!session?.user} />
        {children}
      </body>
    </html>
  );
}
