"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { serverClient } from "@/lib/supabase/server";

const LANGS = ["de", "fr", "en"] as const;
const str = (form: FormData, key: string, max = 500) => String(form.get(key) ?? "").trim().slice(0, max);
const i18n = (form: FormData, prefix: string, max: number) =>
  Object.fromEntries(LANGS.map((l) => [l, str(form, `${prefix}_${l}`, max)]));

/** Rebuild the public pages so a change in the admin shows up right away. */
function refreshSite() {
  revalidatePath("/[lang]", "page");
}

export type LoginState = { error?: string };

export async function login(_prev: LoginState, form: FormData): Promise<LoginState> {
  const email = str(form, "email", 254).toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!email || !password) return { error: "Entrez votre e-mail et votre mot de passe." };
  const supabase = await serverClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "E-mail ou mot de passe incorrect." };
  redirect("/admin");
}

export async function logout() {
  const supabase = await serverClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function setLeadStatus(form: FormData) {
  const id = str(form, "id", 60);
  const status = str(form, "status", 20);
  if (!["new", "in_progress", "done"].includes(status)) return;
  const supabase = await serverClient();
  await supabase.from("leads").update({ status }).eq("id", id);
  revalidatePath("/admin");
}

export async function deleteLead(form: FormData) {
  const supabase = await serverClient();
  await supabase.from("leads").delete().eq("id", str(form, "id", 60));
  revalidatePath("/admin");
}

export async function saveProduct(form: FormData) {
  const supabase = await serverClient();
  await supabase
    .from("products")
    .update({
      name: i18n(form, "name", 80),
      description: i18n(form, "desc", 300),
      available: form.get("available") === "on",
      visible: form.get("visible") === "on",
      sort: Number(str(form, "sort", 6)) || 100,
    })
    .eq("key", str(form, "key", 40));
  revalidatePath("/admin/produits");
  refreshSite();
}

export async function saveMenuItem(form: FormData) {
  const supabase = await serverClient();
  await supabase
    .from("menu_items")
    .update({
      name: str(form, "name", 80),
      description: i18n(form, "desc", 200),
      visible: form.get("visible") === "on",
      sort: Number(str(form, "sort", 6)) || 100,
    })
    .eq("key", str(form, "key", 40));
  revalidatePath("/admin/menu");
  refreshSite();
}

export async function addMenuItem(form: FormData) {
  const name = str(form, "name", 80);
  if (!name) return;
  const key =
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || `plat-${Date.now()}`;
  const supabase = await serverClient();
  await supabase.from("menu_items").insert({ key, name, description: i18n(form, "desc", 200), sort: 900 });
  revalidatePath("/admin/menu");
  refreshSite();
}

export async function deleteMenuItem(form: FormData) {
  const supabase = await serverClient();
  await supabase.from("menu_items").delete().eq("key", str(form, "key", 40));
  revalidatePath("/admin/menu");
  refreshSite();
}
