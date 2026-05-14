import type { SupabaseClient } from "@supabase/supabase-js";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { homepageDefaults, CLIENT_HTML_PALETTE, type HomepageContent } from "@/content/homepage";
import { validateSenderEmailBasic } from "@/utils/resendSender";
import { requestAdminRevalidate } from "@/utils/adminRevalidate";
import { mergeTypographyScale, TYPOGRAPHY_TIERS, TYPOGRAPHY_TOKENS } from "@/utils/typographyScale";

type Props = {
  supabase: SupabaseClient;
};

const defaultTheme =
  homepageDefaults.site.theme ??
  ({
    colors: {
      // Client HTML palette -- source of truth
      primary: CLIENT_HTML_PALETTE.primary,
      secondary: CLIENT_HTML_PALETTE.secondary,
      accent: CLIENT_HTML_PALETTE.accent,
      background: CLIENT_HTML_PALETTE.background,
      text: CLIENT_HTML_PALETTE.text,
      surface: CLIENT_HTML_PALETTE.surface,
      border: CLIENT_HTML_PALETTE.border,
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

function applyThemeToHomepageContent(
  current: HomepageContent,
  themeWithDefaults: NonNullable<HomepageContent["site"]["theme"]>,
  designPreset: "landing_html_v1" | "classic",
): HomepageContent {
  const currentBranding = (current.branding || homepageDefaults.branding || { colors: themeWithDefaults.colors }) as any;
  const mergedBrandingColors = {
    ...(homepageDefaults.branding?.colors || {}),
    ...(currentBranding.colors || {}),
    ...(themeWithDefaults.colors || {}),
  };

  return {
    ...current,
    site: {
      ...current.site,
      designPreset,
      theme: themeWithDefaults,
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
}

export function SettingsPanel({ supabase }: Props) {
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [settingsSaved, setSettingsSaved] = useState<string | null>(null);
  
  const [adminEmail, setAdminEmail] = useState("");
  const [resendMasked, setResendMasked] = useState("");
  const [resendKeyDraft, setResendKeyDraft] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [senderStatus, setSenderStatus] = useState<string | null>(null);
  const [senderMessage, setSenderMessage] = useState<string | null>(null);
  const [senderEffective, setSenderEffective] = useState<string | null>(null);
  
  const [theme, setTheme] = useState<HomepageContent["site"]["theme"]>(defaultTheme);
  const [designPreset, setDesignPreset] = useState<"landing_html_v1" | "classic">("landing_html_v1");
  const [headerShowIcon, setHeaderShowIcon] = useState(true);
  const [footerShowIcon, setFooterShowIcon] = useState(true);
  
  const loadSeqRef = useRef(0);

  const loadSettings = useCallback(async () => {
    const seq = loadSeqRef.current + 1;
    loadSeqRef.current = seq;
    const isCurrentLoad = () => loadSeqRef.current === seq;
    setSettingsSaved(null);
    setSettingsError(null);
    setSettingsLoading(true);
    try {
      const { data, error } = await supabase
        .from("settings")
        .select(
          "id, admin_email, resend_api_key_masked, resend_from_email, resend_sender_status, resend_sender_message",
        )
        .eq("id", 1)
        .single();

      if (error) {
        if (!isCurrentLoad()) return;
        setSettingsError(error.message);
        return;
      }

      if (!isCurrentLoad()) return;
      setAdminEmail((data as { admin_email: string }).admin_email);
      setResendMasked(String((data as any).resend_api_key_masked || ""));
      setSenderEmail(String((data as any).resend_from_email || ""));
      setSenderStatus(String((data as any).resend_sender_status || ""));
      setSenderMessage(String((data as any).resend_sender_message || ""));

      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token || "";
      if (token) {
        const res = await fetch("/api/admin/resend-sender", {
          headers: { authorization: `Bearer ${token}` },
        });
        const json = (await res.json()) as any;
        if (!isCurrentLoad()) return;
        if (res.ok && json?.ok) {
          setSenderEffective(String(json.effectiveFrom || "") || null);
          setSenderStatus(String(json.status || "") || null);
          setSenderMessage(String(json.message || "") || null);
        }
      }

      const { data: home, error: homeErr } = await supabase
        .from("homepage_content")
        .select("content")
        .eq("id", 1)
        .maybeSingle();
      if (!homeErr && home?.content) {
        if (!isCurrentLoad()) return;
        const c = home.content as HomepageContent;
        setTheme(mergeTheme(defaultTheme, c.site?.theme));
        setDesignPreset(((c.site as any)?.designPreset as any) === "classic" ? "classic" : "landing_html_v1");
        setHeaderShowIcon(c.header?.showBrandIcon !== false);
        setFooterShowIcon(c.footer?.showBrandIcon !== false);
      }
    } finally {
      if (!isCurrentLoad()) return;
      setSettingsLoaded(true);
      setSettingsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSave = async () => {
    setSettingsSaved(null);
    setSettingsError(null);
    setSettingsLoading(true);
    try {
      // 1. Save global settings (email)
      const nextEmail = adminEmail.trim();
      if (!nextEmail || !nextEmail.includes("@")) {
        setSettingsError("Enter a valid admin notification email");
        return;
      }
      const { error: settingsErr } = await supabase
        .from("settings")
        .update({ admin_email: nextEmail })
        .eq("id", 1);
      if (settingsErr) {
        setSettingsError(settingsErr.message);
        return;
      }

      // 2. Save homepage content (theme, preset, icons)
      const { data: home, error: homeErr } = await supabase
        .from("homepage_content")
        .select("content")
        .eq("id", 1)
        .single();
      if (homeErr) {
        setSettingsError(homeErr.message);
        return;
      }
      
      const current = home.content as HomepageContent;
      const themeWithDefaults = mergeTheme(defaultTheme, theme || defaultTheme);
      const updated = applyThemeToHomepageContent(current, themeWithDefaults, designPreset);
      
      // Apply brand icon toggles
      if (updated.header) updated.header.showBrandIcon = headerShowIcon;
      if (updated.footer) updated.footer.showBrandIcon = footerShowIcon;

      const { data: updatedHome, error: updateHomeErr } = await supabase
        .from("homepage_content")
        .update({ content: updated })
        .eq("id", 1)
        .select("updated_at")
        .maybeSingle();
      if (updateHomeErr) {
        setSettingsError(updateHomeErr.message);
        return;
      }

      // 3. Update draft if it exists
      const { data: draftRow, error: draftErr } = await supabase
        .from("homepage_content_drafts")
        .select("content")
        .eq("id", 1)
        .maybeSingle();
      if (!draftErr && draftRow?.content && Object.keys(draftRow.content as Record<string, unknown>).length) {
        const draftUpdated = applyThemeToHomepageContent(draftRow.content as HomepageContent, themeWithDefaults, designPreset);
        if (draftUpdated.header) draftUpdated.header.showBrandIcon = headerShowIcon;
        if (draftUpdated.footer) draftUpdated.footer.showBrandIcon = footerShowIcon;

        await supabase
          .from("homepage_content_drafts")
          .upsert({
            id: 1,
            content: draftUpdated,
            published_updated_at: updatedHome?.updated_at || null,
          }, { onConflict: "id" });
      }

      await requestAdminRevalidate(supabase, ["/"]);
      setSettingsSaved("All settings saved successfully.");
    } catch (err: any) {
      setSettingsError(err.message || "An unexpected error occurred during save.");
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleResetToClientPalette = () => {
    setTheme((t) => ({
      ...(t || defaultTheme),
      colors: {
        primary: CLIENT_HTML_PALETTE.primary,
        secondary: CLIENT_HTML_PALETTE.secondary,
        accent: CLIENT_HTML_PALETTE.accent,
        background: CLIENT_HTML_PALETTE.background,
        text: CLIENT_HTML_PALETTE.text,
        surface: CLIENT_HTML_PALETTE.surface,
        border: CLIENT_HTML_PALETTE.border,
      },
    }));
  };

  const updateResendKey = async () => {
    if (!resendKeyDraft.trim().length) return;
    setSettingsSaved(null);
    setSettingsError(null);
    setSettingsLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token || "";
      if (!token) throw new Error("Unauthorized");

      const res = await fetch("/api/admin/resend-key", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ apiKey: resendKeyDraft.trim() }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.message || "Failed to update Resend key");
      
      setResendMasked(json.masked || resendMasked);
      setResendKeyDraft("");
      setSettingsSaved("Resend API key updated.");
    } catch (err: any) {
      setSettingsError(err.message);
    } finally {
      setSettingsLoading(false);
    }
  };

  const updateResendSender = async () => {
    if (!senderEmail.trim().length) return;
    setSettingsSaved(null);
    setSettingsError(null);
    setSettingsLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token || "";
      if (!token) throw new Error("Unauthorized");

      const res = await fetch("/api/admin/resend-sender", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ senderEmail: senderEmail.trim() }),
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.message || "Failed to update sender");
      
      setSenderEffective(String(json.senderEmail || "") || null);
      setSenderStatus(String(json.status || "") || null);
      setSenderMessage(String(json.message || "") || null);
      setSettingsSaved("Sender email saved and verified.");
    } catch (err: any) {
      setSettingsError(err.message);
    } finally {
      setSettingsLoading(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 pb-10 lg:px-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="mt-1 text-sm text-white/60">Manage your branding, theme, and system integrations.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={loadSettings} disabled={settingsLoading}>
            Reload
          </Button>
          <Button onClick={handleSave} disabled={settingsLoading}>
            {settingsLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Global Alerts */}
      {settingsError && (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {settingsError}
        </div>
      )}
      {settingsSaved && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {settingsSaved}
        </div>
      )}

      {!settingsLoaded ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center text-sm text-white/40">
          Fetching settings...
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Brand Section */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-lg font-semibold text-white">Brand</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Select
                label="Header: Show brand icon"
                value={headerShowIcon ? "yes" : "no"}
                onChange={(e) => setHeaderShowIcon(e.target.value === "yes")}
                options={[
                  { value: "yes", label: "Yes (Show logo icon)" },
                  { value: "no", label: "No (Text only)" },
                ]}
              />
              <Select
                label="Footer: Show brand icon"
                value={footerShowIcon ? "yes" : "no"}
                onChange={(e) => setFooterShowIcon(e.target.value === "yes")}
                options={[
                  { value: "yes", label: "Yes (Show logo icon)" },
                  { value: "no", label: "No (Text only)" },
                ]}
              />
            </div>
            <p className="mt-4 text-xs text-white/40 leading-relaxed">
              When enabled, the brand logo asset will be displayed before the brand name "Coachflow Aquisition" in the navigation and footer.
            </p>
          </div>

          {/* Theme / Colors Section */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Theme / Colors</h2>
              <Button variant="secondary" size="sm" onClick={handleResetToClientPalette}>
                Reset to original client palette
              </Button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Select
                  label="Design preset"
                  value={designPreset}
                  onChange={() => setDesignPreset("landing_html_v1")}
                  options={[{ value: "landing_html_v1", label: "Landing (HTML v1)" }]}
                />
                <Select
                  label="Override with custom colors"
                  value={theme?.enabled ? "yes" : "no"}
                  onChange={(e) => setTheme((t) => ({ ...(t || defaultTheme), enabled: e.target.value === "yes" }))}
                  options={[
                    { value: "no", label: "No (Use canonical palette)" },
                    { value: "yes", label: "Yes (Custom)" },
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  label="Primary (Gold)"
                  value={theme?.colors.primary || ""}
                  onChange={(e) => setTheme((t) => ({ ...t!, colors: { ...t!.colors, primary: e.target.value } }))}
                />
                <Input
                  label="Accent (Light Gold)"
                  value={theme?.colors.accent || ""}
                  onChange={(e) => setTheme((t) => ({ ...t!, colors: { ...t!.colors, accent: e.target.value } }))}
                />
                <Input
                  label="Background (Black)"
                  value={theme?.colors.background || ""}
                  onChange={(e) => setTheme((t) => ({ ...t!, colors: { ...t!.colors, background: e.target.value } }))}
                />
                <Input
                  label="Surface (Charcoal)"
                  value={theme?.colors.surface || ""}
                  onChange={(e) => setTheme((t) => ({ ...t!, colors: { ...t!.colors, surface: e.target.value } }))}
                />
                <Input
                  label="Text (White/Off)"
                  value={theme?.colors.text || ""}
                  onChange={(e) => setTheme((t) => ({ ...t!, colors: { ...t!.colors, text: e.target.value } }))}
                />
                <Input
                  label="Border"
                  value={theme?.colors.border || ""}
                  onChange={(e) => setTheme((t) => ({ ...t!, colors: { ...t!.colors, border: e.target.value } }))}
                />
              </div>
            </div>
          </div>

          {/* Typography Section */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Typography</h2>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setTheme((t) => {
                    const next = mergeTheme(defaultTheme, t || defaultTheme);
                    return {
                      ...next,
                      typography: {
                        ...(next as any).typography,
                        scale: (defaultTheme as any)?.typography?.scale,
                      },
                    };
                  })
                }
              >
                Reset scale
              </Button>
            </div>
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                label="Heading font"
                value={theme?.typography?.headingFont || ""}
                onChange={(e) => setTheme((t) => ({ ...t!, typography: { ...t!.typography!, headingFont: e.target.value } }))}
                placeholder="e.g. Inter, system-ui"
              />
              <Input
                label="Body font"
                value={theme?.typography?.bodyFont || ""}
                onChange={(e) => setTheme((t) => ({ ...t!, typography: { ...t!.typography!, bodyFont: e.target.value } }))}
                placeholder="e.g. Inter, system-ui"
              />
            </div>

            <div className="mt-8 space-y-4">
              <div className="text-sm font-medium text-white/80">Typography Scale (Fluid)</div>
              {TYPOGRAPHY_TIERS.map((tier) => {
                const scale = mergeTypographyScale(theme?.typography?.scale || (defaultTheme as any)?.typography?.scale);
                const tierScale = scale[tier.key];
                const setTierValue = (token: string, value: string) => {
                  setTheme((t) => {
                    const next = mergeTheme(defaultTheme, t);
                    const nextScale = mergeTypographyScale(next.typography.scale);
                    return {
                      ...next,
                      typography: {
                        ...next.typography,
                        scale: { ...nextScale, [tier.key]: { ...(nextScale as any)[tier.key], [token]: value } },
                      },
                    };
                  });
                };

                return (
                  <div key={tier.key} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-medium text-white/60">{tier.label}</div>
                      {tier.minWidth && <div className="text-[10px] uppercase tracking-wider text-white/20">{tier.minWidth}px+</div>}
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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

          {/* Email & Integrations Section */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-6 text-lg font-semibold text-white">Email & Notifications</h2>
            
            <div className="space-y-8">
              {/* Admin Email */}
              <div className="space-y-4">
                <div className="text-sm font-medium text-white/80">Notification Delivery</div>
                <Input
                  label="Admin notification email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@yourdomain.com"
                />
                <p className="text-xs text-white/40">Leads captured through the landing page will be sent to this address.</p>
              </div>

              {/* Resend API Key */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="text-sm font-medium text-white/80">Resend API Key</div>
                <Input
                  label="API Key"
                  value={resendKeyDraft}
                  onChange={(e) => setResendKeyDraft(e.target.value)}
                  placeholder={resendMasked ? resendMasked : "re_********"}
                  type="password"
                  autoComplete="off"
                />
                <div className="flex items-center justify-between">
                   <span className="text-xs text-white/40">{resendMasked ? `Currently active: ${resendMasked}` : "No key configured"}</span>
                   <Button variant="secondary" size="sm" disabled={settingsLoading || !resendKeyDraft.trim().length} onClick={updateResendKey}>
                    Update Key
                  </Button>
                </div>
              </div>

              {/* Resend Sender */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="text-sm font-medium text-white/80">Verified Sender Email</div>
                <Input
                  label="Sender Address"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="notifications@yourdomain.com"
                />
                {(() => {
                  const v = validateSenderEmailBasic(senderEmail || senderEffective || "");
                  const status = String(senderStatus || "").toLowerCase();
                  if (!senderEmail.trim().length && !senderEffective) return null;
                  if (!v.ok) return <div className="rounded-lg bg-amber-500/10 p-3 text-xs text-amber-400">{v.message}</div>;
                  if (status === "verified") return <div className="rounded-lg bg-emerald-500/10 p-3 text-xs text-emerald-400">Verified sender active: {senderEffective || senderEmail}</div>;
                  return <div className="rounded-lg bg-amber-500/10 p-3 text-xs text-amber-400">{senderMessage || "Status unknown or not verified."}</div>;
                })()}
                <Button variant="secondary" className="w-full" disabled={settingsLoading || !senderEmail.trim().length} onClick={updateResendSender}>
                  Save & Verify Sender
                </Button>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button variant="secondary" className="h-12 px-8" onClick={loadSettings} disabled={settingsLoading}>
              Reload
            </Button>
            <Button className="h-12 px-12" onClick={handleSave} disabled={settingsLoading}>
              {settingsLoading ? "Saving..." : "Save All Changes"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
