import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter, Dancing_Script } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "sonner";
import { SITE_CONFIG } from "@/lib/utils";
import { LocalBusinessSchema } from "@/components/shared/structured-data";
import "./globals.css";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
  variable: "--font-inter",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-cormorant",
});

const dancing = Dancing_Script({
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
  variable: "--font-dancing",
});

export const viewport: Viewport = {
  themeColor: "#FEF8EE",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: `${SITE_CONFIG.name} · em Vicente Pires, DF`,
    template: `%s | ${SITE_CONFIG.shortName}`,
  },
  description: SITE_CONFIG.description,
  keywords: [
    "bronzeamento Vicente Pires",
    "bronze a jato DF",
    "bronzeamento natural DF",
    "Mércia Regina bronzeamento",
    "bronze Brasília",
    "Click 10",
  ],
  authors: [{ name: "Mércia Regina" }],
  creator: "Mércia Regina",
  publisher: "Mércia Regina · Beleza e Bronzeamento",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/images/logo-redondo-color.jpeg",
        width: 1200,
        height: 1200,
        alt: SITE_CONFIG.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    images: ["/images/logo-redondo-color.jpeg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_CONFIG.url,
  },
  icons: {
    icon: "/images/logo-redondo.jpeg",
    apple: "/images/logo-redondo-color.jpeg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${cormorant.variable} ${dancing.variable}`}
    >
      <head>
        <LocalBusinessSchema />
      </head>
      <body className="min-h-screen bg-brand-cream font-sans text-brand-brown antialiased">
        <a
          href="#conteudo-principal"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:rounded-full focus:bg-brand-brown focus:px-4 focus:py-2 focus:text-brand-sun"
        >
          Pular para o conteúdo
        </a>
        {children}
        <Toaster position="top-right" richColors closeButton />
        <Analytics />
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', { anonymize_ip: true });
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
