import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Venezuela Ayuda",
    short_name: "VE Ayuda",
    description: "Coordinación de emergencia: a salvo, buscar, pedir y ofrecer ayuda.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#dc2626",
    lang: "es",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
