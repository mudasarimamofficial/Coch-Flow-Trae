"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ImageIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/admin/builder/inspectors/common";
import { MediaPickerDialog } from "@/components/admin/builder/MediaPickerDialog";
import { resolvePublicMediaUrl } from "@/utils/mediaUrl";

export function ImageField({
  label,
  value,
  onChange,
  bucket,
  help,
}: {
  label: string;
  value?: string | null;
  onChange: (next: string | null) => void;
  bucket?: string;
  help?: string;
}) {
  const [open, setOpen] = useState(false);

  const url = useMemo(() => {
    if (!value) return "";
    return resolvePublicMediaUrl(value, bucket);
  }, [value, bucket]);

  return (
    <div className="space-y-3">
      <Field label={label} help={help}>
        <div className="space-y-3">
          {value ? (
            <div className="rounded-lg border border-surface-800 bg-surface-900/20 overflow-hidden">
              <div className="aspect-video bg-surface-950 relative">
                {url ? <Image src={url} alt={value} fill className="object-cover" unoptimized /> : null}
              </div>
              <div className="p-3 flex items-center justify-between gap-2">
                <div className="text-[11px] text-surface-500 font-mono truncate">{value}</div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400" onClick={() => onChange(null)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-surface-800 bg-surface-900/10 p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-md bg-surface-900/40 border border-surface-800 flex items-center justify-center">
                  <ImageIcon className="h-4 w-4 text-surface-500" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm text-surface-200">No image selected</div>
                  <div className="text-xs text-surface-500 truncate">Pick an existing asset from Media.</div>
                </div>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
                Select
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 gap-2">
            <div className="text-xs text-surface-500">Storage path</div>
            <Input value={value || ""} onChange={(e) => onChange(e.target.value || null)} placeholder="media/path/to/file.png" />
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
                Select from Media Library
              </Button>
              {value ? (
                <Button variant="destructive" size="sm" onClick={() => onChange(null)}>
                  Remove
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </Field>

      <MediaPickerDialog
        open={open}
        onOpenChange={setOpen}
        bucket={bucket}
        value={value}
        onPick={(path) => onChange(path)}
        title="Select image"
        description="Pick an existing asset. For public website rendering, ensure your media bucket is public."
      />
    </div>
  );
}

