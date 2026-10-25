import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { serverClient } from "@/lib/supabase/server";
import { logout } from "../actions";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "Demandes" },
  { href: "/admin/produits", label: "Produits" },
  { href: "/admin/menu", label: "Menu restaurant" },
  { href: "/admin/whatsapp", label: "WhatsApp" },
];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const supabase = await serverClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  // The admin list is only readable by admins, so an empty answer means "not an admin".
  const { data: admins } = await supabase.from("admin_emails").select("email").limit(1);
  const isAdmin = !!admins?.length;

  return (
    <div className="panel">
      <header className="panel-head">
        <Link href="/admin" className="panel-brand">
          <Image src="/brand/logo-sm.png" alt="" width={44} height={43} />
          <span>Admin</span>
        </Link>
        {isAdmin && (
          <nav aria-label="Admin">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href}>
                {n.label}
              </Link>
            ))}
          </nav>
        )}
        <div className="panel-user">
          <span>{user.email}</span>
          <a href="/" target="_blank" rel="noopener noreferrer">
            Voir le site
          </a>
          <form action={logout}>
            <button className="a-btn a-btn-ghost">Se déconnecter</button>
          </form>
        </div>
      </header>
      <main className="panel-main">
        {isAdmin ? (
          children
        ) : (
          <div className="empty">
            <h1>Accès réservé</h1>
            <p>
              Le compte {user.email} n’a pas les droits d’administration. Demandez à être ajouté à la liste des
              administrateurs.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
