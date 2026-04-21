import { useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

type Props = {
  loading: boolean;
  title: string;
  slug: string;
  navLabel: string;
  metaTitle: string;
  metaDescription: string;
  showHeader: boolean;
  showFooter: boolean;
  status: "draft" | "published";
  onTitleChange: (v: string) => void;
  onSlugChange: (v: string) => void;
  onNavLabelChange: (v: string) => void;
  onMetaTitleChange: (v: string) => void;
  onMetaDescriptionChange: (v: string) => void;
  onShowHeaderChange: (v: boolean) => void;
  onShowFooterChange: (v: boolean) => void;
  onStatusChange: (v: "draft" | "published") => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  onRevertDraft: () => void;
  onDelete: () => void;
  onCreateNew: () => void;
};

export function PageEditor({
  loading,
  title,
  slug,
  navLabel,
  metaTitle,
  metaDescription,
  showHeader,
  showFooter,
  status,
  onTitleChange,
  onSlugChange,
  onNavLabelChange,
  onMetaTitleChange,
  onMetaDescriptionChange,
  onShowHeaderChange,
  onShowFooterChange,
  onStatusChange,
  onSaveDraft,
  onPublish,
  onUnpublish,
  onRevertDraft,
  onDelete,
  onCreateNew,
}: Props) {
  const statusLabel = useMemo(() => (status === "published" ? "Published" : "Draft"), [status]);

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input label="Title" value={title} onChange={(e) => onTitleChange(e.target.value)} placeholder="Privacy Policy" />
        <Input label="Slug" value={slug} onChange={(e) => onSlugChange(e.target.value)} placeholder="privacy-policy" />
        <Input label="Nav label" value={navLabel} onChange={(e) => onNavLabelChange(e.target.value)} placeholder="Privacy" />
        <Select
          label="Status"
          value={status}
          onChange={(e) => onStatusChange(e.target.value === "published" ? "published" : "draft")}
          options={[
            { value: "draft", label: "Draft" },
            { value: "published", label: "Published" },
          ]}
        />
        <Select
          label="Show in header nav"
          value={showHeader ? "yes" : "no"}
          onChange={(e) => onShowHeaderChange(e.target.value === "yes")}
          options={[
            { value: "no", label: "No" },
            { value: "yes", label: "Yes" },
          ]}
        />
        <Select
          label="Show in footer nav"
          value={showFooter ? "yes" : "no"}
          onChange={(e) => onShowFooterChange(e.target.value === "yes")}
          options={[
            { value: "no", label: "No" },
            { value: "yes", label: "Yes" },
          ]}
        />
        <Input label="Meta title" value={metaTitle} onChange={(e) => onMetaTitleChange(e.target.value)} placeholder="Privacy Policy" />
        <Input
          label="Meta description"
          value={metaDescription}
          onChange={(e) => onMetaDescriptionChange(e.target.value)}
          placeholder="Privacy Policy for CoachFlow AI."
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button variant="secondary" className="h-10" disabled={loading} onClick={onSaveDraft}>
          Save Draft
        </Button>
        <Button className="h-10" disabled={loading} onClick={onPublish}>
          Publish
        </Button>
        <Button variant="secondary" className="h-10" disabled={loading} onClick={onUnpublish}>
          Unpublish
        </Button>
        <Button variant="secondary" className="h-10" disabled={loading} onClick={onRevertDraft}>
          Revert Draft
        </Button>
        <Button variant="secondary" className="h-10" disabled={loading} onClick={onDelete}>
          Delete
        </Button>
        <Button variant="secondary" className="h-10" disabled={loading} onClick={onCreateNew}>
          Create New
        </Button>
        <div className="ml-auto inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/70">
          {statusLabel}
        </div>
      </div>
    </div>
  );
}
