import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite acceder al servidor de desarrollo desde el celular por la IP de
  // la red local (WiFi de casa/oficina). Sin esto, Next.js bloquea por
  // seguridad ciertos pedidos (como cerrar sesión) que no vengan de
  // localhost. Si la IP de esta PC cambia, actualizar acá.
  allowedDevOrigins: ["192.168.0.233"],

  // Los Server Actions rechazan payloads de más de 1MB por default — hace
  // falta subirlo para poder cargar el PDF original de las pólizas.
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
