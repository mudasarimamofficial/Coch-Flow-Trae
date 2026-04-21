import type { SupabaseClient } from "@supabase/supabase-js";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { PagesList } from "@/components/admin/pages/PagesList";
import { PageEditor } from "@/components/admin/pages/PageEditor";
import { SectionsList } from "@/components/admin/pages/SectionsList";
import { RichTextInspector } from "@/components/admin/pages/RichTextInspector";
import { usePagesManager } from "@/components/admin/pages/usePagesManager";
import { NewPageModal } from "@/components/admin/pages/NewPageModal";

type Props = {
  supabase: SupabaseClient;
};

export function PagesPanel({ supabase }: Props) {
  const m = usePagesManager(supabase);
  const [newPageOpen, setNewPageOpen] = useState(false);

  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-[var(--cf-bg)]">
      <div className="border-b border-white/10 bg-[var(--cf-surface)] px-4 py-4 lg:px-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="text-lg font-semibold text-white">Pages</div>
            <div className="mt-1 text-sm text-white/60">Create and publish pages with a focused editing flow.</div>
          </div>
          <div className="flex items-center gap-2">
            <Button className="h-10" disabled={m.loading} onClick={() => setNewPageOpen(true)}>
              New page
            </Button>
            <Button variant="secondary" className="h-10" disabled={m.loading} onClick={m.loadPages}>
              Refresh
            </Button>
          </div>
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
        <div className="flex h-full min-h-0 flex-col rounded-2xl border border-white/10 bg-[var(--cf-surface-container)] p-3 lg:w-[320px] lg:flex-none">
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/50">All pages</div>
            <div className="text-xs text-white/40">{m.pages.length}</div>
          </div>
          <PagesList pages={m.pages} selectedId={m.selectedId} onSelect={m.setSelectedId} />
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
          />

          <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden lg:flex-row">
            <SectionsList
              sections={m.sections}
              selectedSectionId={m.selectedSectionId}
              onSelect={m.setSelectedSectionId}
              onAdd={m.addRichTextSection}
            />

            <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-white/10 bg-[var(--cf-surface-container)] p-4 lg:w-[480px] lg:flex-none">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-white/50">Inspector</div>
                {m.selectedSection ? <div className="text-xs text-white/40">{m.selectedSection.type}</div> : null}
              </div>
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

      <NewPageModal
        open={newPageOpen}
        pages={m.pages}
        onClose={() => setNewPageOpen(false)}
        onCreate={async ({ title, slug }) => {
          await m.createNewWithValues({ title, slug });
        }}
      />
    </div>
  );
}
