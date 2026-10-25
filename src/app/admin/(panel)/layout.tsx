import Image from "next/image";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { serverClient } from "@/lib/supabase/server";
import { logout } from "../actions";
import { Flash } from "./Flash";
import { SideNav } from "./SideNav";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const supabase = await serverClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  // The admin list is only readable by admins, so an empty answer means "not an admin".
  const [{ data: admins }, { count: newLeads }] = await Promise.all([
    supabase.from("admin_emails").select("email").limit(1),
    supabase.from("leads").select("id", { count: "exact", head: true }).eq("status", "new"),
  ]);
  const isAdmin = !!admins?.length;

  return (
    <div className="shell">
      <aside className="side">
        <div className="side-brand">
          <Image src="/brand/logo-sm.png" alt="" width={48} height={47} />
          <div>
            <strong>Kiss Kiss Food</strong>
            <span>Administration</span>
          </div>
        </div>
        {isAdmin && <SideNav newLeads={newLeads ?? 0} />}
        <div className="side-foot">
          <a className="side-link" href="/" target="_blank" rel="noopener noreferrer">
            Voir le site
          </a>
          <span className="side-user" title={user.email}>
            {user.email}
          </span>
          <form action={logout}>
            <button className="a-btn a-btn-ghost a-btn-block">Se déconnecter</button>
          </form>
        </div>
      </aside>
      <main className="panel-main">
        <Suspense>
          <Flash />
        </Suspense>
        {isAdmin ? (
          children
        ) : (
          <div className="empty">
            <h1>Accès réservé</h1>
            <p>
              Le compte {user.email} n’a pas les droits d’administration. Un administrateur peut vous ajouter depuis la
              page Équipe.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
