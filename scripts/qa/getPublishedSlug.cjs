const fs = require("fs");
const path = require("path");

function readEnvLocal() {
  const file = path.join(process.cwd(), ".env.local");
  const out = {};
  if (!fs.existsSync(file)) return out;
  const raw = fs.readFileSync(file, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx <= 0) continue;
    const key = trimmed.slice(0, idx).trim();
    let val = trimmed.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

async function main() {
  const env = readEnvLocal();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    process.stdout.write("NO_ENV\n");
    return;
  }

  const { createClient } = require("@supabase/supabase-js");
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const { data, error } = await supabase
    .from("site_pages")
    .select("slug")
    .eq("status", "published")
    .order("updated_at", { ascending: false })
    .limit(1);

  if (error) {
    process.stdout.write("ERR\n");
    return;
  }

  process.stdout.write(`${data?.[0]?.slug || "NONE"}\n`);
}

main().catch(() => {
  process.stdout.write("ERR\n");
});

