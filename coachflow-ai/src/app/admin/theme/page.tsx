"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAdminFetch } from "@/hooks/useAdminFetch";
import {
  TYPOGRAPHY_TIERS,
  TYPOGRAPHY_TOKENS,
  defaultTypographyScale,
  mergeTypographyScale,
  type TypographyScale,
  type TypographyTier,
  type TypographyToken,
} from "@/utils/typographyScale";

type Theme = {
  gold: string;
  goldLight: string;
  goldDim: string;
  black: string;
  white: string;
  charcoal: string;
  mid: string;
  muted: string;
};

type Fonts = {
  body: string;
  heading: string;
  serif: string;
};

const defaults: Theme = {
  gold: "#C9A84C",
  goldLight: "#E8D5A3",
  goldDim: "#8A6F32",
  black: "#0A0A0A",
  white: "#F5F2ED",
  charcoal: "#1A1A1A",
  mid: "#2E2E2E",
  muted: "#6B6B6B",
};

const defaultFonts: Fonts = {
  body: "'DM Sans', sans-serif",
  heading: "'Bebas Neue', sans-serif",
  serif: "'DM Serif Display', serif",
};

export default function ThemePage() {
  const adminFetch = useAdminFetch();
  const [theme, setTheme] = useState<Theme>(defaults);
  const [fonts, setFonts] = useState<Fonts>(defaultFonts);
  const [scale, setScale] = useState<TypographyScale>(defaultTypographyScale);
  const [baseContent, setBaseContent] = useState<any>({});
  const [publishedUpdatedAt, setPublishedUpdatedAt] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    adminFetch("/api/admin/homepage")
      .then((r) => r.json())
      .then((j) => {
        if (!mounted || !j?.ok) return;
        const content = (j.draft?.content && Object.keys(j.draft.content).length ? j.draft.content : j.published?.content) ?? {};
        setBaseContent(content);
        const t = (content as any)?.landingTheme;
        setTheme({ ...defaults, ...(typeof t === "object" && t ? t : {}) });
        const f = (content as any)?.landingFonts;
        setFonts({ ...defaultFonts, ...(typeof f === "object" && f ? f : {}) });
        const s = (content as any)?.landingTypographyScale;
        setScale(mergeTypographyScale(s, defaultTypographyScale));
        setPublishedUpdatedAt(j.draft?.published_updated_at ?? j.published?.updated_at ?? null);
      });
    return () => {
      mounted = false;
    };
  }, [adminFetch]);

  async function saveDraft() {
    setSaving(true);
    try {
      const next = { ...baseContent, landingTheme: theme, landingFonts: fonts, landingTypographyScale: scale };
      const res = await adminFetch("/api/admin/homepage", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content: next, published_updated_at: publishedUpdatedAt }),
      });
      const j = await res.json().catch(() => null);
      if (j?.ok) {
        setBaseContent(next);
        setPublishedUpdatedAt(j.published_updated_at ?? publishedUpdatedAt);
      }
    } finally {
      setSaving(false);
    }
  }

  const set = (k: keyof Theme) => (v: string) => setTheme((p) => ({ ...p, [k]: v }));
  const setFont = (k: keyof Fonts) => (v: string) => setFonts((p) => ({ ...p, [k]: v }));
  const setScaleToken = (tier: TypographyTier, token: TypographyToken) => (v: string) =>
    setScale((p) => ({
      ...p,
      [tier]: {
        ...p[tier],
        [token]: v,
      },
    }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">Theme Studio</h1>
        <p className="text-surface-400 text-sm">Controls the live landing page palette via draft → publish.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Landing Palette</CardTitle>
          <CardDescription>Overrides the CSS variables used by the landing renderer.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm text-surface-300">Gold</label>
            <Input value={theme.gold} onChange={(e) => set("gold")(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-surface-300">Gold Light</label>
            <Input value={theme.goldLight} onChange={(e) => set("goldLight")(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-surface-300">Gold Dim</label>
            <Input value={theme.goldDim} onChange={(e) => set("goldDim")(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-surface-300">Muted</label>
            <Input value={theme.muted} onChange={(e) => set("muted")(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-surface-300">Black</label>
            <Input value={theme.black} onChange={(e) => set("black")(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-surface-300">White</label>
            <Input value={theme.white} onChange={(e) => set("white")(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-surface-300">Charcoal</label>
            <Input value={theme.charcoal} onChange={(e) => set("charcoal")(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-surface-300">Mid</label>
            <Input value={theme.mid} onChange={(e) => set("mid")(e.target.value)} />
          </div>
        </CardContent>
        <CardFooter className="border-t border-surface-800 bg-surface-900/20 pt-6">
          <Button variant="primary" onClick={saveDraft} disabled={saving}>
            {saving ? "Saving..." : "Save Theme to Draft"}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fonts</CardTitle>
          <CardDescription>Set CSS font-family values. Ensure fonts are loaded via Custom Head code.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm text-surface-300">Body Font</label>
            <Input value={fonts.body} onChange={(e) => setFont("body")(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-surface-300">Heading Font</label>
            <Input value={fonts.heading} onChange={(e) => setFont("heading")(e.target.value)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm text-surface-300">Serif Font</label>
            <Input value={fonts.serif} onChange={(e) => setFont("serif")(e.target.value)} />
          </div>
        </CardContent>
        <CardFooter className="border-t border-surface-800 bg-surface-900/20 pt-6">
          <Button variant="primary" onClick={saveDraft} disabled={saving}>
            {saving ? "Saving..." : "Save Fonts to Draft"}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Typography Scale</CardTitle>
          <CardDescription>Responsive font-size tokens used across the landing page.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {TYPOGRAPHY_TIERS.map((tier) => (
            <div key={tier.key} className="space-y-3">
              <div className="text-sm font-medium text-surface-200">
                {tier.label}
                {tier.minWidth ? <span className="text-surface-500"> &middot; {tier.minWidth}px+</span> : null}
              </div>
              <div className="grid gap-3 md:grid-cols-4">
                {TYPOGRAPHY_TOKENS.map((token) => (
                  <div key={token.key} className="space-y-1">
                    <label className="text-xs text-surface-400">{token.label}</label>
                    <Input value={scale[tier.key][token.key]} onChange={(e) => setScaleToken(tier.key, token.key)(e.target.value)} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
        <CardFooter className="border-t border-surface-800 bg-surface-900/20 pt-6 flex gap-3">
          <Button variant="secondary" onClick={() => setScale(defaultTypographyScale)} disabled={saving}>
            Reset Scale
          </Button>
          <Button variant="primary" onClick={saveDraft} disabled={saving}>
            {saving ? "Saving..." : "Save Typography to Draft"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
