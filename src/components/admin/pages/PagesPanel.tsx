import type { SupabaseClient } from "@supabase/supabase-js";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { PagesList } from "@/components/admin/pages/PagesList";
import { PagePreview } from "@/components/admin/pages/PagePreview";
import { PageEditor } from "@/components/admin/pages/PageEditor";
import { SectionsList } from "@/components/admin/pages/SectionsList";
import { RichTextInspector } from "@/components/admin/pages/RichTextInspector";
import { usePagesManager } from "@/components/admin/pages/usePagesManager";

type Props = {
  supabase: SupabaseClient;
};

export function PagesPanel({ supabase }: Props) {
  const m = usePagesManager(supabase);
  const [previewMode, setPreviewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");

  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-[var(--cf-bg)]">
      <div className="border-b border-white/10 bg-[var(--cf-secondary)] px-4 py-4 lg:px-6">
        <div className="text-lg font-bold text-white">Pages</div>
        <div className="mt-1 text-sm text-white/60">
          Create and publish Privacy Policy, Terms of Service, Contact, and custom pages.
        </div>
      </div>

      {m.error ? (
        <div className="border-b border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200 lg:px-6">
          {m.error}
        </div>
      ) : null}
      {m.saved ? (
        <div className="border-b border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200 lg:px-6">
          {m.saved}
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden p-3 lg:flex-row">
        <div className="flex h-full min-h-0 flex-col rounded-2xl border border-white/10 bg-white/5 p-3 lg:w-[280px] lg:flex-none">
          <div className="text-xs font-bold uppercase tracking-wide text-white/50">All Pages</div>
          <PagesList pages={m.pages} selectedId={m.selectedId} onSelect={m.setSelectedId} />
          <div className="mt-3 border-t border-white/10 pt-3">
            <Button className="h-10 w-full" disabled={m.loading} onClick={m.loadPages}>
              Refresh
            </Button>
          </div>
        </div>

        <div className="flex h-full min-h-0 flex-1 flex-col gap-3 overflow-hidden">
          <PageEditor
            loading={m.loading}
            title={m.title}
            slug={m.slug}
            navLabel={m.navLabel}
            metaTitle={m.metaTitle}
            metaDescription={m.metaDescription}
            showHeader={m.showHeader}
            showFooter={m.showFooter}
            status={m.status}
            onTitleChange={m.setTitle}
            onSlugChange={m.setSlug}
            onNavLabelChange={m.setNavLabel}
            onMetaTitleChange={m.setMetaTitle}
            onMetaDescriptionChange={m.setMetaDescription}
            onShowHeaderChange={m.setShowHeader}
            onShowFooterChange={m.setShowFooter}
            onStatusChange={m.setStatus}
            onSaveDraft={m.saveDraft}
            onPublish={m.publish}
            onUnpublish={m.unpublish}
            onRevertDraft={m.revertDraft}
            onDelete={m.deleteSelected}
            onCreateNew={m.createNew}
          />

          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden lg:flex-row">
            <SectionsList
              sections={m.sections}
              selectedSectionId={m.selectedSectionId}
              onSelect={m.setSelectedSectionId}
              onAdd={m.addRichTextSection}
            />

            <PagePreview slug={m.slug} mode={previewMode} onModeChange={setPreviewMode} sections={m.sections} />

            <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-white/10 bg-white/5 p-4 lg:w-[420px] lg:flex-none">
              <div className="text-xs font-bold uppercase tracking-wide text-white/50">Inspector</div>
              <div className="mt-3 min-h-0 flex-1 overflow-y-auto">
                <RichTextInspector
                  section={m.selectedSection}
                  onChange={m.updateSection}
                  onDelete={() => {
                    if (m.selectedSectionId) m.deleteSection(m.selectedSectionId);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
