import type { Dictionary } from "@/i18n";
import type { Locale } from "@/i18n/config";
import { publicClient } from "./supabase/public";

export type Product = { key: string; name: string; text: string; available: boolean };
export type MenuItem = { name: string; text: string };

type I18nText = Partial<Record<Locale, string>>;
const pick = (v: I18nText | null | undefined, lang: Locale, fallback = "") =>
  v?.[lang] || v?.fr || v?.de || v?.en || fallback;

/**
 * Products and menu come from Supabase, so they can be changed in /admin without touching the code.
 * If the database cannot be reached, the texts built into the site are used instead.
 */
export async function getProducts(lang: Locale, t: Dictionary): Promise<Product[]> {
  try {
    const { data, error } = await publicClient()
      .from("products")
      .select("key, name, description, available, sort")
      .eq("visible", true)
      .order("sort");
    if (error || !data?.length) throw error || new Error("empty");
    return data.map((p) => ({
      key: p.key,
      name: pick(p.name as I18nText, lang, p.key),
      text: pick(p.description as I18nText, lang),
      available: p.available,
    }));
  } catch {
    return t.ranges.items.map((r) => ({ key: r.key, name: r.name, text: r.text, available: r.available }));
  }
}

export async function getMenu(lang: Locale, t: Dictionary): Promise<MenuItem[]> {
  try {
    const { data, error } = await publicClient()
      .from("menu_items")
      .select("name, description, sort")
      .eq("visible", true)
      .order("sort");
    if (error || !data?.length) throw error || new Error("empty");
    return data.map((m) => ({ name: m.name, text: pick(m.description as I18nText, lang) }));
  } catch {
    return t.restaurant.menu.map((m) => ({ name: m.name, text: m.text }));
  }
}
