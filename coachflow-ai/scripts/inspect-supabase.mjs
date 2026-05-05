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
  const mediaBucket = process.env.NEXT_PUBLIC_SUPABASE_MEDIA_BUCKET || "assets";

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  const out = {
    ok: false,
    supabaseUrl,
    mediaBucket,
    buckets: null,
    mediaBucketSample: null,
    admins: null,
    error: null,
  };

  try {
    const { data: buckets, error: bucketsErr } = await supabase.storage.listBuckets();
    if (bucketsErr) throw new Error(`listBuckets: ${bucketsErr.message}`);
    out.buckets = buckets;

    const { data: mediaList, error: mediaErr } = await supabase.storage.from(mediaBucket).list("", { limit: 20 });
    out.mediaBucketSample = {
      ok: !mediaErr,
      error: mediaErr?.message || null,
      items: (mediaList || []).map((o) => ({ name: o.name, id: o.id, updated_at: o.updated_at })),
      count: (mediaList || []).length,
    };

    const { data: admins, error: adminsErr } = await supabase
      .from("profiles")
      .select("id,email,is_admin,created_at")
      .eq("is_admin", true)
      .limit(10);
    if (adminsErr) throw new Error(`profiles query: ${adminsErr.message}`);
    out.admins = admins;
    out.ok = true;
  } catch (e) {
    out.error = e?.message || String(e);
  }

  fs.mkdirSync("test-results", { recursive: true });
  fs.writeFileSync("test-results/supabase-inspect.json", JSON.stringify(out, null, 2));
  console.log(out.ok ? "SUPABASE_INSPECT_OK" : "SUPABASE_INSPECT_FAIL");
  process.exit(out.ok ? 0 : 2);
}

await main();

