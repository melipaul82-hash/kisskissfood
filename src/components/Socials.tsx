import { site } from "@/lib/site";

const ICONS: Record<string, React.ReactNode> = {
  tiktok: <path d="M16 3c.4 2.6 2 4.3 4.5 4.6v3.2c-1.6 0-3.1-.5-4.4-1.3v6.3c0 3.5-2.7 6.2-6.1 6.2S4 19.3 4 15.8s2.9-6.3 6.5-6v3.3c-1.6-.3-3.2.8-3.2 2.6 0 1.6 1.2 2.9 2.8 2.9s2.8-1.3 2.8-3V3z" />,
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.2" cy="6.8" r="1.2" />
    </>
  ),
  facebook: <path d="M13.5 21v-7.5H16l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21z" />,
  linkedin: <path d="M5 9h3v11H5zm1.5-5A1.7 1.7 0 1 1 6.5 7.4 1.7 1.7 0 0 1 6.5 4zM10 9h2.9v1.5c.4-.8 1.4-1.7 3-1.7 3.2 0 3.8 2.1 3.8 4.8V20h-3v-5.6c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9V20H10z" />,
};

const LABELS: Record<string, string> = { tiktok: "TikTok", instagram: "Instagram", facebook: "Facebook", linkedin: "LinkedIn" };

export function Socials() {
  const entries = Object.entries(site.socials).filter(([, url]) => url);
  if (!entries.length) return null;
  return (
    <ul className="socials" role="list">
      {entries.map(([key, url]) => (
        <li key={key}>
          <a href={url} target="_blank" rel="noopener noreferrer" aria-label={LABELS[key]}>
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              {ICONS[key]}
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
