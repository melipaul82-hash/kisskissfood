import { serverClient } from "@/lib/supabase/server";
import { deleteLead, setLeadStatus } from "../actions";

const STATUS: Record<string, string> = { new: "Nouvelle", in_progress: "En cours", done: "Traitée" };
const KIND: Record<string, string> = { reseller: "Revendeur", contact: "Question" };

export default async function LeadsPage() {
  const supabase = await serverClient();
  const { data: leads, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <>
      <div className="page-head">
        <h1>Demandes reçues</h1>
        <p>Les messages envoyés par le formulaire du site, les plus récents en premier.</p>
      </div>
      {error && <p className="form-error">Impossible de charger les demandes : {error.message}</p>}
      {!leads?.length ? (
        <div className="empty">
          <p>Aucune demande pour l’instant. Elles apparaîtront ici dès qu’un visiteur remplit le formulaire.</p>
        </div>
      ) : (
        <ul className="cards" role="list">
          {leads.map((l) => (
            <li key={l.id} className={`card lead lead-${l.status}`}>
              <div className="lead-top">
                <span className="tag">{KIND[l.kind] ?? l.kind}</span>
                <span className="tag tag-soft">{l.locale.toUpperCase()}</span>
                <time dateTime={l.created_at}>
                  {new Date(l.created_at).toLocaleString("fr-DE", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Berlin" })}
                </time>
              </div>
              <h2>
                {l.name}
                {l.shop_name ? ` · ${l.shop_name}` : ""}
              </h2>
              <p className="lead-contact">
                <a href={`mailto:${l.email}`}>{l.email}</a>
                {l.phone && <a href={`tel:${l.phone}`}>{l.phone}</a>}
                {l.city && <span>{l.city}</span>}
                {l.volume && <span>Volume : {l.volume}</span>}
              </p>
              {l.message && <p className="lead-msg">{l.message}</p>}
              <div className="lead-actions">
                <form action={setLeadStatus} className="inline">
                  <input type="hidden" name="id" value={l.id} />
                  <label>
                    <span className="sr-only">Statut</span>
                    <select name="status" defaultValue={l.status}>
                      {Object.entries(STATUS).map(([v, label]) => (
                        <option key={v} value={v}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button className="a-btn a-btn-ghost">Mettre à jour</button>
                </form>
                <form action={deleteLead}>
                  <input type="hidden" name="id" value={l.id} />
                  <button className="a-btn a-btn-danger">Supprimer</button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
