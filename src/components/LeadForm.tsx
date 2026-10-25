"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { submitLead, type LeadState } from "@/app/actions";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n";

type Props = { lang: Locale; t: Dictionary["resellers"]["form"]; email: string };

export function LeadForm({ lang, t, email }: Props) {
  const [state, action, pending] = useActionState<LeadState, FormData>(submitLead, { status: "idle" });
  const [kind, setKind] = useState<"reseller" | "contact">("reseller");

  if (state.status === "success") {
    return (
      <div className="form-card form-done" role="status">
        <p>{t.success}</p>
      </div>
    );
  }

  return (
    <form className="form-card" action={action} noValidate={false}>
      <h3 className="form-title">{t.title}</h3>

      <fieldset className="segmented">
        <legend className="sr-only">{t.title}</legend>
        <label>
          <input type="radio" name="kind" value="reseller" checked={kind === "reseller"} onChange={() => setKind("reseller")} />
          <span>{t.typeReseller}</span>
        </label>
        <label>
          <input type="radio" name="kind" value="contact" checked={kind === "contact"} onChange={() => setKind("contact")} />
          <span>{t.typeContact}</span>
        </label>
      </fieldset>

      <input type="hidden" name="locale" value={lang} />
      <div className="hp" aria-hidden="true">
        <label>
          Website <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="form-grid">
        {kind === "reseller" && (
          <label className="field">
            <span>{t.shop} *</span>
            <input name="shop" required maxLength={160} autoComplete="organization" />
          </label>
        )}
        <label className="field">
          <span>{t.name} *</span>
          <input name="name" required maxLength={160} autoComplete="name" />
        </label>
        <label className="field">
          <span>{t.email} *</span>
          <input name="email" type="email" required maxLength={254} autoComplete="email" />
        </label>
        <label className="field">
          <span>{t.phone}</span>
          <input name="phone" type="tel" maxLength={40} autoComplete="tel" />
        </label>
        {kind === "reseller" && (
          <>
            <label className="field">
              <span>{t.city}</span>
              <input name="city" maxLength={120} autoComplete="address-level2" />
            </label>
            <label className="field">
              <span>{t.volume}</span>
              <input name="volume" maxLength={120} />
            </label>
          </>
        )}
        <label className="field field-wide">
          <span>{t.message}</span>
          <textarea name="message" rows={4} maxLength={4000} />
        </label>
      </div>

      <label className="consent">
        <input type="checkbox" name="consent" required />
        <span>
          {t.consent} <Link href={`/${lang}/datenschutz`}>{t.privacy}</Link>
        </span>
      </label>

      {state.status === "invalid" && (
        <p className="form-msg form-msg-error" role="alert">
          {t.required}
        </p>
      )}
      {state.status === "error" && (
        <p className="form-msg form-msg-error" role="alert">
          {t.error} <a href={`mailto:${email}`}>{email}</a>
        </p>
      )}

      <button className="btn btn-orange" type="submit" disabled={pending}>
        {pending ? t.sending : t.submit}
      </button>
    </form>
  );
}
