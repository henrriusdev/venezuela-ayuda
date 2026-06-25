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

export const metadata: Metadata = {
  title: "Venezuela Ayuda — Coordinación de emergencia",
  description:
    "Conecta personas, familias y ayuda durante la emergencia. Márcate a salvo, busca a alguien, pide o ofrece ayuda.",
  applicationName: "Venezuela Ayuda",
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "Venezuela Ayuda",
    description: "Conecta personas, familias y ayuda durante la emergencia.",
    type: "website",
    locale: "es_VE",
  },
  robots: { index: true, follow: true },
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
