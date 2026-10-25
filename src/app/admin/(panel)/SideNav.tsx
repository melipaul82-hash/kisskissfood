"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Tableau de bord", icon: "M3 13h8V3H3zm10 8h8V11h-8zM3 21h8v-6H3zm10-18v6h8V3z" },
  { href: "/admin/demandes", label: "Demandes", icon: "M4 4h16v12H5.2L4 17.2zm2 4h12M6 11h8", badge: true },
  { href: "/admin/produits", label: "Produits", icon: "M3 7l9-4 9 4-9 4zm0 0v10l9 4 9-4V7M12 11v10" },
  { href: "/admin/menu", label: "Menu restaurant", icon: "M7 3v8a2 2 0 0 0 4 0V3M9 11v10M17 3c-2 0-3 2-3 6s1 4 3 4v8" },
  { href: "/admin/whatsapp", label: "WhatsApp", icon: "M12 3a9 9 0 0 0-7.7 13.6L3 21l4.5-1.2A9 9 0 1 0 12 3z" },
  { href: "/admin/equipe", label: "Équipe", icon: "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 10a7 7 0 0 1 14 0M17 3a4 4 0 0 1 0 8m3 10a7 7 0 0 0-3-5.7" },
  { href: "/admin/compte", label: "Mon compte", icon: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-8 9a8 8 0 0 1 16 0" },
];

export function SideNav({ newLeads }: { newLeads: number }) {
  const path = usePathname();
  return (
    <nav className="side-nav" aria-label="Administration">
      {NAV.map((n) => {
        const active = n.href === "/admin" ? path === "/admin" : path.startsWith(n.href);
        return (
          <Link key={n.href} href={n.href} className={active ? "active" : undefined} aria-current={active ? "page" : undefined}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d={n.icon} />
            </svg>
            <span>{n.label}</span>
            {n.badge && newLeads > 0 && <em className="badge-count">{newLeads}</em>}
          </Link>
        );
      })}
    </nav>
  );
}
