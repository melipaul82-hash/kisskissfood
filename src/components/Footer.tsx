import Image from "next/image";
import Link from "next/link";
import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import { site } from "@/lib/site";
import { Socials } from "./Socials";

export function Footer({ lang, t }: { lang: Locale; t: Dictionary }) {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Image src="/brand/logo-sm.png" alt="Kiss Kiss Food" width={120} height={112} />
          <p>{t.footer.tagline}</p>
          <Socials />
        </div>
        <address className="footer-address">
          <strong>{site.name}</strong>
          <span>{site.street}</span>
          <span>
            {site.postalCode} {site.city}
          </span>
          <a href={`tel:${site.phone.replace(/\s/g, "")}`}>{site.phone}</a>
          <a href={`mailto:${site.email}`}>{site.email}</a>
        </address>
        <nav className="footer-links" aria-label={t.footer.legal}>
          <Link href={`/${lang}/impressum`}>{t.footer.legal}</Link>
          <Link href={`/${lang}/datenschutz`}>{t.footer.privacy}</Link>
          <a href={`/${lang}#contact`}>{t.nav.contact}</a>
        </nav>
      </div>
      <div className="container footer-bottom">
        <span>
          © {new Date().getFullYear()} {site.name}. {t.footer.rights}
        </span>
        <span className="footer-slogan">« Le goût qui vous fait craquer ! »</span>
      </div>
    </footer>
  );
}
