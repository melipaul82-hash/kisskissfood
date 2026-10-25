# Kiss Kiss Food – site vitrine et bot WhatsApp

Site de la marque Kiss Kiss Food (Stuttgart) : accueil en 3D, farine Cristal, gammes à venir,
vision restaurant, demande revendeur, Impressum et Datenschutz, en allemand, français et anglais.
Le même projet contient le webhook du bot WhatsApp (`/api/whatsapp`).

## Technique

- Next.js 15 (App Router), TypeScript, React Three Fiber pour la 3D
- Supabase pour les demandes du formulaire et les messages WhatsApp
- Hébergement Vercel, domaine `kisskissfood.site`

## Lancer en local

```bash
npm install
cp .env.example .env.local   # puis remplir les valeurs
npm run dev                  # http://localhost:3000
```

## Mise en ligne

1. **Supabase** (projet `kiss kiss`) : SQL Editor → coller et exécuter `supabase/migrations/0001_leads.sql`,
   puis `0002_whatsapp.sql`.
2. **Vercel** : importer ce dépôt, puis dans Settings → Environment Variables ajouter les clés de `.env.example`.
3. **Domaine** : Vercel → Settings → Domains → ajouter `kisskissfood.site` et `www.kisskissfood.site`,
   puis copier les enregistrements DNS indiqués chez le registrar du domaine.

## Ce qui reste à compléter

- `src/lib/site.ts` : forme juridique, USt-IdNr., téléphone, liens des réseaux sociaux.
- `NEXT_PUBLIC_WHATSAPP_NUMBER` : le numéro WhatsApp Business dédié, quand il existe.
  Tant qu'il est vide, les boutons « Commander » mènent à la section contact.
- Les demandes envoyées par le formulaire se lisent dans Supabase → Table Editor → `leads`.

Les maquettes d'emballage ne sont pas reproduites telles quelles : la boîte 3D et les étiquettes
n'affichent ni tableau nutritionnel, ni code-barres, ni allégation santé.
