import Link from "next/link";
import "./globals.css";

export default function NotFound() {
  return (
    <html lang="de">
      <body>
        <main className="legal container">
          <h1 className="display-lg">404</h1>
          <p>Diese Seite gibt es nicht. · Cette page n’existe pas. · This page doesn’t exist.</p>
          <p style={{ marginTop: "1.5rem" }}>
            <Link href="/de" className="btn btn-orange">
              Kiss Kiss Food
            </Link>
          </p>
        </main>
      </body>
    </html>
  );
}
