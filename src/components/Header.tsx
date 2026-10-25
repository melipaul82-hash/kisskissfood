"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { localeNames, locales, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";

type Props = { lang: Locale; t: Dictionary["nav"]; orderHref: string };

export function Header({ lang, t, orderHref }: Props) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname() || `/${lang}`;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const home = `/${lang}`;
  const links = [
    { href: `${home}#cristal`, label: t.cristal },
    { href: `${home}#marque`, label: t.brand },
    { href: `${home}#gammes`, label: t.ranges },
    { href: `${home}#restaurant`, label: t.restaurant },
    { href: `${home}#revendeurs`, label: t.resellers },
  ];
  const switchTo = (l: Locale) => pathname.replace(/^\/(de|fr|en)/, `/${l}`);
  const external = orderHref.startsWith("http");

  return (
    <header className={`site-header${scrolled ? " is-scrolled" : ""}${open ? " is-open" : ""}`}>
      <div className="header-inner">
        <Link href={home} className="header-logo" aria-label="Kiss Kiss Food" onClick={() => setOpen(false)}>
          <Image src="/brand/logo-sm.png" alt="" width={92} height={86} priority />
        </Link>

        <nav className="header-nav" aria-label="Navigation">
          {links.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <div className="lang-switch" aria-label={t.language}>
            {locales.map((l) => (
              <Link key={l} href={switchTo(l)} hrefLang={l} aria-current={l === lang ? "true" : undefined} title={localeNames[l]}>
                {l}
              </Link>
            ))}
          </div>
          <a
            className="btn btn-cocoa btn-small"
            href={orderHref}
            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          >
            {t.order}
          </a>
          <button
            className="menu-toggle"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((o) => !o)}
          >
            <span className="sr-only">{open ? t.close : t.menu}</span>
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>
      </div>

      <div id="mobile-menu" className="mobile-menu" hidden={!open}>
        <nav aria-label="Navigation mobile">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          <a href={`${home}#contact`} onClick={() => setOpen(false)}>
            {t.contact}
          </a>
        </nav>
        <div className="lang-switch lang-switch-large">
          {locales.map((l) => (
            <Link key={l} href={switchTo(l)} hrefLang={l} aria-current={l === lang ? "true" : undefined}>
              {localeNames[l]}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
