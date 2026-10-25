import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Datenschutzerklärung" };

export default async function Datenschutz({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);

  return (
    <article className="legal container">
      <h1 className="display-lg">Datenschutzerklärung</h1>
      {t.legal.germanOnly && <p className="legal-note">{t.legal.germanOnly}</p>}

      <h2>1. Verantwortlicher</h2>
      <p>
        {site.name}, Inhaber {site.owner}, {site.street}, {site.postalCode} {site.city}, {site.country}. E-Mail:{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a>
      </p>

      <h2>2. Hosting</h2>
      <p>
        Diese Website wird bei Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA gehostet. Beim Aufruf
        der Seite verarbeitet Vercel technisch notwendige Daten wie IP-Adresse, Datum und Uhrzeit, aufgerufene
        Seite, Browser und Betriebssystem, um die Website auszuliefern und vor Angriffen zu schützen
        (Art. 6 Abs. 1 lit. f DSGVO). Mit Vercel besteht ein Auftragsverarbeitungsvertrag; Übermittlungen in die
        USA stützen sich auf das EU-US Data Privacy Framework bzw. Standardvertragsklauseln.
      </p>

      <h2>3. Keine Cookies, kein Tracking</h2>
      <p>
        Wir setzen keine Cookies zu Analyse- oder Werbezwecken und verwenden keine Tracking-Dienste. Schriftarten
        werden von unserem eigenen Server geladen; es werden keine Daten an Google Fonts übertragen.
      </p>

      <h2>4. Anfrageformular</h2>
      <p>
        Wenn du uns über das Formular schreibst, verarbeiten wir die von dir angegebenen Daten (Name, E-Mail,
        optional Telefon, Name und Ort des Geschäfts, Nachricht), um deine Anfrage zu beantworten
        (Art. 6 Abs. 1 lit. b und lit. a DSGVO). Die Daten werden in einer Datenbank von Supabase Inc. auf Servern
        in der EU (Irland) gespeichert. Wir löschen sie, sobald die Anfrage erledigt ist und keine gesetzlichen
        Aufbewahrungspflichten mehr bestehen, spätestens nach 24 Monaten ohne weiteren Kontakt.
      </p>

      <h2>5. Kontakt per E-Mail und WhatsApp</h2>
      <p>
        Schreibst du uns per E-Mail, verarbeiten wir deine Angaben zur Bearbeitung der Anfrage. Die WhatsApp-Buttons
        sind einfache Links: Erst wenn du sie anklickst, wirst du zu WhatsApp (WhatsApp Ireland Limited, Meta)
        weitergeleitet. Für die Verarbeitung dort gilt die Datenschutzerklärung von WhatsApp.
      </p>

      <h2>6. Deine Rechte</h2>
      <p>
        Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung,
        Datenübertragbarkeit und Widerspruch (Art. 15–21 DSGVO). Eine erteilte Einwilligung kannst du jederzeit
        mit Wirkung für die Zukunft widerrufen. Schreib dazu an <a href={`mailto:${site.email}`}>{site.email}</a>.
        Du kannst dich außerdem bei einer Datenschutz-Aufsichtsbehörde beschweren, zum Beispiel beim
        Landesbeauftragten für den Datenschutz und die Informationsfreiheit Baden-Württemberg.
      </p>

      <p className="fine">Stand: Oktober 2026</p>
      <p>
        <Link href={`/${lang}`}>{t.legal.back}</Link>
      </p>
    </article>
  );
}
