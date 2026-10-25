import Link from "next/link";
import { serverClient } from "@/lib/supabase/server";

const fmt = (d: string) =>
  new Date(d).toLocaleString("fr-DE", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Berlin" });

export default async function Overview() {
  const supabase = await serverClient();
  const since = new Date(Date.now() - 7 * 864e5).toISOString();
  const head = { count: "exact" as const, head: true };
  const [newL, weekL, allL, prods, menu, wa, recent] = await Promise.all([
    supabase.from("leads").select("id", head).eq("status", "new"),
    supabase.from("leads").select("id", head).gte("created_at", since),
    supabase.from("leads").select("id", head),
    supabase.from("products").select("key, name, available, visible").order("sort"),
    supabase.from("menu_items").select("key", head).eq("visible", true),
    supabase.from("wa_contacts").select("wa_id", head),
    supabase.from("leads").select("id, created_at, kind, name, shop_name, status").order("created_at", { ascending: false }).limit(5),
  ]);
  const products = prods.data ?? [];
  const onSale = products.filter((p) => p.available).length;

  const stats = [
    { label: "Demandes à traiter", value: newL.count ?? 0, href: "/admin/demandes?statut=new", hot: (newL.count ?? 0) > 0 },
    { label: "Demandes cette semaine", value: weekL.count ?? 0, href: "/admin/demandes" },
    { label: "Produits en vente", value: `${onSale} / ${products.length}`, href: "/admin/produits" },
    { label: "Plats au menu", value: menu.count ?? 0, href: "/admin/menu" },
    { label: "Clients WhatsApp", value: wa.count ?? 0, href: "/admin/whatsapp" },
  ];

  return (
    <>
      <div className="page-head">
        <h1>Tableau de bord</h1>
        <p>Les chiffres viennent directement de la base Supabase de Kiss Kiss Food.</p>
      </div>

      <ul className="stats" role="list">
        {stats.map((s) => (
          <li key={s.label}>
            <Link href={s.href} className={`stat ${s.hot ? "stat-hot" : ""}`}>
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="grid-2">
        <section className="card">
          <div className="card-head">
            <h2>Dernières demandes</h2>
            <Link href="/admin/demandes">Tout voir</Link>
          </div>
          {!recent.data?.length ? (
            <p className="muted">Aucune demande pour l’instant. Elles arrivent ici dès qu’un visiteur remplit le formulaire du site.</p>
          ) : (
            <ul className="mini-list" role="list">
              {recent.data.map((l) => (
                <li key={l.id}>
                  <span className={`dot dot-${l.status}`} aria-hidden="true" />
                  <div>
                    <strong>{l.shop_name || l.name}</strong>
                    <span className="muted">
                      {l.kind === "reseller" ? "Revendeur" : "Question"} · {fmt(l.created_at)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <p className="muted small-note">Total depuis le lancement : {allL.count ?? 0}</p>
        </section>

        <section className="card">
          <div className="card-head">
            <h2>Gamme sur le site</h2>
            <Link href="/admin/produits">Modifier</Link>
          </div>
          <ul className="mini-list" role="list">
            {products.map((p) => (
              <li key={p.key}>
                <span className={`dot ${p.available ? "dot-done" : "dot-wait"}`} aria-hidden="true" />
                <div>
                  <strong>{(p.name as Record<string, string>).fr}</strong>
                  <span className="muted">
                    {!p.visible ? "Masqué du site" : p.available ? "Disponible" : "Bientôt"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
