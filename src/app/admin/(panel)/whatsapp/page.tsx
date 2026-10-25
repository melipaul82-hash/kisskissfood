import { serverClient } from "@/lib/supabase/server";

export default async function WhatsAppPage() {
  const supabase = await serverClient();
  const [{ data: contacts }, { data: messages }] = await Promise.all([
    supabase.from("wa_contacts").select("*").order("last_seen", { ascending: false }).limit(50),
    supabase.from("wa_messages").select("*").order("created_at", { ascending: false }).limit(500),
  ]);

  return (
    <>
      <div className="page-head">
        <h1>Messages WhatsApp</h1>
        <p>Les conversations reçues par le bot WhatsApp, une fois l’API Meta connectée au site.</p>
      </div>
      {!contacts?.length ? (
        <div className="empty">
          <p>
            Aucun message pour l’instant. Ils arriveront ici quand le numéro WhatsApp Business sera relié au site
            (adresse du webhook : <code>https://kisskissfood.org/api/whatsapp</code>).
          </p>
        </div>
      ) : (
        <ul className="cards" role="list">
          {contacts.map((c) => {
            const thread = (messages ?? []).filter((m) => m.wa_id === c.wa_id).slice(0, 20).reverse();
            return (
              <li key={c.wa_id} className="card">
                <h2>
                  {c.name || "Client"} · <a href={`https://wa.me/${c.wa_id}`}>+{c.wa_id}</a>
                </h2>
                <ol className="thread" role="list">
                  {thread.map((m) => (
                    <li key={m.id} className={`bubble bubble-${m.direction}`}>
                      <span>{m.body || `[${m.type}]`}</span>
                      <time dateTime={m.created_at}>
                        {new Date(m.created_at).toLocaleString("fr-DE", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Berlin" })}
                      </time>
                    </li>
                  ))}
                </ol>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
