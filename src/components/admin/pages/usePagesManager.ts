import type { SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useMemo, useState } from "react";
import { nowId, normalizeSlug, toSections, withSections, type PageSection, type SitePage } from "@/components/admin/pages/types";

export function usePagesManager(supabase: SupabaseClient) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [pages, setPages] = useState<SitePage[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [navLabel, setNavLabel] = useState("");
  const [showHeader, setShowHeader] = useState(false);
  const [showFooter, setShowFooter] = useState(true);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [sections, setSections] = useState<PageSection[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  const selected = useMemo(() => pages.find((p) => p.id === selectedId) || null, [pages, selectedId]);
  const selectedSection = useMemo(
    () => sections.find((s) => s.id === selectedSectionId) || null,
    [sections, selectedSectionId],
  );

  async function loadPages() {
    setError(null);
    setSaved(null);
    setLoading(true);
    try {
      const { data, error: err } = await supabase
        .from("site_pages")
        .select(
          "id, slug, title, nav_label, show_in_header_nav, show_in_footer_nav, status, meta_title, meta_description, draft_content, published_content, updated_at",
        )
        .order("updated_at", { ascending: false });
      if (err) {
        setError(err.message);
        return;
      }
      const rows = (data || []) as SitePage[];
      setPages(rows);
      if (!selectedId && rows.length) setSelectedId(rows[0].id);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPages();
  }, []);

  useEffect(() => {
    if (!selected) return;
    setTitle(selected.title || "");
    setSlug(selected.slug || "");
    setNavLabel(selected.nav_label || "");
    setShowHeader(Boolean(selected.show_in_header_nav));
    setShowFooter(Boolean(selected.show_in_footer_nav));
    setMetaTitle(selected.meta_title || "");
    setMetaDescription(selected.meta_description || "");
    setStatus(selected.status || "draft");
    const nextSections = toSections(selected.draft_content);
    setSections(nextSections);
    setSelectedSectionId(nextSections[0]?.id || null);
  }, [selectedId]);

  async function saveDraft() {
    if (!selected) return;
    setError(null);
    setSaved(null);
    setLoading(true);
    try {
      const t = title.trim();
      const s = normalizeSlug(slug);
      if (!t.length) {
        setError("Title is required");
        return;
      }
      if (!s.length) {
        setError("Slug is required");
        return;
      }
      const { error: err } = await supabase
        .from("site_pages")
        .update({
          title: t,
          slug: s,
          nav_label: navLabel.trim().length ? navLabel.trim() : null,
          show_in_header_nav: showHeader,
          show_in_footer_nav: showFooter,
          meta_title: metaTitle.trim().length ? metaTitle.trim() : null,
          meta_description: metaDescription.trim().length ? metaDescription.trim() : null,
          status,
          draft_content: withSections(sections),
          updated_at: new Date().toISOString(),
        })
        .eq("id", selected.id);
      if (err) {
        setError(err.message);
        return;
      }
      setSaved("Draft saved");
      await loadPages();
    } finally {
      setLoading(false);
    }
  }

  async function publish() {
    if (!selected) return;
    setError(null);
    setSaved(null);
    setLoading(true);
    try {
      const t = title.trim();
      const s = normalizeSlug(slug);
      const draft = withSections(sections);
      const { error: err } = await supabase
        .from("site_pages")
        .update({
          title: t,
          slug: s,
          nav_label: navLabel.trim().length ? navLabel.trim() : null,
          show_in_header_nav: showHeader,
          show_in_footer_nav: showFooter,
          meta_title: metaTitle.trim().length ? metaTitle.trim() : null,
          meta_description: metaDescription.trim().length ? metaDescription.trim() : null,
          status: "published",
          draft_content: draft,
          published_content: draft,
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", selected.id);
      if (err) {
        setError(err.message);
        return;
      }
      setStatus("published");
      setSaved("Published");
      await loadPages();
    } finally {
      setLoading(false);
    }
  }

  async function unpublish() {
    if (!selected) return;
    setError(null);
    setSaved(null);
    setLoading(true);
    try {
      const { error: err } = await supabase
        .from("site_pages")
        .update({ status: "draft", updated_at: new Date().toISOString() })
        .eq("id", selected.id);
      if (err) {
        setError(err.message);
        return;
      }
      setStatus("draft");
      setSaved("Unpublished");
      await loadPages();
    } finally {
      setLoading(false);
    }
  }

  async function revertDraft() {
    if (!selected) return;
    setError(null);
    setSaved(null);
    setLoading(true);
    try {
      const nextSections = toSections(selected.published_content);
      setSections(nextSections);
      setSelectedSectionId(nextSections[0]?.id || null);
      const { error: err } = await supabase
        .from("site_pages")
        .update({ draft_content: selected.published_content, updated_at: new Date().toISOString() })
        .eq("id", selected.id);
      if (err) {
        setError(err.message);
        return;
      }
      setSaved("Reverted to published");
      await loadPages();
    } finally {
      setLoading(false);
    }
  }

  async function createNew() {
    setError(null);
    setSaved(null);
    setLoading(true);
    try {
      const t = title.trim();
      const s = normalizeSlug(slug);
      if (!t.length) {
        setError("Title is required");
        return;
      }
      if (!s.length) {
        setError("Slug is required");
        return;
      }
      const initial: PageSection[] = [
        { id: nowId("rich"), type: "rich_text", enabled: true, settings: { title: t, content: "<p>Update this content.</p>" } },
      ];
      const { error: err } = await supabase
        .from("site_pages")
        .insert({
          title: t,
          slug: s,
          nav_label: navLabel.trim().length ? navLabel.trim() : null,
          show_in_header_nav: showHeader,
          show_in_footer_nav: showFooter,
          status: "draft",
          meta_title: metaTitle.trim().length ? metaTitle.trim() : null,
          meta_description: metaDescription.trim().length ? metaDescription.trim() : null,
          draft_content: withSections(initial),
          published_content: withSections(initial),
        });
      if (err) {
        setError(err.message);
        return;
      }
      setSaved("Page created");
      await loadPages();
    } finally {
      setLoading(false);
    }
  }

  async function deleteSelected() {
    if (!selected) return;
    setError(null);
    setSaved(null);
    setLoading(true);
    try {
      const { error: err } = await supabase.from("site_pages").delete().eq("id", selected.id);
      if (err) {
        setError(err.message);
        return;
      }
      setSelectedId(null);
      setSaved("Deleted");
      await loadPages();
    } finally {
      setLoading(false);
    }
  }

  function addRichTextSection() {
    const id = nowId("rich");
    const next: PageSection[] = [...sections, { id, type: "rich_text", enabled: true, settings: { title: "", content: "<p></p>" } }];
    setSections(next);
    setSelectedSectionId(id);
  }

  function updateSection(next: PageSection) {
    setSections((prev) => prev.map((s) => (s.id === next.id ? next : s)));
  }

  function deleteSection(id: string) {
    const next = sections.filter((s) => s.id !== id);
    setSections(next);
    setSelectedSectionId(next[0]?.id || null);
  }

  return {
    loading, error, saved,
    pages, selectedId, setSelectedId, selected,
    title, setTitle, slug, setSlug,
    navLabel, setNavLabel,
    showHeader, setShowHeader, showFooter, setShowFooter,
    metaTitle, setMetaTitle, metaDescription, setMetaDescription,
    status, setStatus,
    sections, selectedSectionId, setSelectedSectionId, selectedSection,
    loadPages, saveDraft, publish, unpublish, revertDraft, createNew, deleteSelected,
    addRichTextSection, updateSection, deleteSection,
  };
}
