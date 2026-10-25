import { Fragment } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { HeroSceneLoader } from "@/components/HeroSceneLoader";
import { LeadForm } from "@/components/LeadForm";
import { LogoStory } from "@/components/LogoStory";
import { RangeShelfLoader } from "@/components/RangeShelfLoader";
import { getDictionary } from "@/i18n";
import { isLocale } from "@/i18n/config";
import { site, whatsappLink } from "@/lib/site";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);

  const orderLink = whatsappLink(t.whatsappMessages.order);
  const generalLink = whatsappLink(t.whatsappMessages.general);
  const orderHref = orderLink || "#contact";
  const ext = (href: string | null) => (href ? { target: "_blank", rel: "noopener noreferrer" } : {});

  const words = t.hero.title.split(" ");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FoodEstablishment",
    name: site.name,
    url: site.url,
    email: site.email,
    logo: `${site.url}/brand/logo.png`,
    slogan: "Le goût qui vous fait craquer !",
    address: {
      "@type": "PostalAddress",
      streetAddress: site.street,
      postalCode: site.postalCode,
      addressLocality: site.city,
      addressCountry: "DE",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-glow" aria-hidden="true" />
        <HeroSceneLoader label={t.scene.label} />
        <div className="container hero-content">
          <p className="hero-kicker">{t.hero.kicker}</p>
          <h1 id="hero-title" className="hero-title">
            {words.map((w, i) => (
              <Fragment key={i}>
                <span className="hero-word" style={{ animationDelay: `${120 + i * 90}ms` }}>
                  {w}
                </span>
                {i < words.length - 1 ? (/^[!?:;]$/.test(words[i + 1]) ? " " : " ") : null}
              </Fragment>
            ))}
          </h1>
          <p className="hero-lead">{t.hero.lead}</p>
          <div className="hero-ctas">
            <a className="btn btn-cocoa" href={orderHref} {...ext(orderLink)}>
              <WhatsAppIcon />
              {t.hero.primary}
            </a>
            <a className="btn btn-ghost-light" href="#cristal">
              {t.hero.secondary}
            </a>
          </div>
        </div>
        <a className="hero-scroll" href="#cristal" aria-label={t.hero.scroll}>
          <span aria-hidden="true" />
        </a>
      </section>

      {/* Cristal */}
      <section id="cristal" className="section section-dough" aria-labelledby="cristal-title">
        <div className="container cristal">
          <figure className="cristal-photo">
            <Image
              src="/brand/beignets.jpg"
              alt={t.cristal.imageAlt}
              width={1200}
              height={798}
              sizes="(max-width: 900px) 100vw, 55vw"
            />
          </figure>
          <div className="cristal-text">
            <h2 id="cristal-title" className="display-xl">
              {t.cristal.title}
            </h2>
            <p className="lead-strong">{t.cristal.subtitle}</p>
            <p>{t.cristal.body}</p>
            <h3 className="mini-title">{t.cristal.usesTitle}</h3>
            <ul className="chips" role="list">
              {t.cristal.uses.map((u) => (
                <li key={u}>{u}</li>
              ))}
            </ul>
            <dl className="facts">
              <div>
                <dt className="sr-only">Format</dt>
                <dd>{t.cristal.format}</dd>
              </div>
              <div>
                <dt className="sr-only">Origine</dt>
                <dd>{t.cristal.origin}</dd>
              </div>
            </dl>
            <a className="btn btn-orange" href={orderHref} {...ext(orderLink)}>
              {t.cristal.order}
            </a>
            <p className="fine">{t.cristal.legalNote}</p>
          </div>
        </div>
      </section>

      {/* Brand */}
      <section id="marque" className="section section-butter" aria-labelledby="brand-title">
        <div className="container">
          <div className="section-head">
            <h2 id="brand-title" className="display-lg">
              {t.brand.title}
            </h2>
            <p>{t.brand.body}</p>
          </div>
          <LogoStory items={t.brand.items} />
          <ul className="values" role="list">
            {t.brand.values.map((v) => (
              <li key={v.name}>
                <strong>{v.name}</strong>
                <span>{v.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Ranges */}
      <section id="gammes" className="section section-roast" aria-labelledby="ranges-title">
        <div className="container">
          <div className="section-head section-head-light">
            <h2 id="ranges-title" className="display-lg">
              {t.ranges.title}
            </h2>
            <p>{t.ranges.body}</p>
          </div>
          <div className="shelf">
            <RangeShelfLoader
              label={t.scene.shelf}
              names={{
                cristal: t.ranges.items[0].name,
                spices: t.ranges.items[1].name,
                chips: t.ranges.items[2].name,
                drinks: t.ranges.items[3].name,
              }}
            />
            <p className="shelf-hint">{t.scene.shelfHint}</p>
          </div>
          <ul className="ranges" role="list">
            {t.ranges.items.map((r) => (
              <li key={r.key} className={`range range-${r.key}`}>
                <span className={`badge ${r.available ? "badge-live" : ""}`}>
                  {r.available ? t.ranges.available : t.ranges.soon}
                </span>
                <h3>{r.name}</h3>
                <p>{r.text}</p>
              </li>
            ))}
          </ul>
          <p className="ranges-ask">
            <a href="#contact">{t.ranges.ask}</a>
          </p>
        </div>
      </section>

      {/* Restaurant */}
      <section id="restaurant" className="section section-dough" aria-labelledby="restaurant-title">
        <div className="container">
          <div className="section-head">
            <h2 id="restaurant-title" className="display-lg">
              {t.restaurant.title}
            </h2>
            <p>{t.restaurant.body}</p>
          </div>
          <div className="resto-gallery">
            <figure className="resto-main">
              <Image
                src="/brand/concept-restaurant.jpg"
                alt={t.restaurant.altInterior}
                width={1376}
                height={768}
                sizes="(max-width: 900px) 100vw, 64vw"
              />
            </figure>
            <figure className="resto-side">
              <Image
                src="/brand/concept-borne.jpg"
                alt={t.restaurant.altKiosk}
                width={1400}
                height={781}
                sizes="(max-width: 900px) 100vw, 34vw"
              />
            </figure>
            <div className="menu-board">
              <h3>{t.restaurant.menuTitle}</h3>
              <ul role="list">
                {t.restaurant.menu.map((m) => (
                  <li key={m.name}>
                    <strong>{m.name}</strong>
                    <span>{m.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="concept-note">{t.restaurant.concept}</p>

          <h3 className="mini-title">{t.restaurant.stepsTitle}</h3>
          <ol className="steps">
            {t.restaurant.steps.map((s, i) => (
              <li key={s.name}>
                <span className="step-num" aria-hidden="true">
                  {i + 1}
                </span>
                <strong>{s.name}</strong>
                <span>{s.text}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Where to find us */}
      <section id="trouver" className="section section-orange" aria-labelledby="find-title">
        <div className="container find">
          <h2 id="find-title" className="display-lg">
            {t.find.title}
          </h2>
          <ul className="find-list" role="list">
            {[t.find.online, t.find.markets, t.find.shops].map((f) => (
              <li key={f.name}>
                <h3>{f.name}</h3>
                <p>{f.text}</p>
              </li>
            ))}
          </ul>
          <p className="find-base">
            <span>{t.find.base}</span>
            <strong>
              {site.street}, {site.postalCode} {site.city}
            </strong>
          </p>
        </div>
      </section>

      {/* Resellers + contact */}
      <section id="revendeurs" className="section section-dough" aria-labelledby="resellers-title">
        <div className="container resellers">
          <div className="resellers-text">
            <h2 id="resellers-title" className="display-lg">
              {t.resellers.title}
            </h2>
            <p>{t.resellers.body}</p>
            <ul className="perks" role="list">
              {t.resellers.perks.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>

            <div id="contact" className="contact-box">
              <h3>{t.contact.title}</h3>
              <p>{t.contact.body}</p>
              <div className="contact-actions">
                {generalLink ? (
                  <a className="btn btn-orange" href={generalLink} target="_blank" rel="noopener noreferrer">
                    <WhatsAppIcon />
                    {t.contact.whatsapp}
                  </a>
                ) : null}
                <a className="btn btn-outline" href={`mailto:${site.email}`}>
                  {t.contact.email}
                </a>
              </div>
              {!generalLink && <p className="fine">{t.contact.whatsappSoon}</p>}
            </div>
          </div>
          <LeadForm lang={lang} t={t.resellers.form} email={site.email} />
        </div>
      </section>
    </>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.6-.3z" />
    </svg>
  );
}
