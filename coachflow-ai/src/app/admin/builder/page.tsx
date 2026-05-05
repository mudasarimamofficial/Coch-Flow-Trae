"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ChevronLeft, Monitor, Play, Save, Smartphone, Tablet, Undo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdminFetch } from "@/hooks/useAdminFetch";
import { mergeLandingV1 } from "@/components/site/landingV1/landingV1Model";
import { pickLanding, pickBuilderState, mergeBuilderState } from "@/components/site/landingV1/sections";
import { SectionListPanel } from "@/components/admin/builder/SectionListPanel";
import {
  addSection,
  canDelete,
  canDuplicate,
  deleteSection,
  duplicateSection,
  moveSection,
  toggleSection,
  updateSectionProps,
} from "@/components/admin/builder/model";
import { InspectorPanel } from "@/components/admin/builder/InspectorPanel";
import type { LandingSectionType } from "@/components/site/landingV1/sections";

type Device = "desktop" | "tablet" | "mobile";

function deviceWidth(device: Device) {
  if (device === "mobile") return 375;
  if (device === "tablet") return 768;
  return 1280;
}

type HomepagePayload = {
  published: { content: unknown; updated_at: string } | null;
  draft: { content: unknown; updated_at: string; published_updated_at: string | null } | null;
  versions: Array<{ id: number; created_at: string; created_by: string | null }>;
};

export default function BuilderPage() {
  const adminFetch = useAdminFetch();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const saveTimer = useRef<number | null>(null);
  const autosaveController = useRef<AbortController | null>(null);
  const latestEditorContent = useRef<any>({});

  const [device, setDevice] = useState<Device>("desktop");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [conflict, setConflict] = useState<string | null>(null);
  const [publishedUpdatedAt, setPublishedUpdatedAt] = useState<string | null>(null);
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [baseContent, setBaseContent] = useState<any>({});
  const [draftContent, setDraftContent] = useState<any>({});
  const [versions, setVersions] = useState<HomepagePayload["versions"]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const editorContent = useMemo(() => {
    const current = draftContent && Object.keys(draftContent).length ? draftContent : baseContent;
    return current;
  }, [baseContent, draftContent]);

  useEffect(() => {
    latestEditorContent.current = editorContent;
  }, [editorContent]);

  const landing = useMemo(() => pickLanding(editorContent), [editorContent]);
  const builder = useMemo(() => pickBuilderState(editorContent), [editorContent]);

  const selectedSection = useMemo(() => {
    if (!selectedId) return null;
    return builder.sections.find((s) => s.id === selectedId) || null;
  }, [builder.sections, selectedId]);

  useEffect(() => {
    let mounted = true;
    adminFetch("/api/admin/homepage")
      .then((r) => r.json())
      .then((j) => {
        if (!mounted || !j?.ok) return;
        setBaseContent(j.published?.content ?? {});
        setPublishedAt(j.published?.updated_at ?? null);
        setDraftContent(j.draft?.content ?? {});
        setPublishedUpdatedAt(j.draft?.published_updated_at ?? j.published?.updated_at ?? null);
        setVersions(j.versions ?? []);
        const c = j.draft?.content ?? j.published?.content ?? {};
        const b = pickBuilderState(c);
        setSelectedId(b.sections[0]?.id ?? null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [adminFetch]);

  useEffect(() => {
    const f = iframeRef.current;
    if (!f?.contentWindow) return;
    f.contentWindow.postMessage({ type: "coachflow_builder_preview", content: editorContent }, window.location.origin);
  }, [editorContent]);

  useEffect(() => {
    const f = iframeRef.current;
    if (!f?.contentWindow) return;
    f.contentWindow.postMessage({ type: "coachflow_builder_highlight_section", sectionId: selectedId }, window.location.origin);
  }, [selectedId]);

  function postPreviewState() {
    const f = iframeRef.current;
    if (!f?.contentWindow) return;
    f.contentWindow.postMessage({ type: "coachflow_builder_preview", content: latestEditorContent.current }, window.location.origin);
    f.contentWindow.postMessage({ type: "coachflow_builder_highlight_section", sectionId: selectedId }, window.location.origin);
  }

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (!e?.data || typeof e.data !== "object") return;
      if (e.origin !== window.location.origin) return;
      const d = e.data as any;
      if (d.type !== "coachflow_builder_select_section") return;
      const id = typeof d.sectionId === "string" ? d.sectionId : null;
      if (!id) return;
      if (builder.sections.some((s) => s.id === id)) setSelectedId(id);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [builder.sections]);

  function cancelAutosave() {
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = null;
    autosaveController.current?.abort();
    autosaveController.current = null;
  }

  async function persistDraft(nextDraft: any, label = "Draft saved") {
    cancelAutosave();
    const res = await adminFetch("/api/admin/homepage", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ content: nextDraft, published_updated_at: publishedUpdatedAt }),
    });
    const j = await res.json().catch(() => null);
    if (j?.ok) {
      setPublishedUpdatedAt(j.published_updated_at ?? publishedUpdatedAt);
      setStatus(label);
      return true;
    }
    setStatus(j?.message || "Save failed");
    return false;
  }

  function scheduleAutosave(nextDraft: any) {
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    autosaveController.current?.abort();
    const controller = new AbortController();
    autosaveController.current = controller;
    saveTimer.current = window.setTimeout(() => {
      adminFetch("/api/admin/homepage", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content: nextDraft, published_updated_at: publishedUpdatedAt }),
        signal: controller.signal,
      })
        .then((r) => r.json())
        .then((j) => {
          if (controller.signal.aborted) return;
          if (j?.ok) {
            setPublishedUpdatedAt(j.published_updated_at ?? publishedUpdatedAt);
            setStatus("Draft saved");
          } else {
            setStatus(j?.message || "Save failed");
          }
        })
        .catch(() => {
          if (!controller.signal.aborted) setStatus("Save failed");
        })
        .finally(() => {
          if (autosaveController.current === controller) autosaveController.current = null;
        });
    }, 650);
  }

  function applyLanding(nextLanding: any) {
    const merged = mergeLandingV1(editorContent, nextLanding);
    setDraftContent(merged);
    scheduleAutosave(merged);
  }

  function applyBuilder(nextSections: any) {
    const merged = mergeBuilderState(editorContent, { version: 1, sections: nextSections });
    setDraftContent(merged);
    scheduleAutosave(merged);
  }

  async function saveNow() {
    setStatus("Saving...");
    await persistDraft(latestEditorContent.current);
  }

  async function revertDraft() {
    cancelAutosave();
    setStatus("Reverting...");
    const res = await adminFetch("/api/admin/homepage/revert", { method: "POST" });
    const j = await res.json().catch(() => null);
    if (j?.ok) {
      setDraftContent({});
      setPublishedUpdatedAt(publishedAt);
      setStatus("Draft cleared");
    } else {
      setStatus(j?.message || "Revert failed");
    }
  }

  async function restoreVersion(versionId: number) {
    cancelAutosave();
    setStatus("Restoring... ");
    const res = await adminFetch("/api/admin/homepage/version", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ versionId }),
    });
    const j = await res.json().catch(() => null);
    if (j?.ok) {
      const next = await adminFetch("/api/admin/homepage").then((r) => r.json());
      setDraftContent(next.draft?.content ?? {});
      setPublishedUpdatedAt(next.draft?.published_updated_at ?? next.published?.updated_at ?? publishedAt);
      setVersions(next.versions ?? []);
      setStatus("Version restored to draft");
    } else {
      setStatus(j?.message || "Restore failed");
    }
  }

  async function publish(force?: boolean) {
    setConflict(null);
    setStatus("Saving latest draft...");
    const saved = await persistDraft(latestEditorContent.current, "Draft saved");
    if (!saved) return;
    setStatus("Publishing...");
    const res = await adminFetch("/api/admin/homepage/publish", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ force: Boolean(force) }),
    });
    const j = await res.json().catch(() => null);
    if (res.status === 409 && j?.conflict) {
      setConflict("The published homepage changed since you started editing.");
      setStatus(null);
      return;
    }
    if (!j?.ok) {
      setStatus(j?.message || "Publish failed");
      return;
    }
    const next = await adminFetch("/api/admin/homepage").then((r) => r.json());
    setBaseContent(next.published?.content ?? {});
    setPublishedAt(next.published?.updated_at ?? null);
    setPublishedUpdatedAt(next.published?.updated_at ?? null);
    setDraftContent({});
    setVersions(next.versions ?? []);
    setStatus("Published");
  }

  return (
    <div className="flex min-h-[calc(100vh-56px)] w-full flex-col bg-surface-950 text-surface-50 lg:h-[calc(100vh-56px-64px)] lg:min-h-[760px]">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-surface-800 bg-surface-950 px-3 py-3 lg:h-14 lg:px-4 lg:py-0">
        <div className="flex min-w-0 items-center gap-3 lg:gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Homepage Builder</span>
            <span className="text-xs text-surface-500">{loading ? "Loading..." : status || ""}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 rounded-md border border-surface-800 bg-surface-900 p-1">
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 rounded-sm ${device === "desktop" ? "bg-surface-800 text-surface-50" : "text-surface-400"}`}
            onClick={() => setDevice("desktop")}
          >
            <Monitor className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 rounded-sm ${device === "tablet" ? "bg-surface-800 text-surface-50" : "text-surface-400"}`}
            onClick={() => setDevice("tablet")}
          >
            <Tablet className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`h-8 w-8 rounded-sm ${device === "mobile" ? "bg-surface-800 text-surface-50" : "text-surface-400"}`}
            onClick={() => setDevice("mobile")}
          >
            <Smartphone className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <Button variant="ghost" size="icon" className="text-surface-400 hover:text-surface-50" onClick={revertDraft}>
            <Undo className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="sm" className="gap-2" onClick={saveNow}>
            <Save className="h-4 w-4" />
            Save Draft
          </Button>
          <Button variant="primary" size="sm" className="gap-2" onClick={() => publish(false)}>
            <Play className="h-4 w-4" />
            Publish
          </Button>
        </div>
      </header>

      {conflict ? (
        <div className="flex items-center justify-between gap-3 border-b border-amber-500/20 bg-amber-500/10 px-4 py-3">
          <div className="flex items-center gap-2 text-amber-400 text-sm">
            <AlertTriangle className="h-4 w-4" />
            {conflict}
          </div>
          <Button variant="outline" size="sm" className="border-amber-500/30 text-amber-300" onClick={() => publish(true)}>
            Publish anyway
          </Button>
        </div>
      ) : null}

      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        <SectionListPanel
          sections={builder.sections}
          selectedId={selectedId}
          onSelect={(id) => setSelectedId(id)}
          onMove={(id, dir) => {
            const idx = builder.sections.findIndex((s) => s.id === id);
            if (idx === -1) return;
            const to = idx + dir;
            if (to < 0 || to >= builder.sections.length) return;
            applyBuilder(moveSection(builder.sections, idx, to));
          }}
          onReorder={(next) => applyBuilder(next)}
          onToggle={(id) => applyBuilder(toggleSection(builder.sections, id))}
          onDelete={(id) => {
            const s = builder.sections.find((x) => x.id === id);
            if (!s || !canDelete(s)) return;
            const yes = confirm("Remove this section from the page? Content is preserved in drafts.");
            if (!yes) return;
            const next = deleteSection(builder.sections, id);
            applyBuilder(next);
            if (selectedId === id) setSelectedId(next[0]?.id ?? null);
          }}
          onDuplicate={(id) => {
            const s = builder.sections.find((x) => x.id === id);
            if (!s || !canDuplicate(s)) return;
            applyBuilder(duplicateSection(builder.sections, id));
          }}
          onAdd={(type: LandingSectionType) => {
            const next = addSection(builder.sections, type);
            applyBuilder(next);
            setSelectedId(next[next.length - 1]?.id ?? null);
          }}
        />

        <main className="relative flex min-h-[560px] flex-1 items-center justify-center overflow-hidden bg-[#121212] p-3 lg:p-6">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
          <div
            className="bg-white rounded-md shadow-2xl relative transition-all duration-300 ring-1 ring-surface-800 overflow-hidden flex flex-col z-10"
            style={{ width: deviceWidth(device), height: "100%", maxWidth: "100%" }}
          >
            <div className="h-8 bg-surface-100 border-b border-surface-200 flex items-center px-4 gap-2 shrink-0">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-surface-300" />
                <div className="w-2.5 h-2.5 rounded-full bg-surface-300" />
                <div className="w-2.5 h-2.5 rounded-full bg-surface-300" />
              </div>
              <div className="mx-auto bg-white rounded flex items-center justify-center h-5 w-56 text-[10px] text-surface-400 border border-surface-200 shadow-sm">
                coachflow.ai/preview
              </div>
            </div>
            <iframe
              ref={iframeRef}
              title="Preview"
              src={`/preview?device=${device}`}
              className="flex-1 w-full bg-white"
              onLoad={postPreviewState}
            />
          </div>
        </main>

        <InspectorPanel
          section={selectedSection}
          landing={landing}
          onLandingChange={(nextLanding) => applyLanding(nextLanding)}
          onSectionPropsChange={(sectionId, props) => {
            applyBuilder(updateSectionProps(builder.sections, sectionId, props));
          }}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-surface-800 bg-surface-950 px-4 py-3">
        <div className="text-xs text-surface-500">Homepage versions (restore into draft)</div>
        <div className="flex gap-2 flex-wrap justify-end">
          {versions.slice(0, 6).map((v) => (
            <Button key={v.id} variant="outline" size="sm" className="border-surface-800" onClick={() => restoreVersion(v.id)}>
              Restore #{v.id}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
