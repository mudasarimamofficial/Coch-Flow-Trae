import type { SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { homepageDefaults, type HomepageContent } from "@/content/homepage";

type Props = {
  supabase: SupabaseClient;
};

type UploadTarget = { url: string; path?: string };

function sanitizePathSegment(v: string) {
  return v
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function mergeContent(c: Partial<HomepageContent> | null): HomepageContent {
  if (!c) return homepageDefaults;

  const mergeScale = (base: any, extra: any) => {
    const b = base || homepageDefaults.site.theme?.typography?.scale;
    const e = extra || {};
    return {
      mobile: { ...(b?.mobile || {}), ...(e.mobile || {}) },
      tablet: { ...(b?.tablet || {}), ...(e.tablet || {}) },
      laptop: { ...(b?.laptop || {}), ...(e.laptop || {}) },
      desktopLarge: { ...(b?.desktopLarge || {}), ...(e.desktopLarge || {}) },
    };
  };

  const mergeTheme = (base: any, extra: any) => {
    const b = base || homepageDefaults.site.theme;
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

  const mergeBranding = (base: any, extra: any) => {
    const b = base || homepageDefaults.branding;
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

  const mergeSocialLinksV2 = (
    base: HomepageContent["socialLinksV2"] | undefined,
    extra: HomepageContent["socialLinksV2"] | undefined,
  ) => {
    const b = Array.isArray(base) ? base : [];
    const e = Array.isArray(extra) ? extra : [];
    const byId = new Map<string, any>();
    for (const item of e) {
      const id = String((item as any)?.id || "").trim();
      if (!id) continue;
      byId.set(id, item);
    }
    const out: any[] = [];
    for (const preset of b) {
      const id = String((preset as any)?.id || "").trim();
      const override = id ? byId.get(id) : null;
      out.push(override ? { ...(preset as any), ...(override as any) } : preset);
      if (id) byId.delete(id);
    }
    for (const rest of byId.values()) out.push(rest);
    return out as HomepageContent["socialLinksV2"];
  };

  return {
    ...homepageDefaults,
    ...c,
    site: { ...homepageDefaults.site, ...(c.site || {}), theme: mergeTheme(homepageDefaults.site.theme, c.site?.theme) },
    branding: mergeBranding(homepageDefaults.branding, c.branding),
    header: {
      ...homepageDefaults.header,
      ...(c.header || {}),
      brandIcon: { ...homepageDefaults.header.brandIcon, ...(c.header?.brandIcon || {}) },
      primaryCta: { ...homepageDefaults.header.primaryCta, ...(c.header?.primaryCta || {}) },
      nav: { ...homepageDefaults.header.nav, ...(c.header?.nav || {}) },
    },
    hero: {
      ...homepageDefaults.hero,
      ...(c.hero || {}),
      badge: { ...homepageDefaults.hero.badge, ...(c.hero?.badge || {}) },
      heading: { ...homepageDefaults.hero.heading, ...(c.hero?.heading || {}) },
      primaryCta: { ...homepageDefaults.hero.primaryCta, ...(c.hero?.primaryCta || {}) },
      secondaryCta: { ...homepageDefaults.hero.secondaryCta, ...(c.hero?.secondaryCta || {}) },
      backgroundImage: c.hero?.backgroundImage || homepageDefaults.hero.backgroundImage,
    },
    trust: {
      ...homepageDefaults.trust,
      ...(c.trust || {}),
      icons: c.trust?.icons || homepageDefaults.trust.icons,
    },
    features: {
      ...homepageDefaults.features,
      ...(c.features || {}),
      cards: c.features?.cards || homepageDefaults.features.cards,
      backgroundImage: c.features?.backgroundImage || homepageDefaults.features.backgroundImage,
    },
    workflow: {
      ...homepageDefaults.workflow,
      ...(c.workflow || {}),
      steps: c.workflow?.steps || homepageDefaults.workflow.steps,
      backgroundImage: c.workflow?.backgroundImage || homepageDefaults.workflow.backgroundImage,
    },
    pricing: {
      ...homepageDefaults.pricing,
      ...(c.pricing || {}),
      tiers: c.pricing?.tiers || homepageDefaults.pricing.tiers,
      backgroundImage: c.pricing?.backgroundImage || homepageDefaults.pricing.backgroundImage,
    },
    application: {
      ...homepageDefaults.application,
      ...(c.application || {}),
      fields: {
        ...homepageDefaults.application.fields,
        ...(c.application?.fields || {}),
        revenueOptions: c.application?.fields?.revenueOptions || homepageDefaults.application.fields.revenueOptions,
      },
      backgroundImage: c.application?.backgroundImage || homepageDefaults.application.backgroundImage,
    },
    footer: {
      ...homepageDefaults.footer,
      ...(c.footer || {}),
      brandIcon: { ...homepageDefaults.footer.brandIcon, ...(c.footer?.brandIcon || {}) },
      links: c.footer?.links || homepageDefaults.footer.links,
    },
    socialLinks: c.socialLinks || homepageDefaults.socialLinks,
    socialLinksV2: mergeSocialLinksV2(homepageDefaults.socialLinksV2, c.socialLinksV2),
    whatsapp: {
      ...(homepageDefaults.whatsapp || {
        enabled: false,
        phone: "",
        message: "",
        tooltip: "Chat with us!",
        modalTitle: "CoachFlow AI",
        modalSubtitle: "Usually replies instantly",
        buttonText: "Start Chat",
        headerColorHex: "#25D366",
      }),
      ...(c.whatsapp || {}),
      enabled: c.whatsapp?.enabled ?? (homepageDefaults.whatsapp?.enabled ?? false),
      phone: c.whatsapp?.phone ?? (homepageDefaults.whatsapp?.phone ?? ""),
      message: c.whatsapp?.message ?? (homepageDefaults.whatsapp?.message ?? ""),
      tooltip: c.whatsapp?.tooltip ?? (homepageDefaults.whatsapp?.tooltip ?? "Chat with us!"),
      modalTitle: c.whatsapp?.modalTitle ?? (homepageDefaults.whatsapp?.modalTitle ?? "CoachFlow AI"),
      modalSubtitle:
        c.whatsapp?.modalSubtitle ?? (homepageDefaults.whatsapp?.modalSubtitle ?? "Usually replies instantly"),
      buttonText: c.whatsapp?.buttonText ?? (homepageDefaults.whatsapp?.buttonText ?? "Start Chat"),
      headerColorHex: c.whatsapp?.headerColorHex ?? (homepageDefaults.whatsapp?.headerColorHex || "#25D366"),
      avatar: c.whatsapp?.avatar || homepageDefaults.whatsapp?.avatar,
    },
    page: { sections: c.page?.sections || homepageDefaults.page?.sections || [] },
    customSections: c.customSections || homepageDefaults.customSections,
  };
}

export function HomepagePanel({ supabase }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [content, setContent] = useState<HomepageContent>(homepageDefaults);

  async function load() {
    setError(null);
    setSaved(null);
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("homepage_content")
        .select("content")
        .eq("id", 1)
        .maybeSingle();

      if (error) {
        setError(error.message);
        setContent(homepageDefaults);
        return;
      }

      const c = (data?.content as Partial<HomepageContent> | null) || null;
      setContent(mergeContent(c));
    } finally {
      setLoading(false);
    }
  }

  async function uploadFile(file: File, folder: string, previousPath?: string) {
    const safeName = sanitizePathSegment(file.name);
    const path = `${folder}/${Date.now()}-${safeName || "file"}`;

    const { error: uploadError } = await supabase.storage
      .from("homepage")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) throw uploadError;

    if (previousPath) {
      await supabase.storage.from("homepage").remove([previousPath]);
    }

    const { data } = supabase.storage.from("homepage").getPublicUrl(path);
    return { url: data.publicUrl, path } satisfies UploadTarget;
  }

  const revenueOptions = useMemo(
    () => content.application.fields.revenueOptions,
    [content.application.fields.revenueOptions],
  );

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-4 pb-10 lg:px-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Homepage Content</h1>
        <p className="mt-1 text-sm text-white/60">
          Edit homepage copy, icons, and media.
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

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <div className="flex flex-col gap-6">
          <div className="text-sm font-bold text-white">Site</div>
          <Input
            label="Favicon URL"
            value={content.site.favicon.url}
            onChange={(e) =>
              setContent((c) => ({
                ...c,
                site: { ...c.site, favicon: { ...c.site.favicon, url: e.target.value } },
              }))
            }
            placeholder="/favicon.ico"
          />
          <Input
            label="Upload favicon (image)"
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setError(null);
              try {
                const uploaded = await uploadFile(file, "favicon", content.site.favicon.path);
                setContent((c) => ({
                  ...c,
                  site: { ...c.site, favicon: { type: "image", ...uploaded } },
                }));
              } catch (err) {
                setError(err instanceof Error ? err.message : "Upload failed");
              } finally {
                e.target.value = "";
              }
            }}
          />

          <div className="text-sm font-bold">Header</div>
          <Input
            label="Brand text"
            value={content.header.brandText}
            onChange={(e) =>
              setContent((c) => ({ ...c, header: { ...c.header, brandText: e.target.value } }))
            }
          />
          <Select
            label="Brand icon type"
            value={content.header.brandIcon.type}
            onChange={(e) =>
              setContent((c) => ({
                ...c,
                header: {
                  ...c.header,
                  brandIcon: { ...c.header.brandIcon, type: e.target.value as "material" | "image" },
                },
              }))
            }
            options={[
              { value: "material", label: "Material icon" },
              { value: "image", label: "Image" },
            ]}
          />
          {content.header.brandIcon.type === "material" ? (
            <Input
              label="Brand icon name"
              value={content.header.brandIcon.name || ""}
              onChange={(e) =>
                setContent((c) => ({
                  ...c,
                  header: { ...c.header, brandIcon: { ...c.header.brandIcon, name: e.target.value } },
                }))
              }
              placeholder="psychology"
            />
          ) : (
            <div className="flex flex-col gap-3">
              <Input
                label="Brand image URL"
                value={content.header.brandIcon.url || ""}
                onChange={(e) =>
                  setContent((c) => ({
                    ...c,
                    header: { ...c.header, brandIcon: { ...c.header.brandIcon, url: e.target.value } },
                  }))
                }
              />
              <Input
                label="Upload brand image"
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setError(null);
                  try {
                    const uploaded = await uploadFile(file, "logo", content.header.brandIcon.path);
                    setContent((c) => ({
                      ...c,
                      header: {
                        ...c.header,
                        brandIcon: { ...c.header.brandIcon, ...uploaded, type: "image" },
                      },
                    }));
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Upload failed");
                  } finally {
                    e.target.value = "";
                  }
                }}
              />
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Input
              label="Primary CTA text"
              value={content.header.primaryCta.text}
              onChange={(e) =>
                setContent((c) => ({
                  ...c,
                  header: { ...c.header, primaryCta: { ...c.header.primaryCta, text: e.target.value } },
                }))
              }
            />
            <Input
              label="Primary CTA href"
              value={content.header.primaryCta.href}
              onChange={(e) =>
                setContent((c) => ({
                  ...c,
                  header: { ...c.header, primaryCta: { ...c.header.primaryCta, href: e.target.value } },
                }))
              }
            />
          </div>

          <div className="text-sm font-bold">Hero</div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Input
              label="Badge icon"
              value={content.hero.badge.icon}
              onChange={(e) =>
                setContent((c) => ({ ...c, hero: { ...c.hero, badge: { ...c.hero.badge, icon: e.target.value } } }))
              }
            />
            <Input
              label="Badge text"
              value={content.hero.badge.text}
              onChange={(e) =>
                setContent((c) => ({ ...c, hero: { ...c.hero, badge: { ...c.hero.badge, text: e.target.value } } }))
              }
            />
          </div>
          <Input
            label="Heading prefix"
            value={content.hero.heading.prefix}
            onChange={(e) =>
              setContent((c) => ({ ...c, hero: { ...c.hero, heading: { ...c.hero.heading, prefix: e.target.value } } }))
            }
          />
          <Input
            label="Heading highlight"
            value={content.hero.heading.highlight}
            onChange={(e) =>
              setContent((c) => ({ ...c, hero: { ...c.hero, heading: { ...c.hero.heading, highlight: e.target.value } } }))
            }
          />
          <Textarea
            label="Subcopy"
            value={content.hero.subcopy}
            onChange={(e) => setContent((c) => ({ ...c, hero: { ...c.hero, subcopy: e.target.value } }))}
            rows={3}
          />
          <Textarea
            label="Note"
            value={content.hero.note || ""}
            onChange={(e) =>
              setContent((c) => ({
                ...c,
                hero: { ...c.hero, note: e.target.value },
              }))
            }
            rows={2}
          />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Input
              label="Primary CTA text"
              value={content.hero.primaryCta.text}
              onChange={(e) =>
                setContent((c) => ({
                  ...c,
                  hero: { ...c.hero, primaryCta: { ...c.hero.primaryCta, text: e.target.value } },
                }))
              }
            />
            <Input
              label="Primary CTA icon"
              value={content.hero.primaryCta.icon}
              onChange={(e) =>
                setContent((c) => ({
                  ...c,
                  hero: { ...c.hero, primaryCta: { ...c.hero.primaryCta, icon: e.target.value } },
                }))
              }
            />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Input
              label="Secondary CTA text"
              value={content.hero.secondaryCta.text}
              onChange={(e) =>
                setContent((c) => ({
                  ...c,
                  hero: { ...c.hero, secondaryCta: { ...c.hero.secondaryCta, text: e.target.value } },
                }))
              }
            />
            <Input
              label="Secondary CTA href"
              value={content.hero.secondaryCta.href}
              onChange={(e) =>
                setContent((c) => ({
                  ...c,
                  hero: { ...c.hero, secondaryCta: { ...c.hero.secondaryCta, href: e.target.value } },
                }))
              }
            />
          </div>
          <Input
            label="Hero background image URL"
            value={content.hero.backgroundImage?.url || ""}
            onChange={(e) =>
              setContent((c) => ({
                ...c,
                hero: {
                  ...c.hero,
                  backgroundImage: e.target.value.trim().length
                    ? { url: e.target.value }
                    : undefined,
                },
              }))
            }
            placeholder="https://..."
          />
          <Input
            label="Upload hero background image"
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setError(null);
              try {
                const uploaded = await uploadFile(
                  file,
                  "backgrounds/hero",
                  content.hero.backgroundImage?.path,
                );
                setContent((c) => ({
                  ...c,
                  hero: { ...c.hero, backgroundImage: uploaded },
                }));
              } catch (err) {
                setError(err instanceof Error ? err.message : "Upload failed");
              } finally {
                e.target.value = "";
              }
            }}
          />

          <div className="text-sm font-bold">Trust</div>
          <Input
            label="Eyebrow"
            value={content.trust.eyebrow}
            onChange={(e) => setContent((c) => ({ ...c, trust: { ...c.trust, eyebrow: e.target.value } }))}
          />
          <div className="flex flex-col gap-3">
            {content.trust.icons.map((ic, idx) => (
              <div key={ic.path || ic.name || String(idx)} className="rounded-xl border border-slate-200 p-4 dark:border-white/10">
                <div className="mb-3 text-sm font-semibold">Icon {idx + 1}</div>
                <Select
                  label="Type"
                  value={ic.type}
                  onChange={(e) => {
                    const type = e.target.value as "material" | "image";
                    setContent((c) => {
                      const next = [...c.trust.icons];
                      next[idx] = { type, name: type === "material" ? (ic.name || "psychology_alt") : undefined, url: type === "image" ? ic.url : undefined, path: type === "image" ? ic.path : undefined };
                      return { ...c, trust: { ...c.trust, icons: next } };
                    });
                  }}
                  options={[
                    { value: "material", label: "Material icon" },
                    { value: "image", label: "Image" },
                  ]}
                />
                {ic.type === "material" ? (
                  <Input
                    label="Icon name"
                    value={ic.name || ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      setContent((c) => {
                        const next = [...c.trust.icons];
                        next[idx] = { ...next[idx], name: v };
                        return { ...c, trust: { ...c.trust, icons: next } };
                      });
                    }}
                    placeholder="sports_martial_arts"
                  />
                ) : (
                  <div className="flex flex-col gap-3">
                    <Input
                      label="Icon image URL"
                      value={ic.url || ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        setContent((c) => {
                          const next = [...c.trust.icons];
                          next[idx] = { ...next[idx], url: v };
                          return { ...c, trust: { ...c.trust, icons: next } };
                        });
                      }}
                    />
                    <Input
                      label="Upload icon image"
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setError(null);
                        try {
                          const uploaded = await uploadFile(file, "icons", ic.path);
                          setContent((c) => {
                            const next = [...c.trust.icons];
                            next[idx] = { type: "image", ...uploaded };
                            return { ...c, trust: { ...c.trust, icons: next } };
                          });
                        } catch (err) {
                          setError(err instanceof Error ? err.message : "Upload failed");
                        } finally {
                          e.target.value = "";
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-sm font-bold">Features</div>
          <Input
            label="Heading"
            value={content.features.heading}
            onChange={(e) => setContent((c) => ({ ...c, features: { ...c.features, heading: e.target.value } }))}
          />
          <Textarea
            label="Subcopy"
            value={content.features.subcopy}
            onChange={(e) => setContent((c) => ({ ...c, features: { ...c.features, subcopy: e.target.value } }))}
            rows={2}
          />
          <Input
            label="Features background image URL"
            value={content.features.backgroundImage?.url || ""}
            onChange={(e) =>
              setContent((c) => ({
                ...c,
                features: {
                  ...c.features,
                  backgroundImage: e.target.value.trim().length
                    ? { url: e.target.value }
                    : undefined,
                },
              }))
            }
            placeholder="https://..."
          />
          <Input
            label="Upload features background image"
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setError(null);
              try {
                const uploaded = await uploadFile(
                  file,
                  "backgrounds/features",
                  content.features.backgroundImage?.path,
                );
                setContent((c) => ({
                  ...c,
                  features: { ...c.features, backgroundImage: uploaded },
                }));
              } catch (err) {
                setError(err instanceof Error ? err.message : "Upload failed");
              } finally {
                e.target.value = "";
              }
            }}
          />
          <div className="flex flex-col gap-3">
            {content.features.cards.map((card, idx) => (
              <div key={card.title} className="rounded-xl border border-slate-200 p-4 dark:border-white/10">
                <div className="mb-3 text-sm font-semibold">Card {idx + 1}</div>
                <Input
                  label="Icon"
                  value={card.icon}
                  onChange={(e) => {
                    const v = e.target.value;
                    setContent((c) => {
                      const cards = [...c.features.cards];
                      cards[idx] = { ...cards[idx], icon: v };
                      return { ...c, features: { ...c.features, cards } };
                    });
                  }}
                />
                <Input
                  label="Title"
                  value={card.title}
                  onChange={(e) => {
                    const v = e.target.value;
                    setContent((c) => {
                      const cards = [...c.features.cards];
                      cards[idx] = { ...cards[idx], title: v };
                      return { ...c, features: { ...c.features, cards } };
                    });
                  }}
                />
                <Textarea
                  label="Copy"
                  value={card.copy}
                  onChange={(e) => {
                    const v = e.target.value;
                    setContent((c) => {
                      const cards = [...c.features.cards];
                      cards[idx] = { ...cards[idx], copy: v };
                      return { ...c, features: { ...c.features, cards } };
                    });
                  }}
                  rows={2}
                />
              </div>
            ))}
          </div>

          <div className="text-sm font-bold">Workflow</div>
          <Input
            label="Heading"
            value={content.workflow.heading}
            onChange={(e) => setContent((c) => ({ ...c, workflow: { ...c.workflow, heading: e.target.value } }))}
          />
          <Textarea
            label="Subcopy"
            value={content.workflow.subcopy}
            onChange={(e) => setContent((c) => ({ ...c, workflow: { ...c.workflow, subcopy: e.target.value } }))}
            rows={2}
          />
          <Input
            label="Workflow background image URL"
            value={content.workflow.backgroundImage?.url || ""}
            onChange={(e) =>
              setContent((c) => ({
                ...c,
                workflow: {
                  ...c.workflow,
                  backgroundImage: e.target.value.trim().length
                    ? { url: e.target.value }
                    : undefined,
                },
              }))
            }
            placeholder="https://..."
          />
          <Input
            label="Upload workflow background image"
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setError(null);
              try {
                const uploaded = await uploadFile(
                  file,
                  "backgrounds/workflow",
                  content.workflow.backgroundImage?.path,
                );
                setContent((c) => ({
                  ...c,
                  workflow: { ...c.workflow, backgroundImage: uploaded },
                }));
              } catch (err) {
                setError(err instanceof Error ? err.message : "Upload failed");
              } finally {
                e.target.value = "";
              }
            }}
          />
          <Input
            label="Expand icon"
            value={content.workflow.expandIcon}
            onChange={(e) => setContent((c) => ({ ...c, workflow: { ...c.workflow, expandIcon: e.target.value } }))}
          />
          <div className="flex flex-col gap-3">
            {content.workflow.steps.map((step, idx) => (
              <div key={step.title} className="rounded-xl border border-slate-200 p-4 dark:border-white/10">
                <div className="mb-3 text-sm font-semibold">Step {idx + 1}</div>
                <Input
                  label="Title"
                  value={step.title}
                  onChange={(e) => {
                    const v = e.target.value;
                    setContent((c) => {
                      const steps = [...c.workflow.steps];
                      steps[idx] = { ...steps[idx], title: v };
                      return { ...c, workflow: { ...c.workflow, steps } };
                    });
                  }}
                />
                <Textarea
                  label="Copy"
                  value={step.copy}
                  onChange={(e) => {
                    const v = e.target.value;
                    setContent((c) => {
                      const steps = [...c.workflow.steps];
                      steps[idx] = { ...steps[idx], copy: v };
                      return { ...c, workflow: { ...c.workflow, steps } };
                    });
                  }}
                  rows={2}
                />
                <Select
                  label="Open by default"
                  value={step.open ? "yes" : "no"}
                  onChange={(e) => {
                    const open = e.target.value === "yes";
                    setContent((c) => {
                      const steps = [...c.workflow.steps];
                      steps[idx] = { ...steps[idx], open };
                      return { ...c, workflow: { ...c.workflow, steps } };
                    });
                  }}
                  options={[
                    { value: "yes", label: "Yes" },
                    { value: "no", label: "No" },
                  ]}
                />
              </div>
            ))}
          </div>

          <div className="text-sm font-bold">Pricing</div>
          <Input
            label="Heading"
            value={content.pricing.heading}
            onChange={(e) => setContent((c) => ({ ...c, pricing: { ...c.pricing, heading: e.target.value } }))}
          />
          <Textarea
            label="Subcopy"
            value={content.pricing.subcopy}
            onChange={(e) => setContent((c) => ({ ...c, pricing: { ...c.pricing, subcopy: e.target.value } }))}
            rows={2}
          />
          <Textarea
            label="Bottom note"
            value={content.pricing.note || ""}
            onChange={(e) =>
              setContent((c) => ({
                ...c,
                pricing: { ...c.pricing, note: e.target.value },
              }))
            }
            rows={2}
          />
          <Input
            label="Pricing background image URL"
            value={content.pricing.backgroundImage?.url || ""}
            onChange={(e) =>
              setContent((c) => ({
                ...c,
                pricing: {
                  ...c.pricing,
                  backgroundImage: e.target.value.trim().length
                    ? { url: e.target.value }
                    : undefined,
                },
              }))
            }
            placeholder="https://..."
          />
          <Input
            label="Upload pricing background image"
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setError(null);
              try {
                const uploaded = await uploadFile(
                  file,
                  "backgrounds/pricing",
                  content.pricing.backgroundImage?.path,
                );
                setContent((c) => ({
                  ...c,
                  pricing: { ...c.pricing, backgroundImage: uploaded },
                }));
              } catch (err) {
                setError(err instanceof Error ? err.message : "Upload failed");
              } finally {
                e.target.value = "";
              }
            }}
          />
          <Input
            label="Bullet icon"
            value={content.pricing.bulletIcon}
            onChange={(e) => setContent((c) => ({ ...c, pricing: { ...c.pricing, bulletIcon: e.target.value } }))}
          />
          <div className="flex flex-col gap-3">
            {content.pricing.tiers.map((tier, idx) => (
              <div key={tier.name} className="rounded-xl border border-slate-200 p-4 dark:border-white/10">
                <div className="mb-3 text-sm font-semibold">Tier {idx + 1}</div>
                <Input
                  label="Name"
                  value={tier.name}
                  onChange={(e) => {
                    const v = e.target.value;
                    setContent((c) => {
                      const tiers = [...c.pricing.tiers];
                      tiers[idx] = { ...tiers[idx], name: v };
                      return { ...c, pricing: { ...c.pricing, tiers } };
                    });
                  }}
                />
                <Input
                  label="Tagline"
                  value={tier.tagline}
                  onChange={(e) => {
                    const v = e.target.value;
                    setContent((c) => {
                      const tiers = [...c.pricing.tiers];
                      tiers[idx] = { ...tiers[idx], tagline: v };
                      return { ...c, pricing: { ...c.pricing, tiers } };
                    });
                  }}
                />
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <Input
                    label="Price"
                    value={tier.price}
                    onChange={(e) => {
                      const v = e.target.value;
                      setContent((c) => {
                        const tiers = [...c.pricing.tiers];
                        tiers[idx] = { ...tiers[idx], price: v };
                        return { ...c, pricing: { ...c.pricing, tiers } };
                      });
                    }}
                  />
                  <Input
                    label="Price suffix"
                    value={tier.priceSuffix || ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      setContent((c) => {
                        const tiers = [...c.pricing.tiers];
                        tiers[idx] = { ...tiers[idx], priceSuffix: v || undefined };
                        return { ...c, pricing: { ...c.pricing, tiers } };
                      });
                    }}
                    placeholder="/mo"
                  />
                </div>
                <Textarea
                  label="Bullets (one per line)"
                  value={tier.bullets.join("\n")}
                  onChange={(e) => {
                    const lines = e.target.value.split("\n").map((x) => x.trim()).filter(Boolean);
                    setContent((c) => {
                      const tiers = [...c.pricing.tiers];
                      tiers[idx] = { ...tiers[idx], bullets: lines };
                      return { ...c, pricing: { ...c.pricing, tiers } };
                    });
                  }}
                  rows={4}
                />
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <Input
                    label="CTA text"
                    value={tier.ctaText}
                    onChange={(e) => {
                      const v = e.target.value;
                      setContent((c) => {
                        const tiers = [...c.pricing.tiers];
                        tiers[idx] = { ...tiers[idx], ctaText: v };
                        return { ...c, pricing: { ...c.pricing, tiers } };
                      });
                    }}
                  />
                  <Input
                    label="CTA href"
                    value={tier.ctaHref}
                    onChange={(e) => {
                      const v = e.target.value;
                      setContent((c) => {
                        const tiers = [...c.pricing.tiers];
                        tiers[idx] = { ...tiers[idx], ctaHref: v };
                        return { ...c, pricing: { ...c.pricing, tiers } };
                      });
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="text-sm font-bold">Application</div>
          <Input
            label="Heading"
            value={content.application.heading}
            onChange={(e) => setContent((c) => ({ ...c, application: { ...c.application, heading: e.target.value } }))}
          />
          <Textarea
            label="Subcopy"
            value={content.application.subcopy}
            onChange={(e) => setContent((c) => ({ ...c, application: { ...c.application, subcopy: e.target.value } }))}
            rows={2}
          />
          <Input
            label="Application background image URL"
            value={content.application.backgroundImage?.url || ""}
            onChange={(e) =>
              setContent((c) => ({
                ...c,
                application: {
                  ...c.application,
                  backgroundImage: e.target.value.trim().length
                    ? { url: e.target.value }
                    : undefined,
                },
              }))
            }
            placeholder="https://..."
          />
          <Input
            label="Upload application background image"
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setError(null);
              try {
                const uploaded = await uploadFile(
                  file,
                  "backgrounds/application",
                  content.application.backgroundImage?.path,
                );
                setContent((c) => ({
                  ...c,
                  application: { ...c.application, backgroundImage: uploaded },
                }));
              } catch (err) {
                setError(err instanceof Error ? err.message : "Upload failed");
              } finally {
                e.target.value = "";
              }
            }}
          />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Input
              label="First name label"
              value={content.application.fields.firstNameLabel}
              onChange={(e) =>
                setContent((c) => ({
                  ...c,
                  application: {
                    ...c.application,
                    fields: { ...c.application.fields, firstNameLabel: e.target.value },
                  },
                }))
              }
            />
            <Input
              label="Last name label"
              value={content.application.fields.lastNameLabel}
              onChange={(e) =>
                setContent((c) => ({
                  ...c,
                  application: {
                    ...c.application,
                    fields: { ...c.application.fields, lastNameLabel: e.target.value },
                  },
                }))
              }
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Input
              label="First name placeholder"
              value={content.application.fields.firstNamePlaceholder || ""}
              onChange={(e) =>
                setContent((c) => ({
                  ...c,
                  application: {
                    ...c.application,
                    fields: { ...c.application.fields, firstNamePlaceholder: e.target.value },
                  },
                }))
              }
              placeholder="Hamza"
            />
            <Input
              label="Last name placeholder"
              value={content.application.fields.lastNamePlaceholder || ""}
              onChange={(e) =>
                setContent((c) => ({
                  ...c,
                  application: {
                    ...c.application,
                    fields: { ...c.application.fields, lastNamePlaceholder: e.target.value },
                  },
                }))
              }
              placeholder="Mukhtar"
            />
          </div>

          <Input
            label="Email label"
            value={content.application.fields.emailLabel}
            onChange={(e) =>
              setContent((c) => ({
                ...c,
                application: {
                  ...c.application,
                  fields: { ...c.application.fields, emailLabel: e.target.value },
                },
              }))
            }
          />
          <Input
            label="Email placeholder"
            value={content.application.fields.emailPlaceholder || ""}
            onChange={(e) =>
              setContent((c) => ({
                ...c,
                application: {
                  ...c.application,
                  fields: { ...c.application.fields, emailPlaceholder: e.target.value },
                },
              }))
            }
            placeholder="you@example.com"
          />
          <Input
            label="Revenue label"
            value={content.application.fields.revenueLabel}
            onChange={(e) =>
              setContent((c) => ({
                ...c,
                application: {
                  ...c.application,
                  fields: { ...c.application.fields, revenueLabel: e.target.value },
                },
              }))
            }
          />
          <Input
            label="Revenue placeholder"
            value={content.application.fields.revenuePlaceholder || ""}
            onChange={(e) =>
              setContent((c) => ({
                ...c,
                application: {
                  ...c.application,
                  fields: { ...c.application.fields, revenuePlaceholder: e.target.value },
                },
              }))
            }
            placeholder="Select your range"
          />
          <Textarea
            label="Bottleneck label"
            value={content.application.fields.bottleneckLabel}
            onChange={(e) =>
              setContent((c) => ({
                ...c,
                application: {
                  ...c.application,
                  fields: { ...c.application.fields, bottleneckLabel: e.target.value },
                },
              }))
            }
            rows={2}
          />
          <Textarea
            label="Revenue options (JSON)"
            value={JSON.stringify(revenueOptions, null, 2)}
            onChange={(e) => {
              try {
                const next = JSON.parse(e.target.value) as { value: string; label: string }[];
                if (!Array.isArray(next)) return;
                setContent((c) => ({
                  ...c,
                  application: {
                    ...c.application,
                    fields: { ...c.application.fields, revenueOptions: next },
                  },
                }));
              } catch {
              }
            }}
            rows={6}
          />

          <div className="text-sm font-bold">Social Links</div>
          <Textarea
            label="Social links (JSON)"
            value={JSON.stringify(content.socialLinks || [], null, 2)}
            onChange={(e) => {
              try {
                const next = JSON.parse(e.target.value) as {
                  label: string;
                  href: string;
                  icon?: { type: "material" | "image"; name?: string; url?: string; path?: string };
                }[];
                if (!Array.isArray(next)) return;
                setContent((c) => ({ ...c, socialLinks: next }));
              } catch {
              }
            }}
            rows={8}
          />

          <div className="text-sm font-bold">WhatsApp Widget</div>
          <Select
            label="Enabled"
            value={content.whatsapp?.enabled ? "yes" : "no"}
            onChange={(e) => {
              const enabled = e.target.value === "yes";
              setContent((c) => ({
                ...c,
                whatsapp: {
                  enabled,
                  phone: c.whatsapp?.phone || "",
                  message: c.whatsapp?.message || "",
                  avatar: c.whatsapp?.avatar,
                  tooltip: c.whatsapp?.tooltip || "Chat with us!",
                  modalTitle: c.whatsapp?.modalTitle || c.header.brandText,
                  modalSubtitle: c.whatsapp?.modalSubtitle || "Usually replies instantly",
                  buttonText: c.whatsapp?.buttonText || "Start Chat",
                  headerColorHex: c.whatsapp?.headerColorHex || "#25D366",
                },
              }));
            }}
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ]}
          />
          <Input
            label="Phone"
            value={content.whatsapp?.phone || ""}
            onChange={(e) =>
              setContent((c) => ({
                ...c,
                whatsapp: {
                  enabled: c.whatsapp?.enabled ?? true,
                  phone: e.target.value,
                  message: c.whatsapp?.message || "",
                  avatar: c.whatsapp?.avatar,
                  tooltip: c.whatsapp?.tooltip || "Chat with us!",
                  modalTitle: c.whatsapp?.modalTitle || c.header.brandText,
                  modalSubtitle: c.whatsapp?.modalSubtitle || "Usually replies instantly",
                  buttonText: c.whatsapp?.buttonText || "Start Chat",
                  headerColorHex: c.whatsapp?.headerColorHex || "#25D366",
                },
              }))
            }
            placeholder="+923XXXXXXXXX"
          />
          <Textarea
            label="Prefilled message"
            value={content.whatsapp?.message || ""}
            onChange={(e) =>
              setContent((c) => ({
                ...c,
                whatsapp: {
                  enabled: c.whatsapp?.enabled ?? true,
                  phone: c.whatsapp?.phone || "",
                  message: e.target.value,
                  avatar: c.whatsapp?.avatar,
                  tooltip: c.whatsapp?.tooltip || "Chat with us!",
                  modalTitle: c.whatsapp?.modalTitle || c.header.brandText,
                  modalSubtitle: c.whatsapp?.modalSubtitle || "Usually replies instantly",
                  buttonText: c.whatsapp?.buttonText || "Start Chat",
                  headerColorHex: c.whatsapp?.headerColorHex || "#25D366",
                },
              }))
            }
            rows={3}
          />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Input
              label="Tooltip"
              value={content.whatsapp?.tooltip || ""}
              onChange={(e) =>
                setContent((c) => ({
                  ...c,
                  whatsapp: {
                    enabled: c.whatsapp?.enabled ?? true,
                    phone: c.whatsapp?.phone || "",
                    message: c.whatsapp?.message || "",
                    avatar: c.whatsapp?.avatar,
                    tooltip: e.target.value,
                    modalTitle: c.whatsapp?.modalTitle || c.header.brandText,
                    modalSubtitle: c.whatsapp?.modalSubtitle || "Usually replies instantly",
                    buttonText: c.whatsapp?.buttonText || "Start Chat",
                    headerColorHex: c.whatsapp?.headerColorHex || "#25D366",
                  },
                }))
              }
            />
            <Input
              label="Button text"
              value={content.whatsapp?.buttonText || ""}
              onChange={(e) =>
                setContent((c) => ({
                  ...c,
                  whatsapp: {
                    enabled: c.whatsapp?.enabled ?? true,
                    phone: c.whatsapp?.phone || "",
                    message: c.whatsapp?.message || "",
                    avatar: c.whatsapp?.avatar,
                    tooltip: c.whatsapp?.tooltip || "Chat with us!",
                    modalTitle: c.whatsapp?.modalTitle || c.header.brandText,
                    modalSubtitle: c.whatsapp?.modalSubtitle || "Usually replies instantly",
                    buttonText: e.target.value,
                    headerColorHex: c.whatsapp?.headerColorHex || "#25D366",
                  },
                }))
              }
            />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Input
              label="Modal title"
              value={content.whatsapp?.modalTitle || ""}
              onChange={(e) =>
                setContent((c) => ({
                  ...c,
                  whatsapp: {
                    enabled: c.whatsapp?.enabled ?? true,
                    phone: c.whatsapp?.phone || "",
                    message: c.whatsapp?.message || "",
                    avatar: c.whatsapp?.avatar,
                    tooltip: c.whatsapp?.tooltip || "Chat with us!",
                    modalTitle: e.target.value,
                    modalSubtitle: c.whatsapp?.modalSubtitle || "Usually replies instantly",
                    buttonText: c.whatsapp?.buttonText || "Start Chat",
                    headerColorHex: c.whatsapp?.headerColorHex || "#25D366",
                  },
                }))
              }
            />
            <Input
              label="Modal subtitle"
              value={content.whatsapp?.modalSubtitle || ""}
              onChange={(e) =>
                setContent((c) => ({
                  ...c,
                  whatsapp: {
                    enabled: c.whatsapp?.enabled ?? true,
                    phone: c.whatsapp?.phone || "",
                    message: c.whatsapp?.message || "",
                    avatar: c.whatsapp?.avatar,
                    tooltip: c.whatsapp?.tooltip || "Chat with us!",
                    modalTitle: c.whatsapp?.modalTitle || c.header.brandText,
                    modalSubtitle: e.target.value,
                    buttonText: c.whatsapp?.buttonText || "Start Chat",
                    headerColorHex: c.whatsapp?.headerColorHex || "#25D366",
                  },
                }))
              }
            />
          </div>
          <Input
            label="Header color"
            value={content.whatsapp?.headerColorHex || ""}
            onChange={(e) =>
              setContent((c) => ({
                ...c,
                whatsapp: {
                  enabled: c.whatsapp?.enabled ?? true,
                  phone: c.whatsapp?.phone || "",
                  message: c.whatsapp?.message || "",
                  avatar: c.whatsapp?.avatar,
                  tooltip: c.whatsapp?.tooltip || "Chat with us!",
                  modalTitle: c.whatsapp?.modalTitle || c.header.brandText,
                  modalSubtitle: c.whatsapp?.modalSubtitle || "Usually replies instantly",
                  buttonText: c.whatsapp?.buttonText || "Start Chat",
                  headerColorHex: e.target.value,
                },
              }))
            }
            placeholder="#25D366"
          />
          <Input
            label="Avatar URL"
            value={content.whatsapp?.avatar?.url || ""}
            onChange={(e) =>
              setContent((c) => ({
                ...c,
                whatsapp: {
                  enabled: c.whatsapp?.enabled ?? true,
                  phone: c.whatsapp?.phone || "",
                  message: c.whatsapp?.message || "",
                  avatar: e.target.value.trim().length ? { url: e.target.value, path: c.whatsapp?.avatar?.path } : undefined,
                  tooltip: c.whatsapp?.tooltip || "Chat with us!",
                  modalTitle: c.whatsapp?.modalTitle || c.header.brandText,
                  modalSubtitle: c.whatsapp?.modalSubtitle || "Usually replies instantly",
                  buttonText: c.whatsapp?.buttonText || "Start Chat",
                  headerColorHex: c.whatsapp?.headerColorHex || "#25D366",
                },
              }))
            }
          />
          <Input
            label="Upload avatar"
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setError(null);
              try {
                const uploaded = await uploadFile(file, "whatsapp/avatar", content.whatsapp?.avatar?.path);
                setContent((c) => ({
                  ...c,
                  whatsapp: {
                    enabled: c.whatsapp?.enabled ?? true,
                    phone: c.whatsapp?.phone || "",
                    message: c.whatsapp?.message || "",
                    avatar: uploaded,
                    tooltip: c.whatsapp?.tooltip || "Chat with us!",
                    modalTitle: c.whatsapp?.modalTitle || c.header.brandText,
                    modalSubtitle: c.whatsapp?.modalSubtitle || "Usually replies instantly",
                    buttonText: c.whatsapp?.buttonText || "Start Chat",
                    headerColorHex: c.whatsapp?.headerColorHex || "#25D366",
                  },
                }));
              } catch (err) {
                setError(err instanceof Error ? err.message : "Upload failed");
              } finally {
                e.target.value = "";
              }
            }}
          />

          <div className="text-sm font-bold">Footer</div>
          <Textarea
            label="Copyright"
            value={content.footer.copyright}
            onChange={(e) => setContent((c) => ({ ...c, footer: { ...c.footer, copyright: e.target.value } }))}
            rows={2}
          />

          <div className="flex items-center gap-3">
            <Button
              className="h-12"
              disabled={loading || saving}
              onClick={async () => {
                setSaved(null);
                setError(null);
                setSaving(true);
                try {
                  const { error } = await supabase
                    .from("homepage_content")
                    .upsert({ id: 1, content }, { onConflict: "id" });
                  if (error) {
                    setError(error.message);
                    return;
                  }
                  setSaved("Saved");
                } finally {
                  setSaving(false);
                }
              }}
            >
              Save
            </Button>
            <Button variant="secondary" className="h-12" onClick={load} disabled={loading || saving}>
              Reload
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
