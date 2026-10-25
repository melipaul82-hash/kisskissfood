import Image from "next/image";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="login">
      <div className="login-card">
        <Image src="/brand/logo-sm.png" alt="Kiss Kiss Food" width={110} height={108} priority />
        <h1>Espace Kiss Kiss Food</h1>
        <p>Connectez-vous pour voir les demandes et modifier les produits du site.</p>
        <LoginForm />
      </div>
    </main>
  );
}
