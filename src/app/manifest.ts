import type { MetadataRoute } from "next";

// Datos para cuando se agrega la app a la pantalla de inicio del celular:
// nombre, ícono (la "B" dorada sobre navy) y colores de la pantalla de entrada.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Baldo Seguros",
    short_name: "Baldo Seguros",
    description: "Sistema de cartera y portal de clientes de Baldo Seguros.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b111d",
    theme_color: "#0b111d",
    icons: [
      { src: "/app-icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/app-icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/app-icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
