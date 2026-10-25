import "@fontsource-variable/bricolage-grotesque/wdth.css";
import "@fontsource-variable/figtree";
import "../globals.css";

import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getDictionary } from "@/i18n";
import { isLocale, locales } from "@/i18n/config";
import { site, whatsappLink } from "@/lib/site";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const viewport: Viewport = {
  themeColor: "#FC5D00",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  return {
    metadataBase: new URL(site.url),
    title: { default: t.meta.title, template: `%s – ${site.name}` },
    description: t.meta.description,
    alternates: {
      canonical: `/${lang}`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}`])),
    },
    openGraph: {
      type: "website",
      siteName: site.name,
      title: t.meta.title,
      description: t.meta.description,
      url: `/${lang}`,
      images: [{ url: "/brand/og.jpg", width: 1200, height: 630 }],
      locale: lang,
    },
    twitter: { card: "summary_large_image", images: ["/brand/og.jpg"] },
    icons: { icon: "/icon.png", apple: "/apple-icon.png" },
  };
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);
  const orderHref = whatsappLink(t.whatsappMessages.order) || `/${lang}#contact`;

  return (
    <html lang={lang}>
      <body>
        <a className="skip-link" href="#main">
          {lang === "de" ? "Zum Inhalt springen" : lang === "fr" ? "Aller au contenu" : "Skip to content"}
        </a>
        <Header lang={lang} t={t.nav} orderHref={orderHref} />
        <main id="main">{children}</main>
        <Footer lang={lang} t={t} />
      </body>
    </html>
  );
}
