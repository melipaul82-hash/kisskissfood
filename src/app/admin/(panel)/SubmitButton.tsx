"use client";

import { useFormStatus } from "react-dom";

/** Primary button that shows the save is in progress. */
export function SubmitButton({ children, pending = "Enregistrement…" }: { children: React.ReactNode; pending?: string }) {
  const { pending: busy } = useFormStatus();
  return (
    <button className="a-btn a-btn-primary" disabled={busy}>
      {busy ? pending : children}
    </button>
  );
}
