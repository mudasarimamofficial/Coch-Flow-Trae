"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { homepageDefaults, type HomepageContent } from "@/content/homepage";
import { MaterialIcon } from "@/components/ui/MaterialIcon";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Trust } from "@/components/landing/Trust";
import { Features } from "@/components/landing/Features";
import { Workflow } from "@/components/landing/Workflow";
import { Pricing } from "@/components/landing/Pricing";
import { LeadFormSection } from "@/components/landing/LeadFormSection";
import { Footer } from "@/components/landing/Footer";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { CustomHtmlSection } from "@/components/landing/CustomHtmlSection";
import { IconPicker, type IconRef } from "@/components/admin/builder/IconPicker";
import { MediaPickerModal } from "@/components/admin/builder/MediaPickerModal";
import { applyBuilderOverrides } from "@/utils/homepageBuilder";

type Props = {
  supabase: SupabaseClient;
};

type PreviewMode = "desktop" | "tablet" | "mobile";
type MobilePane = "preview" | "sections" | "inspector";

type PageSection = NonNullable<HomepageContent["page"]>["sections"][number];

type SectionItem = {
  id: string;
  type:
    | NonNullable<HomepageContent["page"]>["sections"][number]["type"]
    | "whatsapp";
  enabled: boolean;
};

function mergeContent(c: Partial<HomepageContent> | null): HomepageContent {
  if (!c) return homepageDefaults;
  return {
    ...homepageDefaults,
    ...c,
    site: { ...homepageDefaults.site, ...(c.site || {}) },
    header: {
      ...homepageDefaults.header,
      ...(c.header || {}),
      brandIcon: { ...homepageDefaults.header.brandIcon, ...(c.header?.brandIcon || {}) },
      primaryCta: { ...homepageDefaults.header.primaryCta, ...(c.header?.primaryCta || {}) },
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
    trust: { ...homepageDefaults.trust, ...(c.trust || {}), icons: c.trust?.icons || homepageDefaults.trust.icons },
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
    socialLinksV2: c.socialLinksV2 || homepageDefaults.socialLinksV2,
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

function SectionRow({ item, selected, onSelect, onToggle, onDuplicate }: {
  item: SectionItem;
  selected: boolean;
  onSelect: () => void;
  onToggle: () => void;
  onDuplicate?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as const;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={
        selected
          ? "flex items-center gap-2 rounded-lg border border-[#0fa3a3]/40 bg-[#0fa3a3]/10 px-3 py-2"
          : "flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-[#112121]"
      }
    >
      <button
        type="button"
        className="cursor-grab text-slate-400 active:cursor-grabbing"
        {...attributes}
        {...listeners}
        aria-label="Drag"
      >
        <MaterialIcon name="drag_indicator" className="text-[20px]" />
      </button>
      <button type="button" className="flex-1 text-left text-sm font-semibold" onClick={onSelect}>
        {item.type}
      </button>
      {onDuplicate ? (
        <button
          type="button"
          className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          onClick={onDuplicate}
          aria-label="Duplicate"
        >
          <MaterialIcon name="content_copy" className="text-[20px]" />
        </button>
      ) : null}
      <button
        type="button"
        className={item.enabled ? "text-[#0fa3a3]" : "text-slate-400"}
        onClick={onToggle}
        aria-label="Toggle"
      >
        <MaterialIcon name={item.enabled ? "visibility" : "visibility_off"} className="text-[20px]" />
      </button>
      {isDragging ? <span className="sr-only">Dragging</span> : null}
    </div>
  );
}

function BlockRow({ id, title, selected, onSelect, onDuplicate, onRemove }: {
  id: string;
  title: string;
  selected: boolean;
  onSelect: () => void;
  onDuplicate?: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as const;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={
        selected
          ? "flex items-center gap-2 rounded-lg border border-[#0fa3a3]/40 bg-[#0fa3a3]/10 px-3 py-2"
          : "flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-[#0b1414]"
      }
    >
      <button
        type="button"
        className="cursor-grab text-slate-400 active:cursor-grabbing"
        {...attributes}
        {...listeners}
        aria-label="Drag"
      >
        <MaterialIcon name="drag_indicator" className="text-[20px]" />
      </button>
      <button type="button" className="flex-1 text-left text-sm font-semibold" onClick={onSelect}>
        {title}
      </button>
      {onDuplicate ? (
        <button
          type="button"
          className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          onClick={onDuplicate}
          aria-label="Duplicate"
        >
          <MaterialIcon name="content_copy" className="text-[20px]" />
        </button>
      ) : null}
      <button type="button" className="text-slate-400 hover:text-rose-500" onClick={onRemove} aria-label="Delete">
        <MaterialIcon name="delete" className="text-[20px]" />
      </button>
    </div>
  );
}

export function VisualBuilderPanel({ supabase }: Props) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [mode, setMode] = useState<PreviewMode>("desktop");
  const [mobilePane, setMobilePane] = useState<MobilePane>("preview");
  const [selectedId, setSelectedId] = useState<string>("hero");
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [addType, setAddType] = useState<string>("hero");
  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaTitle, setMediaTitle] = useState("Pick media");
  const [mediaAccept, setMediaAccept] = useState<string | undefined>("image/*");
  const mediaPickRef = useRef<null | ((asset: { url: string; path: string }) => void)>(null);

  const [published, setPublished] = useState<HomepageContent>(homepageDefaults);
  const [draft, setDraft] = useState<HomepageContent | null>(null);
  const [publishedUpdatedAt, setPublishedUpdatedAt] = useState<string | null>(null);

  const historyRef = useRef<HomepageContent[]>([]);
  const futureRef = useRef<HomepageContent[]>([]);
  const [historySize, setHistorySize] = useState(0);
  const [futureSize, setFutureSize] = useState(0);
  const historyBatchRef = useRef(false);

  const content = draft || published;
  const resolved = applyBuilderOverrides(content);
  const contentRef = useRef<HomepageContent>(content);
  useEffect(() => {
    contentRef.current = content;
  }, [content]);
  const draftSaveTimer = useRef<number | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const cloneContent = useCallback((v: HomepageContent): HomepageContent => {
    return JSON.parse(JSON.stringify(v)) as HomepageContent;
  }, []);

  const resetHistory = useCallback(() => {
    historyRef.current = [];
    futureRef.current = [];
    setHistorySize(0);
    setFutureSize(0);
    historyBatchRef.current = false;
  }, []);

  const loadLandingPreset = useCallback(() => {
    const base = cloneContent(homepageDefaults);
    const current = cloneContent(contentRef.current);

    base.site = {
      ...base.site,
      favicon: current.site?.favicon || base.site.favicon,
      customCss: current.site?.customCss || base.site.customCss,
      customJs: current.site?.customJs || base.site.customJs,
    };
    base.socialLinks = current.socialLinks;
    base.socialLinksV2 = current.socialLinksV2;
    base.whatsapp = current.whatsapp;

    setDraft(base);
    setSelectedId("hero");
    setSelectedBlockId(null);
    resetHistory();
    setNotice("Landing preset loaded (not published). Save Draft to keep it.");
  }, [cloneContent, resetHistory]);

  const pageSections: PageSection[] = useMemo(() => {
    const list = content.page?.sections?.length ? content.page.sections : homepageDefaults.page!.sections;
    return list as PageSection[];
  }, [content.page?.sections]);

  const sectionItems: SectionItem[] = useMemo(() => {
    return [
      ...pageSections.map((s) => ({ id: s.id, type: s.type, enabled: s.enabled })),
      { id: "__whatsapp", type: "whatsapp", enabled: Boolean(content.whatsapp?.enabled) },
    ];
  }, [pageSections, content.whatsapp?.enabled]);

  async function loadAll() {
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      const pub = await supabase
        .from("homepage_content")
        .select("content, updated_at")
        .eq("id", 1)
        .single();
      if (pub.error) {
        setError(pub.error.message);
        return;
      }
      setPublishedUpdatedAt(pub.data.updated_at);
      setPublished(mergeContent(pub.data.content as Partial<HomepageContent>));

      const dr = await supabase
        .from("homepage_content_drafts")
        .select("content, published_updated_at")
        .eq("id", 1)
        .maybeSingle();
      if (dr.error) {
        setDraft(null);
        return;
      }
      const c = (dr.data?.content as Partial<HomepageContent> | null) || null;
      const has = c && Object.keys(c).length;
      setDraft(has ? mergeContent(c) : null);
      if (dr.data?.published_updated_at) setPublishedUpdatedAt(dr.data.published_updated_at);
      resetHistory();
    } finally {
      setLoading(false);
    }
  }

  async function saveDraft(next: HomepageContent) {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const { error } = await supabase
        .from("homepage_content_drafts")
        .upsert({ id: 1, content: next, published_updated_at: publishedUpdatedAt }, { onConflict: "id" });
      if (error) {
        setError(error.message);
        return;
      }
      setNotice("Draft saved");
    } finally {
      setSaving(false);
    }
  }

  async function publishNow() {
    if (!draft) return;
    setPublishing(true);
    setError(null);
    setNotice(null);
    try {
      const latest = await supabase
        .from("homepage_content")
        .select("updated_at")
        .eq("id", 1)
        .single();
      if (latest.error) {
        setError(latest.error.message);
        return;
      }

      if (publishedUpdatedAt && latest.data.updated_at !== publishedUpdatedAt) {
        setError("Publish conflict: the homepage was updated by another session.");
        return;
      }

      const upd = await supabase
        .from("homepage_content")
        .update({ content: draft })
        .eq("id", 1)
        .select("updated_at")
        .single();
      if (upd.error) {
        setError(upd.error.message);
        return;
      }

      await supabase.from("homepage_content_versions").insert({ homepage_id: 1, content: draft, created_by: null });

      await supabase
        .from("homepage_content_drafts")
        .upsert({ id: 1, content: {}, published_updated_at: upd.data.updated_at }, { onConflict: "id" });

      setPublishedUpdatedAt(upd.data.updated_at);
      setPublished(draft);
      setDraft(null);
      resetHistory();
      setNotice("Published");
    } finally {
      setPublishing(false);
    }
  }

  function setContent(next: HomepageContent, opts?: { recordHistory?: boolean }) {
    const recordHistory = opts?.recordHistory !== false;
    if (recordHistory && !historyBatchRef.current) {
      historyBatchRef.current = true;
      Promise.resolve().then(() => {
        historyBatchRef.current = false;
      });

      const prev = cloneContent(contentRef.current);
      const nextHistory = [...historyRef.current, prev].slice(-60);
      historyRef.current = nextHistory;
      futureRef.current = [];
      setHistorySize(nextHistory.length);
      setFutureSize(0);
    }

    setDraft(next);
    if (draftSaveTimer.current) window.clearTimeout(draftSaveTimer.current);
    draftSaveTimer.current = window.setTimeout(() => {
      saveDraft(next);
    }, 600);
  }

  const undo = useCallback(() => {
    if (!historyRef.current.length) return;
    const current = cloneContent(contentRef.current);
    const prev = historyRef.current[historyRef.current.length - 1];
    const nextHistory = historyRef.current.slice(0, -1);
    historyRef.current = nextHistory;
    setHistorySize(nextHistory.length);

    const nextFuture = [...futureRef.current, current].slice(-60);
    futureRef.current = nextFuture;
    setFutureSize(nextFuture.length);

    setContent(cloneContent(prev), { recordHistory: false });
  }, [cloneContent]);

  const redo = useCallback(() => {
    if (!futureRef.current.length) return;
    const current = cloneContent(contentRef.current);
    const next = futureRef.current[futureRef.current.length - 1];
    const nextFuture = futureRef.current.slice(0, -1);
    futureRef.current = nextFuture;
    setFutureSize(nextFuture.length);

    const nextHistory = [...historyRef.current, current].slice(-60);
    historyRef.current = nextHistory;
    setHistorySize(nextHistory.length);

    setContent(cloneContent(next), { recordHistory: false });
  }, [cloneContent]);

  useEffect(() => {
    function shouldIgnoreShortcut(target: EventTarget | null) {
      const el = target as HTMLElement | null;
      if (!el) return false;
      const tag = (el.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return true;
      if ((el as any).isContentEditable) return true;
      return false;
    }

    function onKeyDown(e: KeyboardEvent) {
      if (shouldIgnoreShortcut(e.target)) return;
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      const key = e.key.toLowerCase();
      if (key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }
      if (key === "y" || (key === "z" && e.shiftKey)) {
        e.preventDefault();
        redo();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [undo, redo]);

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("homepage_drafts_admin")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "homepage_content_drafts", filter: "id=eq.1" },
        async () => {
          const dr = await supabase
            .from("homepage_content_drafts")
            .select("content, published_updated_at")
            .eq("id", 1)
            .maybeSingle();
          if (dr.data?.content) {
            const c = dr.data.content as Partial<HomepageContent>;
            const has = c && Object.keys(c).length;
            setDraft(has ? mergeContent(c) : null);
            if (dr.data.published_updated_at) setPublishedUpdatedAt(dr.data.published_updated_at);
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const previewWidth =
    mode === "mobile" ? "w-[375px]" : mode === "tablet" ? "w-[768px]" : "w-full";
  const previewPx = mode === "mobile" ? 375 : mode === "tablet" ? 768 : null;

  useEffect(() => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    win.postMessage({ type: "coachflow_builder_preview", content: resolved }, window.location.origin);
  }, [resolved]);

  const selectedSection = useMemo(
    () => pageSections.find((s) => s.id === selectedId) || null,
    [pageSections, selectedId],
  );

  function updateSections(next: PageSection[], opts?: { recordHistory?: boolean }) {
    setContent({ ...content, page: { sections: next } }, opts);
  }

  function updateSection(id: string, updater: (s: PageSection) => PageSection, opts?: { recordHistory?: boolean }) {
    updateSections(pageSections.map((s) => (s.id === id ? updater(s) : s)), opts);
  }

  function updateSectionSilent(id: string, updater: (s: PageSection) => PageSection) {
    updateSection(id, updater, { recordHistory: false });
  }

  function makeId(prefix: string) {
    const safePrefix = prefix.replace(/[^a-z0-9_]+/gi, "_");
    const rand =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? (crypto as any).randomUUID()
        : `${Date.now()}_${Math.random().toString(16).slice(2)}`;
    return `${safePrefix}_${rand}`;
  }

  function duplicateSection(sectionId: string) {
    const idx = pageSections.findIndex((s) => s.id === sectionId);
    if (idx < 0) return;
    const original = pageSections[idx];
    const nextId = makeId(original.type);
    const clone = JSON.parse(JSON.stringify(original)) as PageSection;
    clone.id = nextId;
    if (Array.isArray(clone.blocks)) {
      clone.blocks = clone.blocks.map((b) => ({ ...b, id: makeId(b.type) }));
    }

    const nextSections = [...pageSections.slice(0, idx + 1), clone, ...pageSections.slice(idx + 1)];

    if (original.type === "custom") {
      const base = (content.customSections || []).find((x) => x.id === original.id);
      const nextCustom = base
        ? [...(content.customSections || []), { ...JSON.parse(JSON.stringify(base)), id: nextId }]
        : content.customSections;
      setContent({ ...content, page: { sections: nextSections }, customSections: nextCustom });
    } else {
      updateSections(nextSections);
    }

    setSelectedId(nextId);
  }

  function duplicateBlock(sectionId: string, blockId: string) {
    updateSection(sectionId, (s) => {
      const list = s.blocks || [];
      const idx = list.findIndex((b) => b.id === blockId);
      if (idx < 0) return s;
      const original = list[idx];
      const clone = JSON.parse(JSON.stringify(original));
      clone.id = makeId(original.type);
      const next = [...list.slice(0, idx + 1), clone, ...list.slice(idx + 1)];
      setSelectedBlockId(clone.id);
      return { ...s, blocks: next };
    });
  }

  function openMediaPicker(opts: { title: string; accept?: string; onPick: (asset: { url: string; path: string }) => void }) {
    mediaPickRef.current = opts.onPick;
    setMediaTitle(opts.title);
    setMediaAccept(opts.accept);
    setMediaOpen(true);
  }

  useEffect(() => {
    setSelectedBlockId(null);
  }, [selectedId]);

  useEffect(() => {
    if (!selectedSection) return;
    if (selectedSection.type === "hero") {
      if (selectedSection.settings) return;
      updateSectionSilent(selectedSection.id, (s) => ({
        ...s,
        settings: {
          headingPrefix: content.hero.heading.prefix,
          headingHighlight: content.hero.heading.highlight,
          subcopy: content.hero.subcopy,
          note: content.hero.note || "",
          primaryText: content.hero.primaryCta.text,
          primaryHref: content.hero.primaryCta.href,
          secondaryText: content.hero.secondaryCta.text,
          secondaryHref: content.hero.secondaryCta.href,
          background: content.hero.backgroundImage?.url ? { url: content.hero.backgroundImage.url } : undefined,
        },
      }));
      return;
    }
    if (selectedSection.type === "trust") {
      if (selectedSection.settings) return;
      updateSectionSilent(selectedSection.id, (s) => ({ ...s, settings: { eyebrow: content.trust.eyebrow } }));
      return;
    }
    if (selectedSection.type === "features") {
      if (selectedSection.blocks?.length) return;
      updateSectionSilent(selectedSection.id, (s) => ({
        ...s,
        blocks: content.features.cards.map((c, idx) => ({
          id: `feature_${idx + 1}`,
          type: "feature",
          content: {
            title: c.title,
            description: c.copy,
            icon: c.iconRef || (c.icon ? { type: "library", value: c.icon } : { type: "library", value: "website" }),
            materialIcon: c.icon || "",
          },
        })),
      }));
      return;
    }
    if (selectedSection.type === "pricing") {
      if (selectedSection.blocks?.length) return;
      updateSectionSilent(selectedSection.id, (s) => ({
        ...s,
        settings: { note: content.pricing.note || "" },
        blocks: content.pricing.tiers.map((t, idx) => ({
          id: `tier_${idx + 1}`,
          type: "tier",
          content: {
            name: t.name,
            tagline: t.tagline,
            price: t.price,
            priceSuffix: t.priceSuffix || "",
            outcome: (t as any).outcome || "",
            ctaText: t.ctaText,
            ctaHref: t.ctaHref,
            highlighted: Boolean(t.highlight),
            highlightBadge: t.highlight?.badge || "",
            highlightAccentHex: t.highlight?.accentHex || "",
            bullets: t.bullets,
          },
        })),
      }));
      return;
    }

    if (selectedSection.type === "audit_bridge") {
      if (selectedSection.settings) return;
      updateSectionSilent(selectedSection.id, (s) => ({
        ...s,
        settings: {
          heading: "",
          subcopy: "",
          ctaText: "",
          ctaHref: "#lead-form",
        },
      }));
      return;
    }
    if (selectedSection.type === "footer") {
      if (selectedSection.blocks?.length) return;
      const base = (content.socialLinksV2 || []).length
        ? content.socialLinksV2 || []
        : (content.socialLinks || []).map((l, idx) => ({
            id: `legacy_${idx + 1}`,
            platform: l.label,
            url: l.href,
            enabled: true,
          }));
      updateSectionSilent(selectedSection.id, (s) => ({
        ...s,
        blocks: base.map((x) => ({
          id: x.id,
          type: "social_link",
          content: {
            platform: x.platform,
            url: x.url,
            enabled: x.enabled,
            icon: { type: "library", value: x.platform },
          },
        })),
      }));
      return;
    }
  }, [selectedId]);

  if (loading) {
    return <div className="px-6 py-10 text-sm text-slate-500">Loading…</div>;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200/60 bg-white/80 px-6 py-3 backdrop-blur dark:border-white/10 dark:bg-black/20">
        <div className="flex items-center gap-3">
          <div className="text-sm font-semibold">Visual Builder</div>
          {draft ? (
            <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-200">
              Draft
            </span>
          ) : (
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-200">
              Published
            </span>
          )}
        </div>
        <div className="flex max-w-full items-center gap-2 overflow-x-auto">
          <Button variant="secondary" className="h-10" disabled={historySize === 0} onClick={undo}>
            Undo
          </Button>
          <Button variant="secondary" className="h-10" disabled={futureSize === 0} onClick={redo}>
            Redo
          </Button>
          <Button variant="secondary" className="h-10" onClick={loadLandingPreset}>
            Load Landing Preset
          </Button>
          <Button variant="secondary" className="h-10" onClick={() => setMode("desktop")}>Desktop</Button>
          <Button variant="secondary" className="h-10" onClick={() => setMode("tablet")}>Tablet</Button>
          <Button variant="secondary" className="h-10" onClick={() => setMode("mobile")}>Mobile</Button>
          <Button className="h-10" disabled={saving} onClick={() => saveDraft(content)}>
            Save Draft
          </Button>
          <Button className="h-10" disabled={!draft || publishing} onClick={publishNow}>
            Publish
          </Button>
          <Button
            variant="secondary"
            className="h-10"
            onClick={async () => {
              await supabase.from("homepage_content_drafts").upsert({ id: 1, content: {} }, { onConflict: "id" });
              setDraft(null);
              resetHistory();
              setNotice("Reverted to published");
            }}
          >
            Revert
          </Button>
        </div>
      </div>

      {error ? (
        <div className="mx-6 mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
          {error}
        </div>
      ) : null}
      {notice ? (
        <div className="mx-6 mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
          {notice}
        </div>
      ) : null}

      <div className="md:hidden px-3">
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 dark:border-white/10 dark:bg-[#112121]">
          <Button
            variant={mobilePane === "sections" ? "primary" : "secondary"}
            className="h-10 flex-1"
            onClick={() => setMobilePane("sections")}
          >
            Sections
          </Button>
          <Button
            variant={mobilePane === "preview" ? "primary" : "secondary"}
            className="h-10 flex-1"
            onClick={() => setMobilePane("preview")}
          >
            Preview
          </Button>
          <Button
            variant={mobilePane === "inspector" ? "primary" : "secondary"}
            className="h-10 flex-1"
            onClick={() => setMobilePane("inspector")}
          >
            Inspector
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-3 md:flex-row">
        <div
          className={`${mobilePane === "sections" ? "block" : "hidden"} min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-2xl border border-slate-200 bg-white p-3 pb-24 dark:border-white/10 dark:bg-[#112121] md:block md:w-[240px] md:flex-none md:pb-3`}
        >
          <div className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Sections</div>
          <div className="mb-3 grid grid-cols-1 gap-2">
            <Select
              label="Add section"
              value={addType}
              onChange={(e) => setAddType(e.target.value)}
              options={[
                { value: "hero", label: "Hero" },
                { value: "features", label: "Features" },
                { value: "workflow", label: "Workflow" },
                { value: "pricing", label: "Pricing" },
                { value: "audit_bridge", label: "Audit Bridge" },
                { value: "application", label: "Lead Form" },
                { value: "footer", label: "Footer" },
                { value: "testimonials", label: "Testimonials" },
                { value: "custom_html", label: "Custom HTML" },
              ]}
            />
            <Button
              className="h-10"
              onClick={() => {
                const id = `${addType}_${Date.now()}`;
                const next: PageSection = {
                  id,
                  type: addType as any,
                  enabled: true,
                  settings:
                    addType === "custom_html"
                      ? { html: "<div></div>", css: "", js: "" }
                      : addType === "audit_bridge"
                        ? {
                            heading: "",
                            subcopy: "",
                            ctaText: "",
                            ctaHref: "#lead-form",
                          }
                        : undefined,
                  blocks:
                    addType === "features"
                      ? [{ id: `feature_${Date.now()}`, type: "feature", content: { title: "", description: "", icon: { type: "library", value: "website" } } }]
                      : addType === "workflow"
                        ? [{ id: `step_${Date.now()}`, type: "step", content: { title: "", copy: "" } }]
                      : addType === "pricing"
                        ? [{ id: `tier_${Date.now()}`, type: "tier", content: { name: "", tagline: "", price: "", bullets: [], ctaText: "Select", ctaHref: "#lead-form" } }]
                        : addType === "testimonials"
                          ? [{ id: `testimonial_${Date.now()}`, type: "testimonial", content: { name: "", title: "", quote: "" } }]
                          : addType === "footer"
                            ? [{ id: `social_${Date.now()}`, type: "social_link", content: { platform: "instagram", url: "", enabled: true, icon: { type: "library", value: "instagram" } } }]
                            : [],
                };
                updateSections([...pageSections, next]);
                setSelectedId(id);
              }}
            >
              Add
            </Button>
          </div>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(e) => {
              const { active, over } = e;
              if (!over || active.id === over.id) return;
              const oldIndex = pageSections.findIndex((s) => s.id === active.id);
              const newIndex = pageSections.findIndex((s) => s.id === over.id);
              const next = arrayMove(pageSections, oldIndex, newIndex);
              setContent({
                ...content,
                page: { sections: next },
              });
            }}
          >
            <SortableContext items={pageSections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-2">
                {pageSections.map((s) => (
                  <SectionRow
                    key={s.id}
                    item={s}
                    selected={selectedId === s.id}
                    onSelect={() => setSelectedId(s.id)}
                    onDuplicate={() => duplicateSection(s.id)}
                    onToggle={() => {
                      const next = pageSections.map((x) => (x.id === s.id ? { ...x, enabled: !x.enabled } : x));
                      setContent({ ...content, page: { sections: next } });
                    }}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <div className="mt-2">
            <div
              className={
                selectedId === "__whatsapp"
                  ? "flex items-center gap-2 rounded-lg border border-[#0fa3a3]/40 bg-[#0fa3a3]/10 px-3 py-2"
                  : "flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-[#112121]"
              }
            >
              <button type="button" className="flex-1 text-left text-sm font-semibold" onClick={() => setSelectedId("__whatsapp")}>
                whatsapp
              </button>
              <button
                type="button"
                className={content.whatsapp?.enabled ? "text-[#0fa3a3]" : "text-slate-400"}
                onClick={() => {
                  setContent({
                    ...content,
                    whatsapp: {
                      ...(content.whatsapp || homepageDefaults.whatsapp!),
                      enabled: !content.whatsapp?.enabled,
                    },
                  });
                }}
                aria-label="Toggle"
              >
                <MaterialIcon name={content.whatsapp?.enabled ? "visibility" : "visibility_off"} className="text-[20px]" />
              </button>
            </div>
          </div>
          <div className="mt-4">
            <Button
              variant="secondary"
              className="h-10 w-full"
              onClick={() => {
                const id = `custom_${Date.now()}`;
                const nextSections: PageSection[] = [
                  ...pageSections,
                  { id, type: "custom" as const, enabled: true },
                ];
                const nextCustom = [
                  ...(content.customSections || []),
                  { id, enabled: true, html: "<div></div>", css: "", js: "" },
                ];
                setContent({ ...content, page: { sections: nextSections }, customSections: nextCustom });
                setSelectedId(id);
              }}
            >
              Add Custom Section
            </Button>
          </div>
        </div>

        <div
          className={`${mobilePane === "preview" ? "flex" : "hidden"} min-h-0 flex-1 justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-black/20 md:flex`}
        >
          <div className="flex min-h-0 h-full w-full items-center justify-center overflow-hidden p-3">
            <div
              className={`h-full ${previewWidth} overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0b1414]`}
            >
              <iframe
                ref={iframeRef}
                title="Homepage preview"
                src={`/?builderPreview=true&device=${mode}`}
                style={{ width: previewPx ? `${previewPx}px` : "100%", height: "100%", border: "none" }}
                onLoad={() => {
                  iframeRef.current?.contentWindow?.postMessage(
                    { type: "coachflow_builder_preview", content: resolved },
                    window.location.origin,
                  );
                }}
              />
            </div>
          </div>
        </div>

        <div
          className={`${mobilePane === "inspector" ? "block" : "hidden"} min-h-0 flex-1 overflow-y-auto overscroll-contain rounded-2xl border border-slate-200 bg-white p-4 pb-24 dark:border-white/10 dark:bg-[#112121] md:block md:w-[340px] md:flex-none md:pb-4`}
        >
          <div className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">Inspector</div>
          {selectedSection && selectedSection.id !== "footer" ? (
            <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-[#0b1414]">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">{selectedSection.type}</div>
              <Button
                variant="secondary"
                className="h-9"
                onClick={() => {
                  updateSections(pageSections.filter((s) => s.id !== selectedSection.id));
                  setSelectedId("hero");
                }}
              >
                Delete
              </Button>
            </div>
          ) : null}

          {selectedSection ? (
            <div className="mb-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-[#0b1414]">
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Enabled"
                  value={selectedSection.enabled ? "yes" : "no"}
                  onChange={(e) => {
                    const enabled = e.target.value === "yes";
                    updateSection(selectedSection.id, (s) => ({ ...s, enabled }));
                  }}
                  options={[
                    { value: "yes", label: "Yes" },
                    { value: "no", label: "No" },
                  ]}
                />
                <Select
                  label="Background type"
                  value={String((selectedSection.settings as any)?.backgroundType || "none")}
                  onChange={(e) =>
                    updateSection(selectedSection.id, (s) => ({
                      ...s,
                      settings: { ...(s.settings || {}), backgroundType: e.target.value === "none" ? undefined : e.target.value },
                    }))
                  }
                  options={[
                    { value: "none", label: "None" },
                    { value: "color", label: "Color" },
                    { value: "image", label: "Image" },
                    { value: "video", label: "Video" },
                  ]}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Padding top (px)"
                  type="number"
                  value={String((selectedSection.settings as any)?.paddingTop ?? "")}
                  onChange={(e) => {
                    const v = e.target.value.trim();
                    const paddingTop = v.length ? Number(v) : undefined;
                    updateSection(selectedSection.id, (s) => ({
                      ...s,
                      settings: { ...(s.settings || {}), paddingTop, paddingY: undefined },
                    }));
                  }}
                />
                <Input
                  label="Padding bottom (px)"
                  type="number"
                  value={String((selectedSection.settings as any)?.paddingBottom ?? "")}
                  onChange={(e) => {
                    const v = e.target.value.trim();
                    const paddingBottom = v.length ? Number(v) : undefined;
                    updateSection(selectedSection.id, (s) => ({
                      ...s,
                      settings: { ...(s.settings || {}), paddingBottom, paddingY: undefined },
                    }));
                  }}
                />
              </div>

              {selectedSection.type === "features" ||
              selectedSection.type === "workflow" ||
              selectedSection.type === "pricing" ||
              selectedSection.type === "application" ? (
                <Input
                  label="Label tag"
                  value={String((selectedSection.settings as any)?.label || "")}
                  onChange={(e) =>
                    updateSection(selectedSection.id, (s) => ({
                      ...s,
                      settings: { ...(s.settings || {}), label: e.target.value },
                    }))
                  }
                />
              ) : null}

              {selectedSection.type === "workflow" ? (
                <Select
                  label="Workflow variant"
                  value={String((selectedSection.settings as any)?.variant || "landing")}
                  onChange={(e) =>
                    updateSection(selectedSection.id, (s) => ({
                      ...s,
                      settings: { ...(s.settings || {}), variant: e.target.value },
                    }))
                  }
                  options={[
                    { value: "landing", label: "Landing list" },
                    { value: "accordion", label: "Accordion" },
                  ]}
                />
              ) : null}

              {selectedSection.type === "footer" ? (
                <Select
                  label="Show social"
                  value={(selectedSection.settings as any)?.showSocial ? "yes" : "no"}
                  onChange={(e) =>
                    updateSection(selectedSection.id, (s) => ({
                      ...s,
                      settings: { ...(s.settings || {}), showSocial: e.target.value === "yes" },
                    }))
                  }
                  options={[
                    { value: "no", label: "No" },
                    { value: "yes", label: "Yes" },
                  ]}
                />
              ) : null}

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Background color"
                  value={String((selectedSection.settings as any)?.backgroundColor ?? (selectedSection.settings as any)?.backgroundColorHex ?? "")}
                  onChange={(e) =>
                    updateSection(selectedSection.id, (s) => ({
                      ...s,
                      settings: {
                        ...(s.settings || {}),
                        backgroundType: "color",
                        backgroundColor: e.target.value,
                        backgroundColorHex: e.target.value,
                      },
                    }))
                  }
                  placeholder="#0b1414"
                />
                <Input
                  label="Overlay color"
                  value={String((selectedSection.settings as any)?.overlayColor ?? "")}
                  onChange={(e) =>
                    updateSection(selectedSection.id, (s) => ({
                      ...s,
                      settings: { ...(s.settings || {}), overlayColor: e.target.value },
                    }))
                  }
                  placeholder="rgba(0,0,0,0.3)"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Container width"
                  value={String((selectedSection.settings as any)?.containerWidth || "lg")}
                  onChange={(e) =>
                    updateSection(selectedSection.id, (s) => ({
                      ...s,
                      settings: { ...(s.settings || {}), containerWidth: e.target.value },
                    }))
                  }
                  options={[
                    { value: "sm", label: "sm" },
                    { value: "md", label: "md" },
                    { value: "lg", label: "lg" },
                    { value: "full", label: "full" },
                  ]}
                />
                <Select
                  label="Alignment"
                  value={String((selectedSection.settings as any)?.alignment || "center")}
                  onChange={(e) =>
                    updateSection(selectedSection.id, (s) => ({
                      ...s,
                      settings: { ...(s.settings || {}), alignment: e.target.value },
                    }))
                  }
                  options={[
                    { value: "left", label: "Left" },
                    { value: "center", label: "Center" },
                    { value: "right", label: "Right" },
                  ]}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="secondary"
                  className="mt-6 h-10"
                  onClick={() => {
                    openMediaPicker({
                      title: "Pick background media",
                      accept: "image/*,video/*",
                      onPick: (asset) => {
                        const lower = asset.url.toLowerCase();
                        const isVideo = lower.endsWith(".mp4") || lower.endsWith(".webm") || lower.endsWith(".mov");
                        updateSection(selectedSection.id, (s) => ({
                          ...s,
                          settings: {
                            ...(s.settings || {}),
                            backgroundType: isVideo ? "video" : "image",
                            backgroundImage: isVideo ? undefined : asset.url,
                            backgroundVideo: isVideo ? asset.url : undefined,
                            background: { url: asset.url, path: asset.path },
                          },
                        }));
                      },
                    });
                  }}
                >
                  Pick media
                </Button>
                <Button
                  variant="secondary"
                  className="mt-6 h-10"
                  onClick={() =>
                    updateSection(selectedSection.id, (s) => ({
                      ...s,
                      settings: {
                        ...(s.settings || {}),
                        backgroundType: undefined,
                        backgroundColor: undefined,
                        backgroundImage: undefined,
                        backgroundVideo: undefined,
                        overlayColor: undefined,
                        background: undefined,
                      },
                    }))
                  }
                >
                  Clear bg
                </Button>
              </div>
            </div>
          ) : null}

          {selectedId === "hero" ? (
            <div className="flex flex-col gap-4">
              <Input
                label="Headline prefix"
                value={content.hero.heading.prefix}
                onChange={(e) => {
                  setContent({ ...content, hero: { ...content.hero, heading: { ...content.hero.heading, prefix: e.target.value } } });
                  updateSection("hero", (s) => ({ ...s, settings: { ...(s.settings || {}), headingPrefix: e.target.value } }));
                }}
              />
              <Input
                label="Headline highlight"
                value={content.hero.heading.highlight}
                onChange={(e) => {
                  setContent({ ...content, hero: { ...content.hero, heading: { ...content.hero.heading, highlight: e.target.value } } });
                  updateSection("hero", (s) => ({ ...s, settings: { ...(s.settings || {}), headingHighlight: e.target.value } }));
                }}
              />
              <Textarea
                label="Subheadline"
                value={content.hero.subcopy}
                onChange={(e) => {
                  setContent({ ...content, hero: { ...content.hero, subcopy: e.target.value } });
                  updateSection("hero", (s) => ({ ...s, settings: { ...(s.settings || {}), subcopy: e.target.value } }));
                }}
                rows={4}
              />
              <Textarea
                label="Note"
                value={content.hero.note || ""}
                onChange={(e) => {
                  setContent({ ...content, hero: { ...content.hero, note: e.target.value } });
                  updateSection("hero", (s) => ({ ...s, settings: { ...(s.settings || {}), note: e.target.value } }));
                }}
                rows={3}
              />

              <Select
                label="Hero background"
                value={((pageSections.find((s) => s.id === "hero")?.settings as any)?.heroBackground ?? true) ? "on" : "off"}
                onChange={(e) => {
                  const on = e.target.value === "on";
                  updateSection("hero", (s) => ({ ...s, settings: { ...(s.settings || {}), heroBackground: on } }));
                }}
                options={[
                  { value: "on", label: "On" },
                  { value: "off", label: "Off" },
                ]}
              />

              <Input
                label="Hero trust text"
                value={String((content.hero as any).trust?.text || "")}
                onChange={(e) => {
                  const trust = { ...((content.hero as any).trust || {}), text: e.target.value };
                  setContent({ ...content, hero: { ...(content.hero as any), trust } } as any);
                }}
              />
              <Textarea
                label="Hero trust pills (one per line)"
                value={String((((content.hero as any).trust?.pills as any) || []).join("\n"))}
                onChange={(e) => {
                  const pills = e.target.value
                    .split("\n")
                    .map((x) => x.trim())
                    .filter((x) => x.length);
                  const trust = { ...((content.hero as any).trust || {}), pills };
                  setContent({ ...content, hero: { ...(content.hero as any), trust } } as any);
                }}
                rows={3}
              />
              <Input
                label="Primary CTA text"
                value={content.hero.primaryCta.text}
                onChange={(e) => {
                  setContent({ ...content, hero: { ...content.hero, primaryCta: { ...content.hero.primaryCta, text: e.target.value } } });
                  updateSection("hero", (s) => ({ ...s, settings: { ...(s.settings || {}), primaryText: e.target.value } }));
                }}
              />
              <Input
                label="Primary CTA href"
                value={content.hero.primaryCta.href}
                onChange={(e) => {
                  setContent({ ...content, hero: { ...content.hero, primaryCta: { ...content.hero.primaryCta, href: e.target.value } } });
                  updateSection("hero", (s) => ({ ...s, settings: { ...(s.settings || {}), primaryHref: e.target.value } }));
                }}
              />
              <Input
                label="Secondary CTA text"
                value={content.hero.secondaryCta.text}
                onChange={(e) => {
                  setContent({ ...content, hero: { ...content.hero, secondaryCta: { ...content.hero.secondaryCta, text: e.target.value } } });
                  updateSection("hero", (s) => ({ ...s, settings: { ...(s.settings || {}), secondaryText: e.target.value } }));
                }}
              />
              <Input
                label="Secondary CTA href"
                value={content.hero.secondaryCta.href}
                onChange={(e) => {
                  setContent({ ...content, hero: { ...content.hero, secondaryCta: { ...content.hero.secondaryCta, href: e.target.value } } });
                  updateSection("hero", (s) => ({ ...s, settings: { ...(s.settings || {}), secondaryHref: e.target.value } }));
                }}
              />
            </div>
          ) : selectedId === "pricing" ? (
            <div className="flex flex-col gap-4">
              <Input
                label="Section heading"
                value={content.pricing.heading}
                onChange={(e) => setContent({ ...content, pricing: { ...content.pricing, heading: e.target.value } })}
              />
              <Textarea
                label="Section subcopy"
                value={content.pricing.subcopy}
                onChange={(e) => setContent({ ...content, pricing: { ...content.pricing, subcopy: e.target.value } })}
                rows={3}
              />
              <Textarea
                label="Bottom note"
                value={String((selectedSection?.settings as any)?.note || content.pricing.note || "")}
                onChange={(e) => {
                  setContent({ ...content, pricing: { ...content.pricing, note: e.target.value } });
                  updateSection("pricing", (s) => ({ ...s, settings: { ...(s.settings || {}), note: e.target.value } }));
                }}
                rows={2}
              />
              <Textarea
                label="Tiers are controlled by blocks in Pricing"
                value={"Use the block editor below (section blocks)."}
                readOnly
                rows={2}
              />
              {selectedSection?.blocks?.length ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={(e) => {
                    const { active, over } = e;
                    if (!over || active.id === over.id) return;
                    updateSection("pricing", (s) => {
                      const list = s.blocks || [];
                      const oldIndex = list.findIndex((b) => b.id === active.id);
                      const newIndex = list.findIndex((b) => b.id === over.id);
                      const next = arrayMove(list, oldIndex, newIndex);
                      return { ...s, blocks: next };
                    });
                  }}
                >
                  <SortableContext items={(selectedSection.blocks || []).map((b) => b.id)} strategy={verticalListSortingStrategy}>
                    <div className="flex flex-col gap-2">
                      {(selectedSection.blocks || []).map((b) => (
                        <BlockRow
                          key={b.id}
                          id={b.id}
                          title={String(b.content?.name || b.id)}
                          selected={false}
                          onSelect={() => {}}
                          onDuplicate={() => duplicateBlock("pricing", b.id)}
                          onRemove={() =>
                            updateSection("pricing", (s) => ({ ...s, blocks: (s.blocks || []).filter((x) => x.id !== b.id) }))
                          }
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              ) : null}
              <Button
                variant="secondary"
                className="h-10"
                onClick={() => {
                  updateSection("pricing", (s) => ({
                    ...s,
                    blocks: [
                      ...(s.blocks || []),
                      {
                        id: `tier_${Date.now()}`,
                        type: "tier",
                        content: { name: "", tagline: "", price: "", bullets: [], ctaText: "Select", ctaHref: "#lead-form" },
                      },
                    ],
                  }));
                }}
              >
                Add tier
              </Button>
              {(selectedSection?.blocks || [])
                .filter((b) => b.type === "tier")
                .map((b) => (
                  <div key={b.id} className="rounded-xl border border-slate-200 p-3 dark:border-white/10">
                    <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Tier</div>
                    <Input
                      label="Name"
                      value={String(b.content?.name || "")}
                      onChange={(e) =>
                        updateSection("pricing", (s) => ({
                          ...s,
                          blocks: (s.blocks || []).map((x) =>
                            x.id === b.id ? { ...x, content: { ...x.content, name: e.target.value } } : x,
                          ),
                        }))
                      }
                    />
                    <Input
                      label="Price"
                      value={String(b.content?.price || "")}
                      onChange={(e) =>
                        updateSection("pricing", (s) => ({
                          ...s,
                          blocks: (s.blocks || []).map((x) =>
                            x.id === b.id ? { ...x, content: { ...x.content, price: e.target.value } } : x,
                          ),
                        }))
                      }
                    />
                    <Input
                      label="Outcome"
                      value={String(b.content?.outcome || "")}
                      onChange={(e) =>
                        updateSection("pricing", (s) => ({
                          ...s,
                          blocks: (s.blocks || []).map((x) =>
                            x.id === b.id ? { ...x, content: { ...x.content, outcome: e.target.value } } : x,
                          ),
                        }))
                      }
                    />
                    <Textarea
                      label="Tagline"
                      value={String(b.content?.tagline || "")}
                      onChange={(e) =>
                        updateSection("pricing", (s) => ({
                          ...s,
                          blocks: (s.blocks || []).map((x) =>
                            x.id === b.id ? { ...x, content: { ...x.content, tagline: e.target.value } } : x,
                          ),
                        }))
                      }
                      rows={2}
                    />
                    <Select
                      label="Highlighted"
                      value={b.content?.highlighted ? "yes" : "no"}
                      onChange={(e) =>
                        updateSection("pricing", (s) => ({
                          ...s,
                          blocks: (s.blocks || []).map((x) =>
                            x.id === b.id
                              ? { ...x, content: { ...x.content, highlighted: e.target.value === "yes" } }
                              : x,
                          ),
                        }))
                      }
                      options={[
                        { value: "no", label: "No" },
                        { value: "yes", label: "Yes" },
                      ]}
                    />
                    <Textarea
                      label="Bullets (one per line)"
                      value={Array.isArray(b.content?.bullets) ? (b.content?.bullets as string[]).join("\n") : ""}
                      onChange={(e) =>
                        updateSection("pricing", (s) => ({
                          ...s,
                          blocks: (s.blocks || []).map((x) =>
                            x.id === b.id
                              ? {
                                  ...x,
                                  content: {
                                    ...x.content,
                                    bullets: e.target.value
                                      .split("\n")
                                      .map((v) => v.trim())
                                      .filter(Boolean),
                                  },
                                }
                              : x,
                          ),
                        }))
                      }
                      rows={4}
                    />
                  </div>
                ))}
            </div>
          ) : selectedId === "footer" ? (
            <div className="flex flex-col gap-4">
              <Textarea
                label="Copyright"
                value={content.footer.copyright}
                onChange={(e) => setContent({ ...content, footer: { ...content.footer, copyright: e.target.value } })}
                rows={2}
              />
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Social links (blocks)</div>
              <Button
                variant="secondary"
                className="h-10"
                onClick={() => {
                  updateSection("footer", (s) => ({
                    ...s,
                    blocks: [
                      ...(s.blocks || []),
                      {
                        id: `social_${Date.now()}`,
                        type: "social_link",
                        content: { platform: "instagram", url: "", enabled: true, icon: { type: "library", value: "instagram" } },
                      },
                    ],
                  }));
                }}
              >
                Add social link
              </Button>
              {(selectedSection?.blocks || [])
                .filter((b) => b.type === "social_link")
                .map((b) => (
                  <div key={b.id} className="rounded-xl border border-slate-200 p-3 dark:border-white/10">
                    <Input
                      label="Platform"
                      value={String(b.content?.platform || "")}
                      onChange={(e) =>
                        updateSection("footer", (s) => ({
                          ...s,
                          blocks: (s.blocks || []).map((x) =>
                            x.id === b.id ? { ...x, content: { ...x.content, platform: e.target.value } } : x,
                          ),
                        }))
                      }
                    />
                    <Input
                      label="URL"
                      value={String(b.content?.url || "")}
                      onChange={(e) =>
                        updateSection("footer", (s) => ({
                          ...s,
                          blocks: (s.blocks || []).map((x) =>
                            x.id === b.id ? { ...x, content: { ...x.content, url: e.target.value } } : x,
                          ),
                        }))
                      }
                    />
                    <Select
                      label="Enabled"
                      value={b.content?.enabled === false ? "no" : "yes"}
                      onChange={(e) =>
                        updateSection("footer", (s) => ({
                          ...s,
                          blocks: (s.blocks || []).map((x) =>
                            x.id === b.id
                              ? { ...x, content: { ...x.content, enabled: e.target.value === "yes" } }
                              : x,
                          ),
                        }))
                      }
                      options={[
                        { value: "yes", label: "Yes" },
                        { value: "no", label: "No" },
                      ]}
                    />
                    <IconPicker
                      supabase={supabase}
                      label="Icon"
                      value={(b.content?.icon as IconRef | undefined) || { type: "library", value: String(b.content?.platform || "website") }}
                      onChange={(next) =>
                        updateSection("footer", (s) => ({
                          ...s,
                          blocks: (s.blocks || []).map((x) =>
                            x.id === b.id ? { ...x, content: { ...x.content, icon: next } } : x,
                          ),
                        }))
                      }
                    />
                  </div>
                ))}
              <Textarea
                label="Legacy socialLinks (JSON fallback)"
                value={JSON.stringify(content.socialLinks || [], null, 2)}
                onChange={(e) => {
                  try {
                    const next = JSON.parse(e.target.value) as HomepageContent["socialLinks"];
                    if (!Array.isArray(next)) return;
                    setContent({ ...content, socialLinks: next });
                  } catch {
                  }
                }}
                rows={6}
              />
            </div>
          ) : selectedSection?.type === "workflow" ? (
            <div className="flex flex-col gap-4">
              <Input
                label="Section heading"
                value={content.workflow.heading}
                onChange={(e) => setContent({ ...content, workflow: { ...content.workflow, heading: e.target.value } })}
              />
              <Textarea
                label="Section subcopy"
                value={content.workflow.subcopy}
                onChange={(e) => setContent({ ...content, workflow: { ...content.workflow, subcopy: e.target.value } })}
                rows={3}
              />
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Steps</div>
              <Button
                variant="secondary"
                className="h-10"
                onClick={() =>
                  setContent({
                    ...content,
                    workflow: {
                      ...content.workflow,
                      steps: [...content.workflow.steps, { title: "", copy: "" }],
                    },
                  })
                }
              >
                Add step
              </Button>
              {content.workflow.steps.map((s, idx) => (
                <div key={idx} className="rounded-xl border border-slate-200 p-3 dark:border-white/10">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Step {idx + 1}</div>
                    <Button
                      variant="secondary"
                      className="h-9"
                      onClick={() =>
                        setContent({
                          ...content,
                          workflow: {
                            ...content.workflow,
                            steps: content.workflow.steps.filter((_, i) => i !== idx),
                          },
                        })
                      }
                    >
                      Remove
                    </Button>
                  </div>
                  <Input
                    label="Title"
                    value={s.title}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        workflow: {
                          ...content.workflow,
                          steps: content.workflow.steps.map((x, i) => (i === idx ? { ...x, title: e.target.value } : x)),
                        },
                      })
                    }
                  />
                  <Textarea
                    label="Copy"
                    value={s.copy}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        workflow: {
                          ...content.workflow,
                          steps: content.workflow.steps.map((x, i) => (i === idx ? { ...x, copy: e.target.value } : x)),
                        },
                      })
                    }
                    rows={3}
                  />
                </div>
              ))}
            </div>
          ) : selectedSection?.type === "features" ? (
            <div className="flex flex-col gap-4">
              <Input
                label="Section heading"
                value={content.features.heading}
                onChange={(e) => setContent({ ...content, features: { ...content.features, heading: e.target.value } })}
              />
              <Textarea
                label="Section subcopy"
                value={content.features.subcopy}
                onChange={(e) => setContent({ ...content, features: { ...content.features, subcopy: e.target.value } })}
                rows={3}
              />
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Feature blocks</div>
              <Button
                variant="secondary"
                className="h-10"
                onClick={() => {
                  updateSection(selectedSection.id, (s) => ({
                    ...s,
                    blocks: [
                      ...(s.blocks || []),
                      { id: `feature_${Date.now()}`, type: "feature", content: { title: "", description: "", icon: { type: "library", value: "website" } } },
                    ],
                  }));
                }}
              >
                Add feature
              </Button>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(e) => {
                  const { active, over } = e;
                  if (!over || active.id === over.id) return;
                  updateSection(selectedSection.id, (s) => {
                    const list = (s.blocks || []).filter((b) => b.type === "feature");
                    const oldIndex = list.findIndex((b) => b.id === active.id);
                    const newIndex = list.findIndex((b) => b.id === over.id);
                    const next = arrayMove(list, oldIndex, newIndex);
                    const rest = (s.blocks || []).filter((b) => b.type !== "feature");
                    return { ...s, blocks: [...next, ...rest] };
                  });
                }}
              >
                <SortableContext
                  items={(selectedSection.blocks || []).filter((b) => b.type === "feature").map((b) => b.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="flex flex-col gap-2">
                    {(selectedSection.blocks || []).filter((b) => b.type === "feature").map((b) => (
                      <BlockRow
                        key={b.id}
                        id={b.id}
                        title={String(b.content?.title || b.id)}
                        selected={selectedBlockId === b.id}
                        onSelect={() => setSelectedBlockId(b.id)}
                        onDuplicate={() => duplicateBlock(selectedSection.id, b.id)}
                        onRemove={() =>
                          updateSection(selectedSection.id, (s) => ({
                            ...s,
                            blocks: (s.blocks || []).filter((x) => x.id !== b.id),
                          }))
                        }
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {(() => {
                const list = (selectedSection.blocks || []).filter((b) => b.type === "feature");
                const active = list.find((b) => b.id === selectedBlockId) || list[0];
                if (!active) return null;
                return (
                  <div className="rounded-xl border border-slate-200 p-3 dark:border-white/10">
                    <Input
                      label="Title"
                      value={String(active.content?.title || "")}
                      onChange={(e) =>
                        updateSection(selectedSection.id, (s) => ({
                          ...s,
                          blocks: (s.blocks || []).map((x) =>
                            x.id === active.id ? { ...x, content: { ...x.content, title: e.target.value } } : x,
                          ),
                        }))
                      }
                    />
                    <Textarea
                      label="Description"
                      value={String(active.content?.description || "")}
                      onChange={(e) =>
                        updateSection(selectedSection.id, (s) => ({
                          ...s,
                          blocks: (s.blocks || []).map((x) =>
                            x.id === active.id ? { ...x, content: { ...x.content, description: e.target.value } } : x,
                          ),
                        }))
                      }
                      rows={3}
                    />
                    <IconPicker
                      supabase={supabase}
                      label="Icon"
                      value={(active.content?.icon as IconRef | undefined) || { type: "library", value: "website" }}
                      onChange={(next) =>
                        updateSection(selectedSection.id, (s) => ({
                          ...s,
                          blocks: (s.blocks || []).map((x) =>
                            x.id === active.id ? { ...x, content: { ...x.content, icon: next } } : x,
                          ),
                        }))
                      }
                    />
                    <div className="flex flex-col gap-2">
                      <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">Image (optional)</div>
                      {typeof (active.content as any)?.image?.url === "string" &&
                      String((active.content as any).image.url).trim().length ? (
                        <div className="flex items-center gap-3">
                          <img
                            src={String((active.content as any).image.url)}
                            alt=""
                            className="h-12 w-12 rounded-lg border border-slate-200 object-cover dark:border-white/10"
                          />
                          <Button
                            variant="secondary"
                            className="h-10"
                            onClick={() =>
                              updateSection(selectedSection.id, (s) => ({
                                ...s,
                                blocks: (s.blocks || []).map((x) =>
                                  x.id === active.id
                                    ? { ...x, content: { ...x.content, image: undefined } }
                                    : x,
                                ),
                              }))
                            }
                          >
                            Clear image
                          </Button>
                          <Button
                            variant="secondary"
                            className="h-10"
                            onClick={() =>
                              openMediaPicker({
                                title: "Pick feature image",
                                accept: "image/*",
                                onPick: (asset) =>
                                  updateSection(selectedSection.id, (s) => ({
                                    ...s,
                                    blocks: (s.blocks || []).map((x) =>
                                      x.id === active.id
                                        ? { ...x, content: { ...x.content, image: { url: asset.url, path: asset.path } } }
                                        : x,
                                    ),
                                  })),
                              })
                            }
                          >
                            Replace
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="secondary"
                          className="h-10"
                          onClick={() =>
                            openMediaPicker({
                              title: "Pick feature image",
                              accept: "image/*",
                              onPick: (asset) =>
                                updateSection(selectedSection.id, (s) => ({
                                  ...s,
                                  blocks: (s.blocks || []).map((x) =>
                                    x.id === active.id
                                      ? { ...x, content: { ...x.content, image: { url: asset.url, path: asset.path } } }
                                      : x,
                                  ),
                                })),
                            })
                          }
                        >
                          Choose image
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : selectedSection?.type === "testimonials" ? (
            <div className="flex flex-col gap-4">
              <Input
                label="Heading"
                value={String((selectedSection.settings as any)?.heading || "")}
                onChange={(e) => updateSection(selectedSection.id, (s) => ({ ...s, settings: { ...(s.settings || {}), heading: e.target.value } }))}
              />
              <Textarea
                label="Subcopy"
                value={String((selectedSection.settings as any)?.subcopy || "")}
                onChange={(e) => updateSection(selectedSection.id, (s) => ({ ...s, settings: { ...(s.settings || {}), subcopy: e.target.value } }))}
                rows={2}
              />
              <Button
                variant="secondary"
                className="h-10"
                onClick={() =>
                  updateSection(selectedSection.id, (s) => ({
                    ...s,
                    blocks: [
                      ...(s.blocks || []),
                      {
                        id: `testimonial_${Date.now()}`,
                        type: "testimonial",
                        content: { name: "", role: "", quote: "", rating: 5, avatar: undefined },
                      },
                    ],
                  }))
                }
              >
                Add testimonial
              </Button>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(e) => {
                  const { active, over } = e;
                  if (!over || active.id === over.id) return;
                  updateSection(selectedSection.id, (s) => {
                    const list = (s.blocks || []).filter((b) => b.type === "testimonial");
                    const oldIndex = list.findIndex((b) => b.id === active.id);
                    const newIndex = list.findIndex((b) => b.id === over.id);
                    const next = arrayMove(list, oldIndex, newIndex);
                    const rest = (s.blocks || []).filter((b) => b.type !== "testimonial");
                    return { ...s, blocks: [...next, ...rest] };
                  });
                }}
              >
                <SortableContext
                  items={(selectedSection.blocks || []).filter((b) => b.type === "testimonial").map((b) => b.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="flex flex-col gap-2">
                    {(selectedSection.blocks || []).filter((b) => b.type === "testimonial").map((b) => (
                      <BlockRow
                        key={b.id}
                        id={b.id}
                        title={String(b.content?.name || b.id)}
                        selected={selectedBlockId === b.id}
                        onSelect={() => setSelectedBlockId(b.id)}
                        onDuplicate={() => duplicateBlock(selectedSection.id, b.id)}
                        onRemove={() =>
                          updateSection(selectedSection.id, (s) => ({
                            ...s,
                            blocks: (s.blocks || []).filter((x) => x.id !== b.id),
                          }))
                        }
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {(() => {
                const list = (selectedSection.blocks || []).filter((b) => b.type === "testimonial");
                const active = list.find((b) => b.id === selectedBlockId) || list[0];
                if (!active) return null;
                return (
                  <div className="rounded-xl border border-slate-200 p-3 dark:border-white/10">
                    <Input
                      label="Name"
                      value={String(active.content?.name || "")}
                      onChange={(e) =>
                        updateSection(selectedSection.id, (s) => ({
                          ...s,
                          blocks: (s.blocks || []).map((x) =>
                            x.id === active.id ? { ...x, content: { ...x.content, name: e.target.value } } : x,
                          ),
                        }))
                      }
                    />
                    <Input
                      label="Role"
                      value={String(active.content?.role || "")}
                      onChange={(e) =>
                        updateSection(selectedSection.id, (s) => ({
                          ...s,
                          blocks: (s.blocks || []).map((x) =>
                            x.id === active.id ? { ...x, content: { ...x.content, role: e.target.value } } : x,
                          ),
                        }))
                      }
                    />
                    <Select
                      label="Rating"
                      value={String(active.content?.rating ?? 5)}
                      onChange={(e) =>
                        updateSection(selectedSection.id, (s) => ({
                          ...s,
                          blocks: (s.blocks || []).map((x) =>
                            x.id === active.id ? { ...x, content: { ...x.content, rating: Number(e.target.value) } } : x,
                          ),
                        }))
                      }
                      options={[
                        { value: "5", label: "5" },
                        { value: "4", label: "4" },
                        { value: "3", label: "3" },
                        { value: "2", label: "2" },
                        { value: "1", label: "1" },
                      ]}
                    />
                    <Textarea
                      label="Quote"
                      value={String(active.content?.quote || "")}
                      onChange={(e) =>
                        updateSection(selectedSection.id, (s) => ({
                          ...s,
                          blocks: (s.blocks || []).map((x) =>
                            x.id === active.id ? { ...x, content: { ...x.content, quote: e.target.value } } : x,
                          ),
                        }))
                      }
                      rows={4}
                    />
                    <div className="flex flex-col gap-2">
                      <div className="text-xs font-semibold text-slate-600 dark:text-slate-300">Avatar</div>
                      {typeof (active.content as any)?.avatar?.url === "string" &&
                      String((active.content as any).avatar.url).trim().length ? (
                        <div className="flex items-center gap-3">
                          <img
                            src={String((active.content as any).avatar.url)}
                            alt=""
                            className="h-12 w-12 rounded-full border border-slate-200 object-cover dark:border-white/10"
                          />
                          <Button
                            variant="secondary"
                            className="h-10"
                            onClick={() =>
                              updateSection(selectedSection.id, (s) => ({
                                ...s,
                                blocks: (s.blocks || []).map((x) =>
                                  x.id === active.id ? { ...x, content: { ...x.content, avatar: undefined } } : x,
                                ),
                              }))
                            }
                          >
                            Clear
                          </Button>
                          <Button
                            variant="secondary"
                            className="h-10"
                            onClick={() =>
                              openMediaPicker({
                                title: "Pick testimonial avatar",
                                accept: "image/*",
                                onPick: (asset) =>
                                  updateSection(selectedSection.id, (s) => ({
                                    ...s,
                                    blocks: (s.blocks || []).map((x) =>
                                      x.id === active.id
                                        ? { ...x, content: { ...x.content, avatar: { url: asset.url, path: asset.path } } }
                                        : x,
                                    ),
                                  })),
                              })
                            }
                          >
                            Replace
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="secondary"
                          className="h-10"
                          onClick={() =>
                            openMediaPicker({
                              title: "Pick testimonial avatar",
                              accept: "image/*",
                              onPick: (asset) =>
                                updateSection(selectedSection.id, (s) => ({
                                  ...s,
                                  blocks: (s.blocks || []).map((x) =>
                                    x.id === active.id
                                      ? { ...x, content: { ...x.content, avatar: { url: asset.url, path: asset.path } } }
                                      : x,
                                  ),
                                })),
                            })
                          }
                        >
                          Choose avatar
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : selectedSection?.type === "custom_html" ? (
            <div className="flex flex-col gap-4">
              <Textarea
                label="Custom HTML"
                value={String((selectedSection.settings as any)?.html || "")}
                onChange={(e) => updateSection(selectedSection.id, (s) => ({ ...s, settings: { ...(s.settings || {}), html: e.target.value } }))}
                rows={8}
              />
              <Textarea
                label="Custom CSS"
                value={String((selectedSection.settings as any)?.css || "")}
                onChange={(e) => updateSection(selectedSection.id, (s) => ({ ...s, settings: { ...(s.settings || {}), css: e.target.value } }))}
                rows={6}
              />
              <Textarea
                label="Custom JS"
                value={String((selectedSection.settings as any)?.js || "")}
                onChange={(e) => updateSection(selectedSection.id, (s) => ({ ...s, settings: { ...(s.settings || {}), js: e.target.value } }))}
                rows={6}
              />
            </div>
          ) : selectedSection?.type === "audit_bridge" ? (
            <div className="flex flex-col gap-4">
              <Input
                label="Heading"
                value={String((selectedSection.settings as any)?.heading || "")}
                onChange={(e) =>
                  updateSection(selectedSection.id, (s) => ({
                    ...s,
                    settings: { ...(s.settings || {}), heading: e.target.value },
                  }))
                }
              />
              <Textarea
                label="Subcopy"
                value={String((selectedSection.settings as any)?.subcopy || "")}
                onChange={(e) =>
                  updateSection(selectedSection.id, (s) => ({
                    ...s,
                    settings: { ...(s.settings || {}), subcopy: e.target.value },
                  }))
                }
                rows={4}
              />
              <Input
                label="CTA text"
                value={String((selectedSection.settings as any)?.ctaText || "")}
                onChange={(e) =>
                  updateSection(selectedSection.id, (s) => ({
                    ...s,
                    settings: { ...(s.settings || {}), ctaText: e.target.value },
                  }))
                }
              />
              <Input
                label="CTA href"
                value={String((selectedSection.settings as any)?.ctaHref || "#lead-form")}
                onChange={(e) =>
                  updateSection(selectedSection.id, (s) => ({
                    ...s,
                    settings: { ...(s.settings || {}), ctaHref: e.target.value },
                  }))
                }
              />
            </div>
          ) : selectedId === "application" ? (
            <div className="flex flex-col gap-4">
              <Input
                label="Form heading"
                value={content.application.heading}
                onChange={(e) => setContent({ ...content, application: { ...content.application, heading: e.target.value } })}
              />
              <Textarea
                label="Form subcopy"
                value={content.application.subcopy}
                onChange={(e) => setContent({ ...content, application: { ...content.application, subcopy: e.target.value } })}
                rows={3}
              />
            </div>
          ) : selectedId === "__whatsapp" ? (
            <div className="flex flex-col gap-4">
              <Select
                label="Enabled"
                value={content.whatsapp?.enabled ? "yes" : "no"}
                onChange={(e) => {
                  const enabled = e.target.value === "yes";
                  setContent({
                    ...content,
                    whatsapp: {
                      ...(content.whatsapp || homepageDefaults.whatsapp!),
                      enabled,
                    },
                  });
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
                  setContent({
                    ...content,
                    whatsapp: { ...(content.whatsapp || homepageDefaults.whatsapp!), phone: e.target.value },
                  })
                }
              />
              <Textarea
                label="Message"
                value={content.whatsapp?.message || ""}
                onChange={(e) =>
                  setContent({
                    ...content,
                    whatsapp: { ...(content.whatsapp || homepageDefaults.whatsapp!), message: e.target.value },
                  })
                }
                rows={3}
              />
              <Input
                label="Tooltip"
                value={content.whatsapp?.tooltip || ""}
                onChange={(e) =>
                  setContent({
                    ...content,
                    whatsapp: { ...(content.whatsapp || homepageDefaults.whatsapp!), tooltip: e.target.value },
                  })
                }
              />
              <Input
                label="Modal title"
                value={content.whatsapp?.modalTitle || ""}
                onChange={(e) =>
                  setContent({
                    ...content,
                    whatsapp: { ...(content.whatsapp || homepageDefaults.whatsapp!), modalTitle: e.target.value },
                  })
                }
              />
              <Input
                label="Modal subtitle"
                value={content.whatsapp?.modalSubtitle || ""}
                onChange={(e) =>
                  setContent({
                    ...content,
                    whatsapp: { ...(content.whatsapp || homepageDefaults.whatsapp!), modalSubtitle: e.target.value },
                  })
                }
              />
              <Input
                label="Button text"
                value={content.whatsapp?.buttonText || ""}
                onChange={(e) =>
                  setContent({
                    ...content,
                    whatsapp: { ...(content.whatsapp || homepageDefaults.whatsapp!), buttonText: e.target.value },
                  })
                }
              />
              <Input
                label="Header color"
                value={content.whatsapp?.headerColorHex || ""}
                onChange={(e) =>
                  setContent({
                    ...content,
                    whatsapp: { ...(content.whatsapp || homepageDefaults.whatsapp!), headerColorHex: e.target.value },
                  })
                }
              />
              <Select
                label="Position"
                value={content.whatsapp?.position === "left" ? "left" : "right"}
                onChange={(e) =>
                  setContent({
                    ...content,
                    whatsapp: { ...(content.whatsapp || homepageDefaults.whatsapp!), position: e.target.value as any },
                  })
                }
                options={[
                  { value: "right", label: "Right" },
                  { value: "left", label: "Left" },
                ]}
              />
              <Input
                label="Delay (ms)"
                type="number"
                value={String(content.whatsapp?.delayMs ?? "")}
                onChange={(e) =>
                  setContent({
                    ...content,
                    whatsapp: {
                      ...(content.whatsapp || homepageDefaults.whatsapp!),
                      delayMs: e.target.value.trim().length ? Number(e.target.value) : undefined,
                    },
                  })
                }
                placeholder="15000"
              />
              <Select
                label="Auto open"
                value={content.whatsapp?.autoOpen ? "yes" : "no"}
                onChange={(e) =>
                  setContent({
                    ...content,
                    whatsapp: { ...(content.whatsapp || homepageDefaults.whatsapp!), autoOpen: e.target.value === "yes" },
                  })
                }
                options={[
                  { value: "no", label: "No" },
                  { value: "yes", label: "Yes" },
                ]}
              />
              <Input
                label="Avatar URL"
                value={content.whatsapp?.avatar?.url || ""}
                onChange={(e) =>
                  setContent({
                    ...content,
                    whatsapp: {
                      ...(content.whatsapp || homepageDefaults.whatsapp!),
                      avatar: e.target.value.trim().length
                        ? { url: e.target.value, path: content.whatsapp?.avatar?.path }
                        : undefined,
                    },
                  })
                }
              />
            </div>
          ) : sectionItems.find((s) => s.id === selectedId)?.type === "custom" ? (
            <div className="flex flex-col gap-4">
              <Textarea
                label="Custom HTML"
                value={(content.customSections || []).find((c) => c.id === selectedId)?.html || ""}
                onChange={(e) => {
                  const nextCustom = (content.customSections || []).map((c) =>
                    c.id === selectedId ? { ...c, html: e.target.value } : c,
                  );
                  setContent({ ...content, customSections: nextCustom });
                }}
                rows={8}
              />
              <Textarea
                label="Custom CSS"
                value={(content.customSections || []).find((c) => c.id === selectedId)?.css || ""}
                onChange={(e) => {
                  const nextCustom = (content.customSections || []).map((c) =>
                    c.id === selectedId ? { ...c, css: e.target.value } : c,
                  );
                  setContent({ ...content, customSections: nextCustom });
                }}
                rows={6}
              />
              <Textarea
                label="Custom JS"
                value={(content.customSections || []).find((c) => c.id === selectedId)?.js || ""}
                onChange={(e) => {
                  const nextCustom = (content.customSections || []).map((c) =>
                    c.id === selectedId ? { ...c, js: e.target.value } : c,
                  );
                  setContent({ ...content, customSections: nextCustom });
                }}
                rows={6}
              />
            </div>
          ) : (
            <div className="text-sm text-slate-600 dark:text-slate-400">Select a section to edit.</div>
          )}

          <div className="mt-6 rounded-xl border border-slate-200 p-3 text-xs text-slate-600 dark:border-white/10 dark:text-slate-300">
            <div className="font-semibold">JSON mode fallback</div>
            <div className="mt-1">Use the Homepage tab for full JSON editing if needed.</div>
          </div>
        </div>
      </div>

      <MediaPickerModal
        supabase={supabase}
        open={mediaOpen}
        title={mediaTitle}
        accept={mediaAccept}
        onClose={() => setMediaOpen(false)}
        onPick={(asset) => {
          mediaPickRef.current?.(asset);
        }}
      />
    </div>
  );
}
