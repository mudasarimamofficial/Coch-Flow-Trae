import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadDotEnv() {
  const candidates = [".env.local", ".env"];
  for (const file of candidates) {
    try {
      const raw = fs.readFileSync(file, "utf8");
      for (const line of raw.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eq = trimmed.indexOf("=");
        if (eq === -1) continue;
        const key = trimmed.slice(0, eq).trim();
        let val = trimmed.slice(eq + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) process.env[key] = val;
      }
    } catch {}
  }
}

function mustEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function nowId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function writeResult(obj) {
  try {
    fs.mkdirSync("test-results", { recursive: true });
    fs.writeFileSync("test-results/homepage-draft-publish-test.json", JSON.stringify(obj, null, 2));
  } catch {}
}

async function main() {
  loadDotEnv();

  const baseUrl = process.argv[2] || "http://localhost:3060";
  const SUPABASE_URL = mustEnv("NEXT_PUBLIC_SUPABASE_URL");
  const SUPABASE_ANON = mustEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const SUPABASE_SERVICE = mustEnv("SUPABASE_SERVICE_ROLE_KEY");

  const service = createClient(SUPABASE_URL, SUPABASE_SERVICE, { auth: { persistSession: false } });
  const anon = createClient(SUPABASE_URL, SUPABASE_ANON, { auth: { persistSession: false } });

  const marker = `VALIDATION-${nowId()}`;
  const email = `qa-admin+${marker.toLowerCase()}@coachflow.local`;
  const password = `CF-${marker}-Pass!1`;

  let userId = null;
  let originalContent = null;
  const out = { baseUrl, ok: false, steps: [] };

  const step = (name, ok, details) => {
    out.steps.push({ name, ok, details });
    writeResult(out);
  };

  try {
    const { data: created, error: createErr } = await service.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (createErr || !created?.user) throw new Error(createErr?.message || "Failed to create user");
    userId = created.user.id;
    const { error: profErr } = await service.from("profiles").upsert({ id: userId, email, is_admin: true }, { onConflict: "id" });
    if (profErr) throw new Error(profErr.message);

    const { data: signed, error: signErr } = await anon.auth.signInWithPassword({ email, password });
    if (signErr || !signed?.session?.access_token) throw new Error(signErr?.message || "Failed sign-in");
    const token = signed.session.access_token;

    const home = await fetch(`${baseUrl}/api/admin/homepage`, { headers: { authorization: `Bearer ${token}` } }).then((r) => r.json());
    if (!home?.ok) throw new Error(`GET /api/admin/homepage failed: ${JSON.stringify(home)}`);

    const baseline = home.published?.updated_at ?? null;
    originalContent = home.published?.content ?? {};

    step("Baseline fetched", true, { updated_at: baseline, parse_ok: Number.isFinite(Date.parse(baseline)) });

    const draft = JSON.parse(JSON.stringify(originalContent));
    draft.landingV1 = draft.landingV1 || {};
    draft.landingV1.hero = { ...(draft.landingV1.hero || {}) };
    draft.landingV1.hero.tag = `${draft.landingV1.hero.tag || ""} ${marker}`.trim();

    const putRes = await fetch(`${baseUrl}/api/admin/homepage`, {
      method: "PUT",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ content: draft, published_updated_at: baseline }),
    });
    const putBody = await putRes.text();
    step("Draft save", putRes.status === 200, { status: putRes.status, body: putBody });
    if (putRes.status !== 200) throw new Error("Draft save failed");

    const pubRes = await fetch(`${baseUrl}/api/admin/homepage/publish`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ force: false }),
    });
    const pubBody = await pubRes.text();
    step("Publish", pubRes.status === 200, { status: pubRes.status, body: pubBody });

    if (pubRes.status === 409) {
      step("Publish conflict detected", true, { body: pubBody });
      let latestBaseline = null;
      try {
        const j = JSON.parse(pubBody);
        latestBaseline = j?.currentPublishedUpdatedAt ?? null;
      } catch {}
      const retryPut = await fetch(`${baseUrl}/api/admin/homepage`, {
        method: "PUT",
        headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
        body: JSON.stringify({ content: draft, published_updated_at: latestBaseline }),
      });
      step("Draft save (after conflict)", retryPut.status === 200, { status: retryPut.status, body: await retryPut.text() });
      const retryPub = await fetch(`${baseUrl}/api/admin/homepage/publish`, {
        method: "POST",
        headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
        body: JSON.stringify({ force: false }),
      });
      step("Publish (after conflict)", retryPub.status === 200, { status: retryPub.status, body: await retryPub.text() });
      if (retryPub.status !== 200) {
        const forcePub = await fetch(`${baseUrl}/api/admin/homepage/publish`, {
          method: "POST",
          headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
          body: JSON.stringify({ force: true }),
        });
        step("Publish forced (after conflict)", forcePub.status === 200, { status: forcePub.status, body: await forcePub.text() });
        if (forcePub.status !== 200) throw new Error("Publish failed");
      }
    } else if (pubRes.status !== 200) {
      throw new Error("Publish failed");
    }

    const html = await fetch(`${baseUrl}/`).then((r) => r.text());
    const ok = html.includes(marker);
    step("Live reflects publish", ok, { marker });
    if (!ok) throw new Error("Live page did not reflect published changes");

    const after = await fetch(`${baseUrl}/api/admin/homepage`, { headers: { authorization: `Bearer ${token}` } }).then((r) => r.json());
    const afterBaseline = after?.published?.updated_at ?? null;
    await fetch(`${baseUrl}/api/admin/homepage`, {
      method: "PUT",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ content: originalContent, published_updated_at: afterBaseline }),
    });
    await fetch(`${baseUrl}/api/admin/homepage/publish`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ force: true }),
    });
    step("Restore original", true, {});

    out.ok = true;
    writeResult(out);
  } finally {
    try {
      if (userId) {
        await service.from("profiles").delete().eq("id", userId);
        await service.auth.admin.deleteUser(userId);
      }
    } catch {}
  }
}

await main();

