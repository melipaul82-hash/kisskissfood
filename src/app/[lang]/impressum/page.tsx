import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Impressum", robots: { index: true } };

export default async function Impressum({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);

  return (
    <article className="legal container">
      <h1 className="display-lg">Impressum</h1>
      {t.legal.germanOnly && <p className="legal-note">{t.legal.germanOnly}</p>}

      <h2>Angaben gemäß § 5 DDG</h2>
      <p>
        {site.name}
        {site.legalForm ? ` (${site.legalForm})` : ""}
        <br />
        Inhaber: {site.owner}
        <br />
        {site.street}
        <br />
        {site.postalCode} {site.city}
        <br />
        {site.country}
      </p>

      <h2>Kontakt</h2>
      <p>
        E-Mail: <a href={`mailto:${site.email}`}>{site.email}</a>
        {site.phone && (
          <>
            <br />
            Telefon: {site.phone}
          </>
        )}
      </p>

      {site.register && (
        <>
          <h2>Registereintrag</h2>
          <p>{site.register}</p>
        </>
      )}

      {site.vatId && (
        <>
          <h2>Umsatzsteuer-ID</h2>
          <p>Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: {site.vatId}</p>
        </>
      )}

      <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
      <p>
        {site.owner}, {site.street}, {site.postalCode} {site.city}
      </p>

      <h2>Verbraucherstreitbeilegung</h2>
      <p>
        Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
        Verbraucherschlichtungsstelle teilzunehmen.
      </p>

      <h2>Bildnachweis</h2>
      <p>Die Bilder des Restaurants sind Konzeptvisualisierungen. Das Restaurant ist noch nicht eröffnet.</p>

      <p>
        <Link href={`/${lang}`}>{t.legal.back}</Link>
      </p>
    </article>
  );
}
