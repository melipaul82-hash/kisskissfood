"use server";

import { createClient } from "@supabase/supabase-js";
import { isLocale } from "@/i18n/config";

export type LeadState = { status: "idle" | "success" | "error" | "invalid" };

const text = (form: FormData, key: string, max: number) =>
  String(form.get(key) ?? "").trim().slice(0, max);

export async function submitLead(_prev: LeadState, form: FormData): Promise<LeadState> {
  // Honeypot: real people never fill this hidden field.
  if (text(form, "website", 200)) return { status: "success" };

  const kind = form.get("kind") === "contact" ? "contact" : "reseller";
  const localeRaw = text(form, "locale", 2);
  const lead = {
    kind,
    locale: isLocale(localeRaw) ? localeRaw : "de",
    shop_name: text(form, "shop", 160) || null,
    name: text(form, "name", 160),
    city: text(form, "city", 120) || null,
    email: text(form, "email", 254),
    phone: text(form, "phone", 40) || null,
    volume: text(form, "volume", 120) || null,
    message: text(form, "message", 4000) || null,
    consent: form.get("consent") === "on",
  };

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email);
  if (!lead.name || !emailOk || !lead.consent || (kind === "reseller" && !lead.shop_name)) {
    return { status: "invalid" };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.error("Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY");
    return { status: "error" };
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { error } = await supabase.from("leads").insert(lead);
  if (error) {
    console.error("Lead insert failed", error.message);
    return { status: "error" };
  }
  return { status: "success" };
}
