import type { Metadata } from "next";
import { Inter, Playfair_Display, Cormorant_Garamond, Montserrat } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { BASE_URL, CONTACT_EMAIL } from "@/lib/constants";
import "../globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { CartProvider } from "@/lib/cart-context";
import CartStickyBar from "@/components/cosmetics/CartStickyBar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Barbaria Morocco | L'authenticite marocaine",
    template: "%s | Barbaria Morocco",
  },
  description:
    "Decouvrez Barbaria Morocco : cosmetiques naturels, textile artisanal et produits alimentaires du terroir marocain.",
  alternates: {
    languages: {
      fr: `${BASE_URL}/fr`,
      en: `${BASE_URL}/en`,
    },
  },
  openGraph: {
    type: "website",
    siteName: "Barbaria Morocco",
    locale: "fr_MA",
    alternateLocale: "en_US",
    images: [
      {
        url: "/brand_photos/products-all-three.jpg",
        width: 1200,
        height: 630,
        alt: "Barbaria Morocco - Cosmetiques, Textile, Alimentaire",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Barbaria Morocco | L'authenticite marocaine",
    description:
      "Cosmetiques naturels, textile artisanal et produits alimentaires du terroir marocain.",
    images: ["/brand_photos/products-all-three.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${playfair.variable} ${cormorant.variable} ${montserrat.variable} h-full antialiased`}
    >
      <head>
        <link rel="canonical" href={`${BASE_URL}/${locale}`} />
        <link rel="alternate" hrefLang="fr" href={`${BASE_URL}/fr`} />
        <link rel="alternate" hrefLang="en" href={`${BASE_URL}/en`} />
        <link rel="alternate" hrefLang="x-default" href={`${BASE_URL}/fr`} />
      </head>
      <body className="min-h-full flex flex-col bg-bb-bg text-bb-on-surface font-sans antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#2C1A0E] focus:text-[#F7F2EA] focus:rounded-sm focus:text-sm"
        >
          Skip to content
        </a>
        <NextIntlClientProvider locale={locale}>
          <CartProvider>
            <Navbar locale={locale} />
            <main id="main-content" className="flex-1">{children}</main>
            <WhatsAppFloat />
            <CartStickyBar />
            <Footer />
          </CartProvider>
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Barbaria Morocco",
              url: BASE_URL,
              logo: `${BASE_URL}/brand_photos/barbaria-logo-new.jpg`,
              description:
                "Cosmetiques naturels, textile artisanal et produits alimentaires du terroir marocain.",
              contactPoint: {
                "@type": "ContactPoint",
                email: CONTACT_EMAIL,
                contactType: "customer service",
                availableLanguage: ["French", "English"],
              },
              email: CONTACT_EMAIL,
              sameAs: [
                "https://instagram.com/barbaria_00",
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Accueil",
                  item: `${BASE_URL}/${locale}`,
                },
              ],
            }),
          }}
        />
      </body>
    </html>
  );
}
