import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadDotEnv() {
  for (const file of [".env.local", ".env"]) {
    try {
      const raw = fs.readFileSync(file, "utf8");
      for (const line of raw.split(/\r?\n/)) {
        const t = line.trim();
        if (!t || t.startsWith("#")) continue;
        const i = t.indexOf("=");
        if (i === -1) continue;
        const k = t.slice(0, i).trim();
        let v = t.slice(i + 1).trim();
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
        if (!process.env[k]) process.env[k] = v;
      }
    } catch {}
  }
}

function mustEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function publicUrl({ supabaseUrl, bucket, path }) {
  const base = supabaseUrl.replace(/\/+$/, "");
  const p = String(path).replace(/^\/+/, "");
  return `${base}/storage/v1/object/public/${encodeURIComponent(bucket)}/${p
    .split("/")
    .map((s) => encodeURIComponent(s))
    .join("/")}`;
}

async function main() {
  loadDotEnv();
  const supabaseUrl = mustEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceKey = mustEnv("SUPABASE_SERVICE_ROLE_KEY");
  const bucket = process.env.NEXT_PUBLIC_SUPABASE_MEDIA_BUCKET || "assets";
  const client = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  const tinyPngBase64 =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/w8AAgMBAp6bHcUAAAAASUVORK5CYII=";
  const key = `qa/public-check-${Date.now()}.png`;

  const { error: upErr } = await client
    .storage
    .from(bucket)
    .upload(key, Buffer.from(tinyPngBase64, "base64"), { contentType: "image/png", upsert: true });

  if (upErr) {
    console.log(JSON.stringify({ ok: false, stage: "upload", error: upErr.message }, null, 2));
    process.exit(2);
  }

  const url = publicUrl({ supabaseUrl, bucket, path: key });
  const head = await fetch(url, { method: "HEAD" });

  await client.storage.from(bucket).remove([key]);

  console.log(
    JSON.stringify(
      {
        ok: head.ok,
        bucket,
        status: head.status,
        url,
      },
      null,
      2,
    ),
  );

  process.exit(head.ok ? 0 : 3);
}

await main();

