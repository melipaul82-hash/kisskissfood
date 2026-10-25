import "@fontsource-variable/bricolage-grotesque/wdth.css";
import "@fontsource-variable/figtree";
import "./admin.css";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin – Kiss Kiss Food",
  robots: { index: false, follow: false },
  icons: { icon: "/icon.png" },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="admin">{children}</body>
    </html>
  );
}
