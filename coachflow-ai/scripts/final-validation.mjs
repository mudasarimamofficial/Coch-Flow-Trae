import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

function mustEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

function loadDotEnvFile(filePath) {
  try {
    const raw = fs.readFileSync(filePath, "utf8");
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

function loadDotEnv() {
  const cwd = process.cwd();
  loadDotEnvFile(path.join(cwd, ".env.local"));
  loadDotEnvFile(path.join(cwd, ".env"));
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchWithTimeout(url, init, timeoutMs = 60000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const merged = { ...(init || {}), signal: controller.signal };
    return await fetch(url, merged);
  } finally {
    clearTimeout(t);
  }
}

async function jsonOrText(res) {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res.text();
}

async function fetchJson(url, init) {
  const res = await fetchWithTimeout(url, init);
  const body = await jsonOrText(res);
  return { res, body };
}

function withBypass(init) {
  const secret = process.env.VERCEL_PROTECTION_BYPASS || "";
  if (!secret) return init;
  const headers = new Headers(init?.headers || undefined);
  headers.set("x-vercel-protection-bypass", secret);
  return { ...(init || {}), headers };
}

function deepClone(v) {
  return JSON.parse(JSON.stringify(v));
}

function nowId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function ensureObj(v) {
  return v && typeof v === "object" && !Array.isArray(v) ? v : {};
}

function firstString(v, fallback = "") {
  return typeof v === "string" ? v : fallback;
}

function setAt(obj, path, value) {
  const parts = path.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    cur[k] = ensureObj(cur[k]);
    cur = cur[k];
  }
  cur[parts[parts.length - 1]] = value;
}

function mutateLandingDraft(content, { logoPath, marker }) {
  const next = deepClone(content);
  next.landingV1 = ensureObj(next.landingV1);
  next.landingV1.hero = ensureObj(next.landingV1.hero);
  next.landingV1.nav = ensureObj(next.landingV1.nav);
  next.landingV1.footer = ensureObj(next.landingV1.footer);

  const tag = firstString(next.landingV1.hero.tag, "");
  next.landingV1.hero.tag = `${tag} (${marker})`;

  const logoText = firstString(next.landingV1.nav.logoText, "CoachFlow AI");
  next.landingV1.nav.logoText = `${logoText}`;
  next.landingV1.nav.logoImagePath = logoPath || null;
  next.landingV1.footer.logoImagePath = logoPath || null;

  next.builder = ensureObj(next.builder);
  const existing = Array.isArray(next.builder.sections) ? next.builder.sections : [];
  const sections = existing.length
    ? existing
    : [
        { id: "nav", type: "nav", enabled: true },
        { id: "hero", type: "hero", enabled: true },
        { id: "divider", type: "divider", enabled: true },
        { id: "trust", type: "trust", enabled: true },
        { id: "founder", type: "founder", enabled: true },
        { id: "promise", type: "promise", enabled: true },
        { id: "how", type: "how", enabled: true },
        { id: "honest", type: "honest", enabled: true },
        { id: "pricing", type: "pricing", enabled: true },
        { id: "apply", type: "apply", enabled: true },
        { id: "footer", type: "footer", enabled: true },
      ];

  const reordered = [...sections];
  const trust = reordered.find((s) => s && s.id === "trust");
  if (trust) trust.enabled = false;

  const pricingIdx = reordered.findIndex((s) => s && s.id === "pricing");
  const founderIdx = reordered.findIndex((s) => s && s.id === "founder");
  if (pricingIdx !== -1 && founderIdx !== -1 && pricingIdx > founderIdx) {
    const [pricing] = reordered.splice(pricingIdx, 1);
    reordered.splice(founderIdx, 0, pricing);
  }

  const ctaId = `cta-${marker.toLowerCase()}`.replace(/[^a-z0-9\-]/g, "-");
  if (!reordered.some((s) => s && s.id === ctaId)) {
    reordered.splice(3, 0, {
      id: ctaId,
      type: "ctaBlock",
      enabled: true,
      props: { title: `QA CTA (${marker})`, body: "", buttonLabel: "Apply Now", buttonHref: "#apply", layout: { columns: "two" } },
    });
  }

  next.builder.sections = reordered;

  return next;
}

async function run(baseUrl, scope) {
  const SUPABASE_URL = mustEnv("NEXT_PUBLIC_SUPABASE_URL");
  const SUPABASE_ANON = mustEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const SUPABASE_SERVICE = mustEnv("SUPABASE_SERVICE_ROLE_KEY");
  const MEDIA_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_MEDIA_BUCKET || "assets";

  const service = createClient(SUPABASE_URL, SUPABASE_SERVICE, {
    auth: { persistSession: false },
    global: { fetch: (url, init) => fetchWithTimeout(url, init) },
  });
  const anon = createClient(SUPABASE_URL, SUPABASE_ANON, {
    auth: { persistSession: false },
    global: { fetch: (url, init) => fetchWithTimeout(url, init) },
  });

  const marker = `QA-${nowId()}`;
  const email = `qa-admin+${marker.toLowerCase()}@coachflow.local`;
  const password = `CF-${marker}-Pass!1`;

  const results = [];
  const record = (name, ok, details) => results.push({ name, ok, details });

  let userId = null;
  let createdPageId = null;
  let createdPageSlug = null;
  let token = null;
  let uploadedPath = null;

  let originalHomepage = null;

  const wants = (s) => scope === "all" || scope === s;

  try {
    {
      const res = await fetchWithTimeout(`${baseUrl}/admin`, withBypass({ redirect: "manual" }));
      record("Security: /admin protected", res.status >= 300 && res.status < 400, `status=${res.status}`);
    }
    {
      const { res, body } = await fetchJson(`${baseUrl}/api/admin/homepage`, withBypass({ method: "GET" }));
      record("Security: admin API rejects missing auth", res.status === 401, typeof body === "string" ? body.slice(0, 80) : JSON.stringify(body));
    }

    if (wants("homepage") || wants("pages") || wants("media") || wants("all")) {
      const { data: created, error: createErr } = await service.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      if (createErr || !created?.user) throw new Error(`Failed to create QA admin user: ${createErr?.message || "unknown"}`);
      userId = created.user.id;

      const { error: profileErr } = await service
        .from("profiles")
        .upsert({ id: userId, email, is_admin: true }, { onConflict: "id" });
      if (profileErr) throw new Error(`Failed to set QA admin profile: ${profileErr.message}`);
      record("Auth: create temporary admin", true, email);

      const { data: signed, error: signErr } = await anon.auth.signInWithPassword({ email, password });
      if (signErr || !signed?.session?.access_token) throw new Error(`Failed to sign in QA admin: ${signErr?.message || "unknown"}`);
      token = signed.session.access_token;
      record("Auth: login works", true, "access token issued");
    }

    let logoPath = null;
    if (wants("media") || wants("homepage") || wants("all")) {
      const { data: listObjects, error: listErr } = await service.storage.from(MEDIA_BUCKET).list("", { limit: 100 });
      if (!listErr && Array.isArray(listObjects)) {
        const img = listObjects.find((o) => typeof o.name === "string" && /\.(png|jpg|jpeg|webp|gif)$/i.test(o.name));
        if (img?.name) logoPath = img.name;
      }

      if (!logoPath) {
        const tinyPngBase64 =
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/w8AAgMBAp6bHcUAAAAASUVORK5CYII=";
        uploadedPath = `qa/${marker.toLowerCase().replace(/[^a-z0-9\-]/g, "-")}.png`;
        const { error: upErr } = await service
          .storage
          .from(MEDIA_BUCKET)
          .upload(uploadedPath, Buffer.from(tinyPngBase64, "base64"), { contentType: "image/png", upsert: true });
        if (!upErr) logoPath = uploadedPath;
      }

      if (logoPath) {
        const publicUrl = `${SUPABASE_URL.replace(/\/+$/, "")}/storage/v1/object/public/${encodeURIComponent(MEDIA_BUCKET)}/${logoPath
          .split("/")
          .map(encodeURIComponent)
          .join("/")}`;
        const head = await fetchWithTimeout(publicUrl, { method: "HEAD" }, 12000);
        record("Media: public URL strategy", head.ok, `HEAD ${head.status} ${logoPath}`);
      } else {
        record("Media: public URL strategy", false, "No image found in media bucket to validate");
      }
    }

    if (wants("homepage") || wants("all")) {
      const { res: homeRes, body: homeBody } = await fetchJson(
        `${baseUrl}/api/admin/homepage`,
        withBypass({ method: "GET", headers: { authorization: `Bearer ${token}` } }),
      );
      if (!homeRes.ok || !homeBody?.ok) throw new Error(`Failed to load homepage admin payload: ${homeRes.status}`);

      originalHomepage = homeBody.published?.content ?? {};
      const baseline = homeBody.published?.updated_at ?? null;

      const draft = mutateLandingDraft(originalHomepage, { logoPath, marker });

      const { res: saveRes, body: saveBody } = await fetchJson(
        `${baseUrl}/api/admin/homepage`,
        withBypass({
          method: "PUT",
          headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
          body: JSON.stringify({ content: draft, published_updated_at: baseline }),
        }),
      );
      record("Builder flow: save draft", Boolean(saveRes.ok && saveBody?.ok), `status=${saveRes.status}`);

      const liveBefore = await fetchWithTimeout(`${baseUrl}/`, withBypass({ redirect: "follow" }), 12000).then((r) => r.text());
      record(
        "Draft safety: / does not leak draft",
        !liveBefore.includes(marker),
        liveBefore.includes(marker) ? "Marker found on / (draft leaked)" : "Marker not found on /",
      );

      const { res: pubRes, body: pubBody } = await fetchJson(
        `${baseUrl}/api/admin/homepage/publish`,
        withBypass({
          method: "POST",
          headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
          body: JSON.stringify({ force: false }),
        }),
      );
    if (pubRes.status === 409 && pubBody?.conflict) {
      record("Builder flow: publish", true, `status=409 conflict handled`);
      const latestBaseline = pubBody?.currentPublishedUpdatedAt ?? null;
      const { res: save2Res, body: save2Body } = await fetchJson(
        `${baseUrl}/api/admin/homepage`,
        withBypass({
          method: "PUT",
          headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
          body: JSON.stringify({ content: draft, published_updated_at: latestBaseline }),
        }),
      );
      record("Builder flow: save draft (after conflict)", Boolean(save2Res.ok && save2Body?.ok), `status=${save2Res.status}`);
      const { res: pub2Res, body: pub2Body } = await fetchJson(
        `${baseUrl}/api/admin/homepage/publish`,
        withBypass({
          method: "POST",
          headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
          body: JSON.stringify({ force: false }),
        }),
      );
      record("Builder flow: publish (after conflict)", Boolean(pub2Res.ok && pub2Body?.ok), `status=${pub2Res.status}`);
      if (!pub2Res.ok || !pub2Body?.ok) throw new Error(`Publish failed after conflict: ${pub2Res.status}`);
    } else {
      record("Builder flow: publish", Boolean(pubRes.ok && pubBody?.ok), `status=${pubRes.status}`);
      if (!pubRes.ok || !pubBody?.ok) throw new Error(`Publish failed: ${pubRes.status}`);
    }

      const liveAfter = await fetchWithTimeout(`${baseUrl}/`, withBypass({ redirect: "follow" }), 12000).then((r) => r.text());
      record("Publish correctness: / reflects changes", liveAfter.includes(marker), liveAfter.includes(marker) ? "Marker found" : "Marker missing");

      record(
        "Builder reliability: section enable/disable",
        !liveAfter.includes('class="trust-strip"'),
        liveAfter.includes('class="trust-strip"') ? "Trust strip still rendered" : "Trust strip hidden",
      );

      record(
        "Builder reliability: section add",
        liveAfter.includes(`QA CTA (${marker})`),
        liveAfter.includes(`QA CTA (${marker})`) ? "CTA rendered" : "CTA missing",
      );

      const { res: homeAfterRes, body: homeAfterBody } = await fetchJson(
        `${baseUrl}/api/admin/homepage`,
        withBypass({ method: "GET", headers: { authorization: `Bearer ${token}` } }),
      );
      const versions = homeAfterBody?.versions || [];
      record(
        "Versioning: homepage versions exist",
        Boolean(homeAfterRes.ok && Array.isArray(versions) && versions.length >= 1),
        `count=${versions.length}`,
      );
    }

    if (wants("pages") || wants("all")) {
      createdPageSlug = `qa-validation-${marker.toLowerCase()}`.replace(/[^a-z0-9\-]/g, "-");
      {
        const { res, body } = await fetchJson(
          `${baseUrl}/api/admin/pages`,
          withBypass({
            method: "POST",
            headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
            body: JSON.stringify({ title: `QA Validation ${marker}`, slug: createdPageSlug }),
          }),
        );
        if (!res.ok || !body?.ok) throw new Error(`Failed to create page: ${res.status} ${JSON.stringify(body)}`);
        createdPageId = body.id;
        record("Pages: create", true, createdPageSlug);
      }

      {
        const draftContent = { title: `QA Page ${marker}`, body: `This is a QA publish marker: ${marker}` };
        const { res, body } = await fetchJson(
          `${baseUrl}/api/admin/pages/${createdPageId}`,
          withBypass({
            method: "PUT",
            headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
            body: JSON.stringify({ draft_content: draftContent }),
          }),
        );
        record("Pages: update draft", Boolean(res.ok && body?.ok), `status=${res.status}`);
      }

      {
        const { res, body } = await fetchJson(
          `${baseUrl}/api/admin/pages/${createdPageId}`,
          withBypass({
            method: "POST",
            headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
            body: JSON.stringify({ publish: true }),
          }),
        );
        record("Pages: publish", Boolean(res.ok && body?.ok), `status=${res.status}`);
        const html = await fetchWithTimeout(`${baseUrl}/p/${createdPageSlug}`, withBypass({}), 12000).then((r) => r.text());
        record("Pages: /p/[slug] reflects publish", html.includes(marker), html.includes(marker) ? "Marker found" : "Marker missing");
      }

      {
        const draftContent2 = { title: `QA Page v2 ${marker}`, body: `Second marker: ${marker} v2` };
        await fetchJson(
          `${baseUrl}/api/admin/pages/${createdPageId}`,
          withBypass({
            method: "PUT",
            headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
            body: JSON.stringify({ draft_content: draftContent2 }),
          }),
        );
        await fetchJson(
          `${baseUrl}/api/admin/pages/${createdPageId}`,
          withBypass({
            method: "POST",
            headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
            body: JSON.stringify({ publish: true }),
          }),
        );
        const { res, body } = await fetchJson(
          `${baseUrl}/api/admin/pages/${createdPageId}/versions`,
          withBypass({ method: "GET", headers: { authorization: `Bearer ${token}` } }),
        );
        const ok = Boolean(res.ok && body?.ok && Array.isArray(body.items) && body.items.length >= 1);
        record("Pages: version history exists", ok, ok ? `count=${body.items.length}` : `status=${res.status}`);
      }
    }

    if (wants("media") || wants("all")) {
      const { res, body } = await fetchJson(
        `${baseUrl}/api/admin/media`,
        withBypass({ method: "GET", headers: { authorization: `Bearer ${token}` } }),
      );
      record("Media: list loads", Boolean(res.ok && body?.ok && Array.isArray(body.items)), `status=${res.status}`);
    }
  } catch (e) {
    record("Validation runner", false, e?.message || String(e));
  } finally {
    try {
      if (token && originalHomepage) {
        const { res: hRes, body: hBody } = await fetchJson(
          `${baseUrl}/api/admin/homepage`,
          withBypass({ method: "GET", headers: { authorization: `Bearer ${token}` } }),
        );
        const baseline = hBody?.published?.updated_at ?? null;
        if (hRes.ok && baseline) {
          await fetchJson(
            `${baseUrl}/api/admin/homepage`,
            withBypass({
              method: "PUT",
              headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
              body: JSON.stringify({ content: originalHomepage, published_updated_at: baseline }),
            }),
          );
          await fetchJson(
            `${baseUrl}/api/admin/homepage/publish`,
            withBypass({
              method: "POST",
              headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
              body: JSON.stringify({ force: true }),
            }),
          );
        }
      }
    } catch {}

    try {
      if (createdPageId) {
        await service.from("site_page_versions").delete().eq("page_id", createdPageId);
        await service.from("site_pages").delete().eq("id", createdPageId);
      }
    } catch {}

    try {
      if (uploadedPath) {
        await service.storage.from(MEDIA_BUCKET).remove([uploadedPath]);
      }
    } catch {}

    try {
      if (userId) {
        await service.from("profiles").delete().eq("id", userId);
        await service.auth.admin.deleteUser(userId);
      }
    } catch {}
  }

  return results;
}

async function main() {
  loadDotEnv();
  const baseUrl = process.argv[2] || process.env.BASE_URL || "";
  const scope = (process.argv[3] || "all").toLowerCase();
  if (!baseUrl) {
    console.error("Provide base URL as argv or set BASE_URL, e.g. node scripts/final-validation.mjs https://coachflow-a1.vercel.app");
    process.exit(1);
  }
  try {
    const outDir = path.join(process.cwd(), "test-results");
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, "final-validation-started.txt"), `${new Date().toISOString()} ${baseUrl}\n`);
  } catch {}
  const results = await run(baseUrl.replace(/\/+$/, ""), scope);
  const ok = results.every((r) => r.ok);
  const out = { baseUrl, ok, results };
  const outDir = path.join(process.cwd(), "test-results");
  try {
    fs.mkdirSync(outDir, { recursive: true });
  } catch {}
  const outFile = path.join(outDir, `final-validation-${Date.now()}.json`);
  fs.writeFileSync(outFile, JSON.stringify(out, null, 2));
  try {
    fs.writeFileSync(path.join(outDir, "final-validation-latest.json"), JSON.stringify(out, null, 2));
  } catch {}
  const failed = results.filter((r) => !r.ok);
  if (ok) {
    console.log(`FINAL VALIDATION PASS (${results.length}/${results.length}) -> ${outFile}`);
  } else {
    console.log(`FINAL VALIDATION FAIL (${results.length - failed.length}/${results.length}) -> ${outFile}`);
    for (const f of failed.slice(0, 12)) {
      console.log(`- ${f.name}: ${f.details}`);
    }
  }
  process.exit(ok ? 0 : 2);
}

await main();

