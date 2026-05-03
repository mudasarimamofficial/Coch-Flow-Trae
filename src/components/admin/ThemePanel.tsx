import type { SupabaseClient } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { homepageDefaults, type HomepageContent } from "@/content/homepage";
import { mergeTypographyScale, TYPOGRAPHY_TIERS, TYPOGRAPHY_TOKENS } from "@/utils/typographyScale";
import Image from "next/image";

type Props = {
  supabase: SupabaseClient;
};

const defaultTheme =
  homepageDefaults.site.theme ??
  ({
    colors: {
      primary: "#C9982A",
      secondary: "#0F1629",
      accent: "#E8B84B",
      background: "#0A0F1E",
      text: "#FFFFFF",
      surface: "#141D35",
      border: "rgba(255,255,255,0.07)",
    },
    typography: {
      headingFont: "",
      bodyFont: "",
    },
  } as NonNullable<HomepageContent["site"]["theme"]>);

const mergeScale = (base: any, extra: any) => {
  return mergeTypographyScale(extra, mergeTypographyScale(base || (defaultTheme as any)?.typography?.scale));
};

const mergeTheme = (base: any, extra: any) => {
  const b = base || defaultTheme;
  const e = extra || {};
  return {
    ...b,
    ...e,
    colors: { ...(b?.colors || {}), ...(e.colors || {}) },
    typography: {
      ...(b?.typography || {}),
      ...(e.typography || {}),
      scale: mergeScale(b?.typography?.scale, e.typography?.scale),
    },
  };
};

export function ThemePanel({ supabase }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  
  const [theme, setTheme] = useState<HomepageContent["site"]["theme"]>(defaultTheme);
  const [designPreset, setDesignPreset] = useState<"landing_html_v1" | "classic">("landing_html_v1");
  const [brandIconUrl, setBrandIconUrl] = useState<string>("");

  const load = useCallback(async () => {
    setSaved(null);
    setError(null);
    setLoading(true);
    try {
      const { data: home, error: homeErr } = await supabase
        .from("homepage_content")
        .select("content")
        .eq("id", 1)
        .maybeSingle();
      
      if (homeErr) {
        setError(homeErr.message);
        return;
      }
      if (home?.content) {
        const c = home.content as HomepageContent;
        setTheme(mergeTheme(defaultTheme, c.site?.theme));
        setDesignPreset(((c.site as any)?.designPreset as any) === "classic" ? "classic" : "landing_html_v1");
        setBrandIconUrl(String(c.header?.brandIcon?.url || homepageDefaults.header.brandIcon?.url || ""));
      }
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    setSaved(null);
    setError(null);
    setLoading(true);
    try {
      const { data: home, error: homeErr } = await supabase
        .from("homepage_content")
        .select("content")
        .eq("id", 1)
        .single();
      if (homeErr) {
        setError(homeErr.message);
        return;
      }
      const current = home.content as HomepageContent;
      const themeWithDefaults = mergeTheme(defaultTheme, theme || defaultTheme);
      const currentBranding = (current.branding || homepageDefaults.branding || { colors: themeWithDefaults.colors }) as any;
      const mergedBrandingColors = {
        ...(homepageDefaults.branding?.colors || {}),
        ...(currentBranding.colors || {}),
        ...(themeWithDefaults.colors || {}),
      };
      
      const updated: HomepageContent = {
        ...current,
        site: {
          ...current.site,
          designPreset,
          theme: themeWithDefaults,
        },
        header: {
          ...current.header,
          brandIcon: {
            ...current.header?.brandIcon,
            url: brandIconUrl,
          }
        },
        branding: {
          ...currentBranding,
          enabled: Boolean(themeWithDefaults?.enabled),
          colors: mergedBrandingColors,
          typography: {
            ...(currentBranding.typography || {}),
            headingFont: themeWithDefaults?.typography?.headingFont || "",
            bodyFont: themeWithDefaults?.typography?.bodyFont || "",
            scale: (themeWithDefaults as any)?.typography?.scale,
          },
        },
      };
      
      const { error: updateHomeErr } = await supabase
        .from("homepage_content")
        .update({ content: updated })
        .eq("id", 1);
        
      if (updateHomeErr) {
        setError(updateHomeErr.message);
        return;
      }
      
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token || "";
      if (token) {
        await fetch("/api/admin/revalidate", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ paths: ["/"] }),
        });
      }
      
      setSaved("Theme and design settings saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 pb-10 lg:px-8 lg:py-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Theme Studio</h1>
        <p className="mt-1 text-sm text-white/60">
          Manage your brand identity, colors, typography, and design presets.
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      {saved ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {saved}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold">Global Settings</h2>
            <div className="space-y-4">
              <Select
                label="Design preset"
                value={designPreset}
                onChange={(e) => setDesignPreset(e.target.value === "classic" ? "classic" : "landing_html_v1")}
                options={[
                  { value: "landing_html_v1", label: "Landing (HTML v1) - Default" },
                  { value: "classic", label: "Classic Builder Theme" },
                ]}
              />
              <Select
                label="Use custom theme (Classic only)"
                value={theme?.enabled ? "yes" : "no"}
                onChange={(e) => setTheme((t) => ({ ...(t || defaultTheme), enabled: e.target.value === "yes" }))}
                options={[
                  { value: "no", label: "No (Recommended)" },
                  { value: "yes", label: "Yes" },
                ]}
              />
              <Input
                label="Brand Icon URL (Used in header & admin)"
                value={brandIconUrl}
                onChange={(e) => setBrandIconUrl(e.target.value)}
                placeholder="https://..."
              />
              {brandIconUrl && (
                <div className="mt-2 rounded-xl bg-black/20 p-4">
                  <div className="mb-2 text-xs font-semibold text-white/60">Preview</div>
                  <Image src={brandIconUrl} alt="Brand Icon" width={64} height={64} className="rounded-xl" unoptimized />
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold">Brand Colors</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                label="Primary"
                value={theme?.colors.primary || ""}
                onChange={(e) =>
                  setTheme((t) => ({
                    ...(t || defaultTheme),
                    colors: { ...(t?.colors || defaultTheme.colors), primary: e.target.value },
                  }))
                }
                placeholder="#0fa3a3"
              />
              <Input
                label="Accent"
                value={theme?.colors.accent || ""}
                onChange={(e) =>
                  setTheme((t) => ({
                    ...(t || defaultTheme),
                    colors: { ...(t?.colors || defaultTheme.colors), accent: e.target.value },
                  }))
                }
                placeholder="#b58a2f"
              />
              <Input
                label="Background"
                value={theme?.colors.background || ""}
                onChange={(e) =>
                  setTheme((t) => ({
                    ...(t || defaultTheme),
                    colors: { ...(t?.colors || defaultTheme.colors), background: e.target.value },
                  }))
                }
                placeholder="#f6f8f8"
              />
              <Input
                label="Surface"
                value={theme?.colors.surface || ""}
                onChange={(e) =>
                  setTheme((t) => ({
                    ...(t || defaultTheme),
                    colors: { ...(t?.colors || defaultTheme.colors), surface: e.target.value },
                  }))
                }
                placeholder="#ffffff"
              />
              <Input
                label="Text"
                value={theme?.colors.text || ""}
                onChange={(e) =>
                  setTheme((t) => ({
                    ...(t || defaultTheme),
                    colors: { ...(t?.colors || defaultTheme.colors), text: e.target.value },
                  }))
                }
                placeholder="#0f172a"
              />
              <Input
                label="Border"
                value={theme?.colors.border || ""}
                onChange={(e) =>
                  setTheme((t) => ({
                    ...(t || defaultTheme),
                    colors: { ...(t?.colors || defaultTheme.colors), border: e.target.value },
                  }))
                }
                placeholder="rgba(148, 163, 184, 0.35)"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-bold">Typography</h2>
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                label="Heading font"
                value={theme?.typography?.headingFont || ""}
                onChange={(e) =>
                  setTheme((t) => ({
                    ...(t || defaultTheme),
                    typography: { ...(t?.typography || {}), headingFont: e.target.value },
                  }))
                }
                placeholder="e.g. Inter, system-ui"
              />
              <Input
                label="Body font"
                value={theme?.typography?.bodyFont || ""}
                onChange={(e) =>
                  setTheme((t) => ({
                    ...(t || defaultTheme),
                    typography: { ...(t?.typography || {}), bodyFont: e.target.value },
                  }))
                }
                placeholder="e.g. Inter, system-ui"
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white/80">Typography Scale</h3>
              {TYPOGRAPHY_TIERS.map((tier) => {
                const scale = mergeTypographyScale((theme as any)?.typography?.scale || (defaultTheme as any)?.typography?.scale);
                const tierScale = scale[tier.key];
                const setTierValue = (token: string, value: string) => {
                  setTheme((t) => {
                    const next = mergeTheme(defaultTheme, t);
                    const nextScale = mergeTypographyScale((next as any).typography.scale);
                    return {
                      ...next,
                      typography: {
                        ...(next as any).typography,
                        scale: {
                          ...nextScale,
                          [tier.key]: {
                            ...(nextScale as any)[tier.key],
                            [token]: value,
                          },
                        },
                      },
                    };
                  });
                };

                return (
                  <div key={tier.key} className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-sm font-semibold text-white/80">{tier.label}</div>
                      {tier.minWidth ? <div className="text-xs font-semibold text-white/40">{tier.minWidth}px+</div> : null}
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {TYPOGRAPHY_TOKENS.map((token) => (
                        <Input
                          key={token.key}
                          label={token.label}
                          value={String(tierScale[token.key] || "")}
                          onChange={(e) => setTierValue(token.key, e.target.value)}
                          placeholder="16px"
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div>
          <div className="sticky top-6 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-sm">
            <h3 className="text-sm font-bold">Actions</h3>
            <p className="mt-1 mb-4 text-xs text-white/60">
              Save your changes to apply them to your live site immediately.
            </p>
            <Button
              className="w-full h-11"
              disabled={loading}
              onClick={save}
            >
              Save Theme
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
