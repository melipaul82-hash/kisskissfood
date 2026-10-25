import { serverClient } from "@/lib/supabase/server";
import { SubmitButton } from "../SubmitButton";
import { ConfirmButton } from "../ConfirmButton";
import { addMenuItem, deleteMenuItem, saveMenuItem } from "../../actions";

const LANGS = [
  ["de", "Allemand"],
  ["fr", "Français"],
  ["en", "Anglais"],
] as const;

type T = Record<string, string>;

export default async function MenuPage() {
  const supabase = await serverClient();
  const { data: items } = await supabase.from("menu_items").select("*").order("sort");

  return (
    <>
      <div className="page-head">
        <h1>Menu du restaurant</h1>
        <p>Les plats du menu signature affichés dans la section restaurant du site.</p>
      </div>
      <ul className="cards" role="list">
        {items?.map((m) => (
          <li key={m.key} className="card">
            <form action={saveMenuItem} className="stack">
              <input type="hidden" name="key" value={m.key} />
              <label>
                <span>Nom du plat</span>
                <input name="name" defaultValue={m.name} maxLength={80} required />
              </label>
              <div className="lang-grid">
                {LANGS.map(([l, label]) => (
                  <label key={l}>
                    <span>Description ({label})</span>
                    <input name={`desc_${l}`} defaultValue={(m.description as T)[l] ?? ""} maxLength={200} />
                  </label>
                ))}
              </div>
              <div className="row">
                <label className="check">
                  <input type="checkbox" name="visible" defaultChecked={m.visible} /> Affiché sur le site
                </label>
                <label className="small">
                  <span>Ordre</span>
                  <input name="sort" type="number" defaultValue={m.sort} min={0} max={9999} />
                </label>
                <SubmitButton>Enregistrer</SubmitButton>
              </div>
            </form>
            <form action={deleteMenuItem} className="card-delete">
              <input type="hidden" name="key" value={m.key} />
              <ConfirmButton message="Supprimer ce plat du menu ?">Supprimer ce plat</ConfirmButton>
            </form>
          </li>
        ))}
        <li className="card card-new">
          <form action={addMenuItem} className="stack">
            <h2>Ajouter un plat</h2>
            <label>
              <span>Nom du plat</span>
              <input name="name" maxLength={80} required />
            </label>
            <div className="lang-grid">
              {LANGS.map(([l, label]) => (
                <label key={l}>
                  <span>Description ({label})</span>
                  <input name={`desc_${l}`} maxLength={200} />
                </label>
              ))}
            </div>
            <div className="row">
              <SubmitButton pending="Ajout…">Ajouter le plat</SubmitButton>
            </div>
          </form>
        </li>
      </ul>
    </>
  );
}
