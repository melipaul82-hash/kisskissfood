import Link from "next/link";
import { serverClient } from "@/lib/supabase/server";
import { deleteLead, setLeadStatus } from "../../actions";
import { ConfirmButton } from "../ConfirmButton";

const STATUS: Record<string, string> = { new: "Nouvelle", in_progress: "En cours", done: "Traitée" };
const KIND: Record<string, string> = { reseller: "Revendeur", contact: "Question" };
const FILTERS = [
  { key: "", label: "Toutes" },
  { key: "new", label: "Nouvelles" },
  { key: "in_progress", label: "En cours" },
  { key: "done", label: "Traitées" },
];

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ statut?: string; type?: string }> }) {
  const { statut = "", type = "" } = await searchParams;
  const supabase = await serverClient();

  let query = supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(300);
  if (STATUS[statut]) query = query.eq("status", statut);
  if (KIND[type]) query = query.eq("kind", type);
  const [{ data: leads, error }, counts] = await Promise.all([
    query,
    Promise.all(
      ["new", "in_progress", "done"].map((s) =>
        supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", s)
      )
    ),
  ]);
  const count: Record<string, number> = {
    new: counts[0].count ?? 0,
    in_progress: counts[1].count ?? 0,
    done: counts[2].count ?? 0,
  };
  count[""] = count.new + count.in_progress + count.done;
  const back = `/admin/demandes${statut || type ? `?${new URLSearchParams({ ...(statut && { statut }), ...(type && { type }) })}` : ""}`;
  const link = (s: string, t: string) => {
    const q = new URLSearchParams({ ...(s && { statut: s }), ...(t && { type: t }) }).toString();
    return `/admin/demandes${q ? `?${q}` : ""}`;
  };

  return (
    <>
      <div className="page-head">
        <h1>Demandes</h1>
        <p>Les messages envoyés par le formulaire du site. Répondez par e-mail ou téléphone, puis changez le statut.</p>
      </div>

      <div className="toolbar">
        <nav className="tabs" aria-label="Filtrer par statut">
          {FILTERS.map((f) => (
            <Link key={f.key} href={link(f.key, type)} className={statut === f.key ? "active" : undefined}>
              {f.label} <em>{count[f.key]}</em>
            </Link>
          ))}
        </nav>
        <nav className="tabs tabs-soft" aria-label="Filtrer par type">
          <Link href={link(statut, "")} className={!type ? "active" : undefined}>Tous types</Link>
          <Link href={link(statut, "reseller")} className={type === "reseller" ? "active" : undefined}>Revendeurs</Link>
          <Link href={link(statut, "contact")} className={type === "contact" ? "active" : undefined}>Questions</Link>
        </nav>
      </div>

      {error && <p className="form-error">Impossible de charger les demandes : {error.message}</p>}
      {!leads?.length ? (
        <div className="empty">
          <p>Aucune demande dans cette vue.</p>
        </div>
      ) : (
        <ul className="cards" role="list">
          {leads.map((l) => (
            <li key={l.id} className={`card lead lead-${l.status}`}>
              <div className="lead-top">
                <span className="tag">{KIND[l.kind] ?? l.kind}</span>
                <span className={`pill pill-${l.status}`}>{STATUS[l.status]}</span>
                <span className="tag tag-soft">{l.locale.toUpperCase()}</span>
                <time dateTime={l.created_at}>
                  {new Date(l.created_at).toLocaleString("fr-DE", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Berlin" })}
                </time>
              </div>
              <h2>
                {l.shop_name ? `${l.shop_name} · ` : ""}
                {l.name}
              </h2>
              <p className="lead-contact">
                <a href={`mailto:${l.email}?subject=${encodeURIComponent("Kiss Kiss Food – votre demande")}`}>{l.email}</a>
                {l.phone && <a href={`tel:${l.phone.replace(/\s/g, "")}`}>{l.phone}</a>}
                {l.phone && (
                  <a href={`https://wa.me/${l.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                    WhatsApp
                  </a>
                )}
                {l.city && <span>{l.city}</span>}
                {l.volume && <span>Volume : {l.volume}</span>}
              </p>
              {l.message && <p className="lead-msg">{l.message}</p>}
              <div className="lead-actions">
                <form action={setLeadStatus} className="inline">
                  <input type="hidden" name="id" value={l.id} />
                  <input type="hidden" name="back" value={back} />
                  {Object.entries(STATUS)
                    .filter(([v]) => v !== l.status)
                    .map(([v, label]) => (
                      <button key={v} name="status" value={v} className="a-btn a-btn-ghost">
                        Marquer « {label} »
                      </button>
                    ))}
                </form>
                <form action={deleteLead}>
                  <input type="hidden" name="id" value={l.id} />
                  <input type="hidden" name="back" value={back} />
                  <ConfirmButton message="Supprimer définitivement cette demande ?">Supprimer</ConfirmButton>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
