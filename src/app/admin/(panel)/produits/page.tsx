import { serverClient } from "@/lib/supabase/server";
import { saveProduct } from "../../actions";

const LANGS = [
  ["de", "Allemand"],
  ["fr", "Français"],
  ["en", "Anglais"],
] as const;

type T = Record<string, string>;

export default async function ProductsPage() {
  const supabase = await serverClient();
  const { data: products } = await supabase.from("products").select("*").order("sort");

  return (
    <>
      <div className="page-head">
        <h1>Produits</h1>
        <p>
          Ce que vous changez ici s’affiche sur le site dans la section des gammes. Cochez « Disponible » quand un
          produit est en vente.
        </p>
      </div>
      <ul className="cards" role="list">
        {products?.map((p) => (
          <li key={p.key} className="card">
            <form action={saveProduct} className="stack">
              <input type="hidden" name="key" value={p.key} />
              <h2>{(p.name as T).fr || p.key}</h2>
              <div className="lang-grid">
                {LANGS.map(([l, label]) => (
                  <fieldset key={l}>
                    <legend>{label}</legend>
                    <label>
                      <span>Nom</span>
                      <input name={`name_${l}`} defaultValue={(p.name as T)[l] ?? ""} maxLength={80} />
                    </label>
                    <label>
                      <span>Description</span>
                      <textarea name={`desc_${l}`} defaultValue={(p.description as T)[l] ?? ""} maxLength={300} rows={2} />
                    </label>
                  </fieldset>
                ))}
              </div>
              <div className="row">
                <label className="check">
                  <input type="checkbox" name="available" defaultChecked={p.available} /> Disponible à la vente
                </label>
                <label className="check">
                  <input type="checkbox" name="visible" defaultChecked={p.visible} /> Affiché sur le site
                </label>
                <label className="small">
                  <span>Ordre</span>
                  <input name="sort" type="number" defaultValue={p.sort} min={0} max={9999} />
                </label>
                <button className="a-btn a-btn-primary">Enregistrer</button>
              </div>
            </form>
          </li>
        ))}
      </ul>
    </>
  );
}
