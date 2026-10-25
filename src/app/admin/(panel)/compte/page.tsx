import { PasswordForm } from "./PasswordForm";

export default function AccountPage() {
  return (
    <>
      <div className="page-head">
        <h1>Mon compte</h1>
        <p>Changez votre mot de passe. Il est stocké de façon sécurisée par Supabase.</p>
      </div>
      <section className="card narrow">
        <PasswordForm />
      </section>
    </>
  );
}
