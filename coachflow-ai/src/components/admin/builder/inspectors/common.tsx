"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Field({
  label,
  help,
  children,
}: {
  label: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div>
        <div className="text-xs font-semibold text-surface-400 uppercase tracking-wider">{label}</div>
        {help ? <div className="mt-1 text-xs text-surface-500">{help}</div> : null}
      </div>
      {children}
    </div>
  );
}

export function Textarea({
  value,
  onChange,
  rows,
}: {
  value: string;
  onChange: (v: string) => void;
  rows: number;
}) {
  return (
    <textarea
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-surface-900 border border-surface-800 rounded-md px-3 py-2 text-sm text-surface-50 focus:outline-none focus:border-brand-500 transition-colors"
    />
  );
}

export function StringListEditor({
  items,
  onChange,
  placeholder,
}: {
  items: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      {items.map((v, idx) => (
        <div key={idx} className="flex gap-2">
          <Input value={v} onChange={(e) => onChange(items.map((x, i) => (i === idx ? e.target.value : x)))} />
          <Button
            variant="outline"
            size="sm"
            className="border-surface-800"
            onClick={() => onChange(items.filter((_, i) => i !== idx))}
            type="button"
          >
            Remove
          </Button>
        </div>
      ))}
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onChange([...items, placeholder ?? "New item"])}
        type="button"
      >
        Add Item
      </Button>
    </div>
  );
}
