import type { Metadata } from "next";
import { Playfair_Display, Cormorant_Garamond, Montserrat } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { BASE_URL, INSTAGRAM_HANDLE } from "@/lib/constants";
import { CLIENT_DATA } from "@/lib/legal/client-data";
import "../globals.css";
import ShellChrome from "@/components/shell/ShellChrome";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { InquiryProvider } from "@/lib/inquiry-context";
import { ProductCatalogueProvider } from "@/lib/data/ProductCatalogueContext";
import { getMinimalProductMap } from "@/lib/data/products";
import { getSiteSettings } from "@/lib/data/site-settings";
import { ConsentProvider } from "@/components/cookies/ConsentContext";
import JsonLd from "@/components/JsonLd";
import ConsentBanner from "@/components/cookies/ConsentBanner";
import AnalyticsGate from "@/components/cookies/AnalyticsGate";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
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

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const ogLocale = locale === "en" ? "en_US" : "fr_MA";
  const altLocale = locale === "en" ? "fr_MA" : "en_US";
  return {
    metadataBase: new URL(BASE_URL),
    title: {
      default: t("site_title_default"),
      template: t("site_title_template"),
    },
    description: t("site_description"),
    // Default alternates point to the locale root. Each page overrides
    // with its own path via the pageMetadata helper.
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages: {
        fr: `${BASE_URL}/fr`,
        en: `${BASE_URL}/en`,
        "x-default": `${BASE_URL}/fr`,
      },
    },
    openGraph: {
      type: "website",
      siteName: "Barbaria Morocco",
      locale: ogLocale,
      alternateLocale: altLocale,
      images: [
        {
          url: "/brand_photos/products-all-three.jpg",
          width: 1200,
          height: 630,
          alt: t("site_og_image_alt"),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("site_title_default"),
      description: t("site_twitter_description"),
      images: ["/brand_photos/products-all-three.jpg"],
    },
    icons: {
      icon: "/favicon.ico",
      apple: "/apple-touch-icon.png",
    },
    manifest: "/manifest.json",
  };
}

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

  const lang = locale === "fr" ? "fr" : "en";
  const [productMap, socials] = await Promise.all([
    getMinimalProductMap(lang),
    getSiteSettings(),
  ]);
  const catalogueEntries = Array.from(productMap.entries());
  const metaT = await getTranslations({ locale, namespace: "meta" });
  const orgDescription = metaT("org_description");
  const breadcrumbHome = metaT("breadcrumb_home");

  return (
    <html
      lang={locale}
      className={`${playfair.variable} ${cormorant.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bb-bg text-bb-on-surface font-sans antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#2C1A0E] focus:text-[#F7F2EA] focus:rounded-sm focus:text-sm"
        >
          Skip to content
        </a>
        <NextIntlClientProvider locale={locale}>
          <ConsentProvider>
            <InquiryProvider>
              <ProductCatalogueProvider catalogue={catalogueEntries}>
                <ShellChrome locale={locale} mainId="main-content" socials={socials}>
                  <div className="flex-1">{children}</div>
                </ShellChrome>
                <WhatsAppFloat href={socials.whatsappUrl} />
              </ProductCatalogueProvider>
            </InquiryProvider>
            <ConsentBanner />
            <AnalyticsGate />
          </ConsentProvider>
        </NextIntlClientProvider>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": ["Organization", "LocalBusiness"],
            name: "Barbaria Morocco",
            legalName: CLIENT_DATA.legalName.en,
            url: BASE_URL,
            logo: `${BASE_URL}/brand_photos/barbaria-logo-new.jpg`,
            image: `${BASE_URL}/brand_photos/barbaria-logo-new.jpg`,
            description: orgDescription,
            address: {
              "@type": "PostalAddress",
              streetAddress: "Rue Soumaya, Immeuble 82, 2ème étage N°04",
              addressLocality: "Casablanca",
              addressRegion: "Casablanca-Settat",
              postalCode: "20000",
              addressCountry: "MA",
            },
            contactPoint: {
              "@type": "ContactPoint",
              email: socials.contactEmail,
              telephone: socials.contactPhone.split("/")[0].trim(),
              contactType: "customer service",
              availableLanguage: ["French", "English", "Arabic"],
              areaServed: ["MA", "FR", "AE", "SA", "US", "GB"],
            },
            email: socials.contactEmail,
            telephone: socials.contactPhone.split("/")[0].trim(),
            // ICE: Identifiant Commun de l'Entreprise, the Moroccan
            // tax ID. Schema.org uses taxID for this kind of identifier.
            taxID: CLIENT_DATA.iceNumber.en,
            // Moroccan trade-register number, also worth surfacing for
            // verification by search engines and AI agents that look
            // for proof-of-existence signals.
            identifier: [
              { "@type": "PropertyValue", propertyID: "ICE", value: CLIENT_DATA.iceNumber.en },
              { "@type": "PropertyValue", propertyID: "RC", value: "719643" },
              { "@type": "PropertyValue", propertyID: "OMPIC", value: CLIENT_DATA.ompicCertNegatif.en },
            ],
            sameAs: [
              `https://instagram.com/${INSTAGRAM_HANDLE}`,
              socials.linkedinUrl,
              socials.xUrl,
              // Wikidata Q-number for Barbaria Morocco. Cross-links the
              // brand entity into the open knowledge graph that feeds
              // every AI search engine's "who is this company" answer.
              "https://www.wikidata.org/wiki/Q139891256",
            ].filter(Boolean),
          }}
        />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: breadcrumbHome,
                item: `${BASE_URL}/${locale}`,
              },
            ],
          }}
        />
      </body>
    </html>
  );
}
