"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

/** Shows the result of the last action (?ok=… or ?err=…), then cleans the address bar. */
export function Flash() {
  const params = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const ok = params.get("ok");
  const err = params.get("err");

  useEffect(() => {
    if (!ok && !err) return;
    const t = setTimeout(() => router.replace(path, { scroll: false }), 6000);
    return () => clearTimeout(t);
  }, [ok, err, path, router]);

  if (!ok && !err) return null;
  return (
    <div className={`flash ${err ? "flash-err" : "flash-ok"}`} role={err ? "alert" : "status"}>
      <span>{err || ok}</span>
      <button type="button" aria-label="Fermer" onClick={() => router.replace(path, { scroll: false })}>
        ×
      </button>
    </div>
  );
}
