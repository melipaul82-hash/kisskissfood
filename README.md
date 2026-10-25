# Kiss Kiss Food – site vitrine et bot WhatsApp

Site de la marque Kiss Kiss Food (Stuttgart) : accueil en 3D, farine Cristal, gammes à venir,
vision restaurant, demande revendeur, Impressum et Datenschutz, en allemand, français et anglais.
Le même projet contient le webhook du bot WhatsApp (`/api/whatsapp`).

## Technique

- Next.js 15 (App Router), TypeScript, React Three Fiber pour la 3D
- Supabase pour les demandes du formulaire et les messages WhatsApp
- Hébergement Vercel, domaine `kisskissfood.org`

## Lancer en local

```bash
npm install
cp .env.example .env.local   # puis remplir les valeurs
npm run dev                  # http://localhost:3000
```

## Supabase (projet « kiss kiss »)

La base est déjà créée. Le schéma de référence est dans `supabase/migrations/`.

- `products` et `menu_items` : textes affichés sur le site, modifiables dans `/admin`.
- `leads` : demandes envoyées par le formulaire.
- `admin_emails` : e-mails autorisés dans `/admin`.
- `wa_contacts`, `wa_messages` : messages WhatsApp reçus par le bot.

Toutes les tables ont la sécurité RLS activée : la clé publique peut lire les produits et le menu, et envoyer une demande. Rien d'autre.

## Espace admin

`https://kisskissfood.org/admin`, connexion par e-mail et mot de passe.
Pour créer un accès : Supabase → Authentication → Users → Add user → Create new user (cocher « Auto Confirm User »),
avec un e-mail présent dans la table `admin_emails`. Pour ajouter un administrateur :

```sql
insert into public.admin_emails (email) values ('prenom@exemple.com');
```

## Mise en ligne

Vercel (compte de Kiss Kiss Food) déploie automatiquement à chaque envoi sur la branche `main`.
Les variables d'environnement sont listées dans `.env.example`.

## Ce qui reste à compléter

- `src/lib/site.ts` : forme juridique et USt-IdNr. pour l'Impressum.
- Pour le bot : `SUPABASE_SERVICE_ROLE_KEY`, `WHATSAPP_VERIFY_TOKEN`, `WHATSAPP_APP_SECRET` dans Vercel.

Les emballages et produits en 3D sont dessinés dans le code avec le vrai logo : ni tableau nutritionnel,
ni code-barres, ni allégation santé.
