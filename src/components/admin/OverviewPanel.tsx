import type { SupabaseClient } from "@supabase/supabase-js";
import { Files, ImageIcon, LayoutDashboard, PaintBucket, Settings, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { Tab } from "./types";

type Props = {
  supabase: SupabaseClient;
  onTabChange: (tab: Tab) => void;
};

type Snapshot = {
  publishedUpdatedAt: string | null;
  draftUpdatedAt: string | null;
  hasDraft: boolean;
  lastBackupAt: string | null;
  leadsTotal: number;
  leadsNew: number;
  pagesTotal: number;
  pagesPublished: number;
};

function safeDate(v: string | null) {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return d.toLocaleString();
}

export function OverviewPanel({ supabase, onTabChange }: Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snap, setSnap] = useState<Snapshot>({
    publishedUpdatedAt: null,
    draftUpdatedAt: null,
    hasDraft: false,
    lastBackupAt: null,
    leadsTotal: 0,
    leadsNew: 0,
    pagesTotal: 0,
    pagesPublished: 0,
  });

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [pub, draft, backup, leads, pages] = await Promise.all([
          supabase.from("homepage_content").select("updated_at").eq("id", 1).maybeSingle(),
          supabase.from("homepage_content_drafts").select("content, updated_at").eq("id", 1).maybeSingle(),
          supabase
            .from("homepage_content_versions")
            .select("created_at")
            .eq("homepage_id", 1)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
          supabase.from("leads").select("id, status"),
          supabase.from("site_pages").select("id, status"),
        ]);

        if (!alive) return;
        if (pub.error) throw new Error(pub.error.message);
        if (draft.error) throw new Error(draft.error.message);
        if (backup.error) throw new Error(backup.error.message);
        if (leads.error) throw new Error(leads.error.message);
        if (pages.error) throw new Error(pages.error.message);

        const draftContent = (draft.data as any)?.content || null;
        const hasDraft = Boolean(draftContent && typeof draftContent === "object" && Object.keys(draftContent).length);

        const leadsRows = (leads.data || []) as any[];
        const leadsNew = leadsRows.filter((l) => String(l.status || "") === "new").length;

        const pagesRows = (pages.data || []) as any[];
        const pagesPublished = pagesRows.filter((p) => String(p.status || "") === "published").length;

        setSnap({
          publishedUpdatedAt: (pub.data as any)?.updated_at || null,
          draftUpdatedAt: (draft.data as any)?.updated_at || null,
          hasDraft,
          lastBackupAt: (backup.data as any)?.created_at || null,
          leadsTotal: leadsRows.length,
          leadsNew,
          pagesTotal: pagesRows.length,
          pagesPublished,
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load overview");
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [supabase]);

  const cards: { tab: Tab; title: string; desc: string; icon: any }[] = [
    {
      tab: "builder",
      title: "Homepage Builder",
      desc: "Edit your main landing page layout and content.",
      icon: LayoutDashboard,
    },
    {
      tab: "pages",
      title: "Pages",
      desc: "Manage your CMS pages and navigation.",
      icon: Files,
    },
    {
      tab: "leads",
      title: "Leads",
      desc: "View and manage incoming applications.",
      icon: Users,
    },
    {
      tab: "media",
      title: "Media Manager",
      desc: "Upload and manage images and assets.",
      icon: ImageIcon,
    },
    {
      tab: "theme",
      title: "Theme Studio",
      desc: "Manage brand colors, fonts, and global settings.",
      icon: PaintBucket,
    },
    {
      tab: "settings",
      title: "Settings",
      desc: "Configure admin emails and system operations.",
      icon: Settings,
    },
  ];

  const statusLine = useMemo(() => {
    if (loading) return "Loading site status…";
    if (error) return "Status unavailable";
    const draftText = snap.hasDraft ? "Draft present" : "No draft";
    return `${draftText} • Published: ${safeDate(snap.publishedUpdatedAt)}`;
  }, [error, loading, snap.hasDraft, snap.publishedUpdatedAt]);

  return (
    <div className="mx-auto w-full max-w-6xl p-6 lg:p-10">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Overview</h1>
          <p className="mt-2 text-sm text-white/60">Operational status, recent changes, and quick actions.</p>
          <div className="mt-3 text-xs text-white/55">{statusLine}</div>
        </div>
        <Button
          variant="secondary"
          className="h-10"
          disabled={loading}
          onClick={() => {
            window.location.reload();
          }}
        >
          Refresh
        </Button>
      </div>

      {error ? (
        <div className="mb-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-white/50">Homepage</div>
          <div className="mt-2 text-sm font-semibold text-white">{snap.hasDraft ? "Draft in progress" : "Published only"}</div>
          <div className="mt-1 text-xs text-white/55">Published: {safeDate(snap.publishedUpdatedAt)}</div>
          <div className="mt-1 text-xs text-white/55">Draft: {safeDate(snap.draftUpdatedAt)}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-white/50">Backups</div>
          <div className="mt-2 text-sm font-semibold text-white">Last backup</div>
          <div className="mt-1 text-xs text-white/55">{safeDate(snap.lastBackupAt)}</div>
          <div className="mt-3">
            <Button className="h-9" onClick={() => onTabChange("builder")}>
              Go to builder
            </Button>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-white/50">Leads</div>
          <div className="mt-2 text-sm font-semibold text-white">{snap.leadsTotal} total</div>
          <div className="mt-1 text-xs text-white/55">{snap.leadsNew} new</div>
          <div className="mt-3">
            <Button className="h-9" onClick={() => onTabChange("leads")}>
              Open leads
            </Button>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-white/50">Pages</div>
          <div className="mt-2 text-sm font-semibold text-white">{snap.pagesTotal} total</div>
          <div className="mt-1 text-xs text-white/55">{snap.pagesPublished} published</div>
          <div className="mt-3">
            <Button className="h-9" onClick={() => onTabChange("pages")}>
              Open pages
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <button
            key={c.tab}
            type="button"
            onClick={() => onTabChange(c.tab)}
            className="group flex flex-col items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 text-left shadow-sm transition hover:border-[var(--cf-accent)]/40 hover:bg-white/7"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-white/80 transition group-hover:bg-[var(--cf-accent)]/12 group-hover:text-[var(--cf-accent)]">
              <c.icon size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">{c.title}</h2>
              <p className="mt-1 text-sm text-white/60">{c.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
