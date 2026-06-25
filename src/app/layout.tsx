import type { Metadata, Viewport } from "next";
import { Lexend } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import ConnectivityLayer from "@/components/ConnectivityLayer";

// Google Analytics 4. Override the id via NEXT_PUBLIC_GA_ID; loaded only in
// production so local/dev traffic isn't counted. afterInteractive = non-blocking.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-52ENT7BNML";
const GA_ENABLED = Boolean(GA_ID) && process.env.NODE_ENV === "production";

// Lexend is the design system's typeface. next/font self-hosts it (no runtime
// request to Google) and `display: swap` paints system-font text immediately —
// so the choice doesn't cost us anything on slow connections.
const lexend = Lexend({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-lexend",
});

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://venezuela-ayuda.vercel.app").replace(/\/$/, "");
const TITLE = "Venezuela Ayuda — Coordinación de emergencia";
const DESCRIPTION =
  "Plataforma comunitaria tras el terremoto en Venezuela: busca o reporta personas desaparecidas, marca a salvo, pide u ofrece ayuda y mira el mapa. Sin cuenta, en español.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  applicationName: "Venezuela Ayuda",
  manifest: "/manifest.webmanifest",
  keywords: [
    "Venezuela",
    "terremoto",
    "sismo",
    "desaparecidos",
    "personas desaparecidas",
    "emergencia",
    "ayuda",
    "rescate",
    "La Guaira",
    "Caracas",
    "edificios dañados",
    "centros de acopio",
    "Venezuela Ayuda",
  ],
  authors: [{ name: "Venezuela Ayuda" }],
  alternates: { canonical: "/" },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "Venezuela Ayuda",
    type: "website",
    locale: "es_VE",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "Venezuela Ayuda — coordinación de emergencia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#dc2626",
  width: "device-width",
  initialScale: 1,
  // Allow zoom for accessibility (don't lock pinch-zoom).
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={lexend.variable}>
      <body className="min-h-dvh flex flex-col antialiased">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:shadow"
        >
          Saltar al contenido
        </a>
        <ConnectivityLayer />
        {children}

        {GA_ENABLED && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
