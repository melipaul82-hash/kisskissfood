import { createHmac, timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

/**
 * WhatsApp Cloud API webhook.
 * Meta calls GET once to check the URL, then POST for every incoming message.
 * Phase 1 only stores messages; automatic replies come next.
 *
 * Environment variables (Vercel → Settings → Environment Variables):
 *   WHATSAPP_VERIFY_TOKEN      any long random string, also typed in the Meta app
 *   WHATSAPP_APP_SECRET        Meta app → App settings → Basic → App secret
 *   SUPABASE_SERVICE_ROLE_KEY  Supabase → Project Settings → API keys (secret, server only)
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const token = process.env.WHATSAPP_VERIFY_TOKEN;
  if (token && params.get("hub.mode") === "subscribe" && params.get("hub.verify_token") === token) {
    return new Response(params.get("hub.challenge") ?? "", { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

function signatureIsValid(raw: string, header: string | null) {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret || !header?.startsWith("sha256=")) return false;
  const expected = createHmac("sha256", secret).update(raw).digest("hex");
  const given = header.slice(7);
  if (given.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(given, "hex"), Buffer.from(expected, "hex"));
}

type WaMessage = {
  id: string;
  from: string;
  type: string;
  text?: { body?: string };
  interactive?: { button_reply?: { title?: string }; list_reply?: { title?: string } };
  button?: { text?: string };
};

export async function POST(request: Request) {
  const raw = await request.text();
  if (!signatureIsValid(raw, request.headers.get("x-hub-signature-256"))) {
    return new Response("Invalid signature", { status: 401 });
  }

  let body: {
    entry?: { changes?: { value?: { contacts?: { wa_id: string; profile?: { name?: string } }[]; messages?: WaMessage[] } }[] }[];
  };
  try {
    body = JSON.parse(raw);
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("WhatsApp webhook: Supabase server key missing");
    return new Response("OK", { status: 200 }); // answer Meta anyway, or it keeps retrying
  }
  const db = createClient(url, key, { auth: { persistSession: false } });

  for (const entry of body.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value ?? {};
      const names = new Map((value.contacts ?? []).map((c) => [c.wa_id, c.profile?.name ?? null]));
      for (const m of value.messages ?? []) {
        const now = new Date().toISOString();
        await db
          .from("wa_contacts")
          .upsert({ wa_id: m.from, name: names.get(m.from) ?? null, last_seen: now }, { onConflict: "wa_id" });
        const text =
          m.text?.body ?? m.interactive?.button_reply?.title ?? m.interactive?.list_reply?.title ?? m.button?.text ?? null;
        const { error } = await db
          .from("wa_messages")
          .upsert(
            { id: m.id, wa_id: m.from, direction: "in", type: m.type, body: text, payload: m },
            { onConflict: "id", ignoreDuplicates: true }
          );
        if (error) console.error("WhatsApp webhook: could not store message", error.message);
      }
    }
  }

  return new Response("OK", { status: 200 });
}
