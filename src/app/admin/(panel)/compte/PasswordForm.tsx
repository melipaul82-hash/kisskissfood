"use client";

import { useActionState } from "react";
import { changePassword, type PasswordState } from "../../actions";

export function PasswordForm() {
  const [state, action, pending] = useActionState<PasswordState, FormData>(changePassword, {});
  return (
    <form action={action} className="stack">
      <label>
        <span>Nouveau mot de passe (10 caractères minimum)</span>
        <input name="password" type="password" autoComplete="new-password" minLength={10} required />
      </label>
      <label>
        <span>Confirmer</span>
        <input name="confirm" type="password" autoComplete="new-password" minLength={10} required />
      </label>
      {state.error && <p className="form-error" role="alert">{state.error}</p>}
      {state.ok && <p className="form-ok" role="status">{state.ok}</p>}
      <div className="row">
        <button className="a-btn a-btn-primary" disabled={pending}>
          {pending ? "Enregistrement…" : "Changer le mot de passe"}
        </button>
      </div>
    </form>
  );
}
