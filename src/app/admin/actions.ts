"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { serverClient } from "@/lib/supabase/server";

const LANGS = ["de", "fr", "en"] as const;
const str = (form: FormData, key: string, max = 500) => String(form.get(key) ?? "").trim().slice(0, max);
const i18n = (form: FormData, prefix: string, max: number) =>
  Object.fromEntries(LANGS.map((l) => [l, str(form, `${prefix}_${l}`, max)]));

/** Rebuild the public pages so a change in the admin shows up on the site right away. */
function refreshSite() {
  revalidatePath("/[lang]", "page");
}

/** Every action ends here: back to the page with a message the admin can read. */
function done(path: string, ok: string | null, err?: string): never {
  const q = new URLSearchParams(err ? { err } : { ok: ok ?? "Enregistré." });
  revalidatePath(path);
  redirect(`${path}?${q.toString()}`);
}

/** Supabase answers "no error" when RLS blocks a write, so we also check that a row really changed. */
function check(path: string, error: { message: string } | null, rows: unknown[] | null, ok: string) {
  if (error) done(path, null, `Supabase a refusé l’opération : ${error.message}`);
  if (!rows?.length) done(path, null, "Rien n’a été modifié. Votre compte n’a peut-être pas les droits nécessaires.");
  done(path, ok);
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

export type PasswordState = { error?: string; ok?: string };

export async function changePassword(_prev: PasswordState, form: FormData): Promise<PasswordState> {
  const password = String(form.get("password") ?? "");
  const confirm = String(form.get("confirm") ?? "");
  if (password.length < 10) return { error: "Le mot de passe doit faire au moins 10 caractères." };
  if (password !== confirm) return { error: "Les deux mots de passe ne sont pas identiques." };
  const supabase = await serverClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: `Supabase a refusé le changement : ${error.message}` };
  return { ok: "Mot de passe modifié." };
}

/* ---------- Requests ---------- */

export async function setLeadStatus(form: FormData) {
  const back = str(form, "back", 200) || "/admin/demandes";
  const status = str(form, "status", 20);
  if (!["new", "in_progress", "done"].includes(status)) done(back, null, "Statut inconnu.");
  const supabase = await serverClient();
  const { data, error } = await supabase.from("leads").update({ status }).eq("id", str(form, "id", 60)).select("id");
  revalidatePath("/admin");
  check(back, error, data, "Statut mis à jour.");
}

export async function deleteLead(form: FormData) {
  const back = str(form, "back", 200) || "/admin/demandes";
  const supabase = await serverClient();
  const { data, error } = await supabase.from("leads").delete().eq("id", str(form, "id", 60)).select("id");
  revalidatePath("/admin");
  check(back, error, data, "Demande supprimée.");
}

/* ---------- Products ---------- */

export async function saveProduct(form: FormData) {
  const supabase = await serverClient();
  const { data, error } = await supabase
    .from("products")
    .update({
      name: i18n(form, "name", 80),
      description: i18n(form, "desc", 300),
      available: form.get("available") === "on",
      visible: form.get("visible") === "on",
      sort: Number(str(form, "sort", 6)) || 100,
    })
    .eq("key", str(form, "key", 40))
    .select("key");
  refreshSite();
  check("/admin/produits", error, data, "Produit enregistré. Le site est à jour.");
}

/* ---------- Menu ---------- */

export async function saveMenuItem(form: FormData) {
  const name = str(form, "name", 80);
  if (!name) done("/admin/menu", null, "Le nom du plat est obligatoire.");
  const supabase = await serverClient();
  const { data, error } = await supabase
    .from("menu_items")
    .update({
      name,
      description: i18n(form, "desc", 200),
      visible: form.get("visible") === "on",
      sort: Number(str(form, "sort", 6)) || 100,
    })
    .eq("key", str(form, "key", 40))
    .select("key");
  refreshSite();
  check("/admin/menu", error, data, "Plat enregistré. Le site est à jour.");
}

export async function addMenuItem(form: FormData) {
  const name = str(form, "name", 80);
  if (!name) done("/admin/menu", null, "Le nom du plat est obligatoire.");
  const base =
    name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 32) || "plat";
  const key = `${base}-${Date.now().toString(36).slice(-5)}`;
  const supabase = await serverClient();
  const { data, error } = await supabase
    .from("menu_items")
    .insert({ key, name, description: i18n(form, "desc", 200), sort: 900 })
    .select("key");
  refreshSite();
  check("/admin/menu", error, data, `« ${name} » ajouté au menu.`);
}

export async function deleteMenuItem(form: FormData) {
  const supabase = await serverClient();
  const { data, error } = await supabase.from("menu_items").delete().eq("key", str(form, "key", 40)).select("key");
  refreshSite();
  check("/admin/menu", error, data, "Plat supprimé du menu.");
}

/* ---------- Team ---------- */

export async function addAdmin(form: FormData) {
  const email = str(form, "email", 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) done("/admin/equipe", null, "Adresse e-mail invalide.");
  const supabase = await serverClient();
  const { data, error } = await supabase.from("admin_emails").insert({ email }).select("email");
  if (error?.code === "23505") done("/admin/equipe", null, "Cette adresse est déjà administratrice.");
  check(
    "/admin/equipe",
    error,
    data,
    `${email} est administrateur. Créez-lui un mot de passe dans Supabase → Authentication → Add user.`
  );
}

export async function removeAdmin(form: FormData) {
  const supabase = await serverClient();
  const { data, error } = await supabase
    .from("admin_emails")
    .delete()
    .eq("email", str(form, "email", 254))
    .select("email");
  check("/admin/equipe", error, data, "Accès retiré.");
}
