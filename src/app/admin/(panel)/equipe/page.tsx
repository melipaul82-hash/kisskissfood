import { serverClient } from "@/lib/supabase/server";
import { addAdmin, removeAdmin } from "../../actions";
import { ConfirmButton } from "../ConfirmButton";
import { SubmitButton } from "../SubmitButton";

export default async function TeamPage() {
  const supabase = await serverClient();
  const [{ data: admins }, { data: auth }] = await Promise.all([
    supabase.from("admin_emails").select("email, created_at").order("created_at"),
    supabase.auth.getUser(),
  ]);
  const me = auth.user?.email?.toLowerCase();

  return (
    <>
      <div className="page-head">
        <h1>Équipe</h1>
        <p>Les personnes qui peuvent entrer dans cet espace. Chacune a besoin d’un compte avec mot de passe dans Supabase.</p>
      </div>
      <section className="card">
        <ul className="mini-list" role="list">
          {admins?.map((a) => (
            <li key={a.email} className="row-between">
              <div>
                <strong>{a.email}</strong>
                <span className="muted">
                  {a.email === me ? "Vous" : "Administrateur"} · depuis le{" "}
                  {new Date(a.created_at).toLocaleDateString("fr-DE", { timeZone: "Europe/Berlin" })}
                </span>
              </div>
              {a.email !== me && (
                <form action={removeAdmin}>
                  <input type="hidden" name="email" value={a.email} />
                  <ConfirmButton message={`Retirer l’accès de ${a.email} ?`}>Retirer</ConfirmButton>
                </form>
              )}
            </li>
          ))}
        </ul>
      </section>
      <section className="card card-new">
        <form action={addAdmin} className="stack">
          <h2>Ajouter un administrateur</h2>
          <label>
            <span>Adresse e-mail</span>
            <input name="email" type="email" required autoComplete="off" />
          </label>
          <p className="muted">
            Ensuite, créez son mot de passe : Supabase → Authentication → Users → Add user → Create new user, avec «
            Auto Confirm User » coché.
          </p>
          <div className="row">
            <SubmitButton pending="Ajout…">Donner l’accès</SubmitButton>
          </div>
        </form>
      </section>
    </>
  );
}
