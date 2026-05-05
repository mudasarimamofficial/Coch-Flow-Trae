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

async function main() {
  loadDotEnv();
  const supabaseUrl = mustEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceKey = mustEnv("SUPABASE_SERVICE_ROLE_KEY");
  const client = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const { data, error } = await client.storage.listBuckets();
  if (error) {
    console.log(JSON.stringify({ ok: false, error: error.message }, null, 2));
    process.exit(2);
  }
  console.log(JSON.stringify({ ok: true, buckets: data }, null, 2));
}

await main();

