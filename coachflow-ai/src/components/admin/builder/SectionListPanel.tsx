"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2, Copy, Eye, EyeOff, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { LandingSection, LandingSectionType } from "@/components/site/landingV1/sections";
import { availableToAdd, canDelete, canDuplicate, labelForType } from "@/components/admin/builder/model";

export function SectionListPanel({
  sections,
  selectedId,
  onSelect,
  onMove,
  onReorder,
  onToggle,
  onDelete,
  onDuplicate,
  onAdd,
}: {
  sections: LandingSection[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onMove: (id: string, dir: -1 | 1) => void;
  onReorder: (next: LandingSection[]) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onAdd: (type: LandingSectionType) => void;
}) {
  const addable = availableToAdd(sections);
  const [activeId, setActiveId] = useState<string | null>(null);

  const activeSection = useMemo(() => (activeId ? sections.find((s) => s.id === activeId) || null : null), [activeId, sections]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd(e: any) {
    const from = e.active?.id as string | undefined;
    const to = e.over?.id as string | undefined;
    setActiveId(null);
    if (!from || !to || from === to) return;
    const oldIndex = sections.findIndex((s) => s.id === from);
    const newIndex = sections.findIndex((s) => s.id === to);
    if (oldIndex === -1 || newIndex === -1) return;
    onReorder(arrayMove(sections, oldIndex, newIndex));
  }

  return (
    <aside className="flex max-h-[360px] w-full shrink-0 flex-col overflow-hidden border-b border-surface-800 bg-surface-950 lg:max-h-none lg:w-80 lg:border-b-0 lg:border-r">
      <div className="h-14 px-6 flex items-center justify-between border-b border-surface-800">
        <div className="text-sm font-semibold">Sections</div>
        <div className="relative">
          <AddMenu items={addable} onAdd={onAdd} />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 lg:p-4">
        {sections.length ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={(e) => setActiveId(String(e.active.id))}
            onDragCancel={() => setActiveId(null)}
            onDragEnd={onDragEnd}
          >
            <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {sections.map((s, idx) => (
                  <SortableRow
                    key={s.id}
                    section={s}
                    selected={s.id === selectedId}
                    idx={idx}
                    last={idx === sections.length - 1}
                    onSelect={onSelect}
                    onMove={onMove}
                    onToggle={onToggle}
                    onDelete={onDelete}
                    onDuplicate={onDuplicate}
                  />
                ))}
              </div>
            </SortableContext>

            <DragOverlay>
              {activeSection ? (
                <div className="w-72 rounded-md border border-brand-500/40 bg-surface-950 px-3 py-3 shadow-2xl">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-surface-500" />
                    <div className="text-sm font-medium text-surface-50">{labelForType(activeSection.type)}</div>
                  </div>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        ) : (
          <div className="rounded-xl border border-surface-800 bg-surface-900/20 p-6 text-center">
            <div className="text-sm text-surface-200">No sections yet</div>
            <div className="text-xs text-surface-500 mt-1">Click “Add” to build your homepage.</div>
          </div>
        )}
      </div>
    </aside>
  );
}

function SortableRow({
  section,
  selected,
  idx,
  last,
  onSelect,
  onMove,
  onToggle,
  onDelete,
  onDuplicate,
}: {
  section: LandingSection;
  selected: boolean;
  idx: number;
  last: boolean;
  onSelect: (id: string) => void;
  onMove: (id: string, dir: -1 | 1) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging, isOver } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as const;

  return (
    <div ref={setNodeRef} style={style} className={cn(isDragging ? "opacity-60" : "opacity-100")}> 
      <div
        {...attributes}
        role="button"
        tabIndex={0}
        className={cn(
          "w-full text-left rounded-md border px-3 py-3 transition-colors",
          selected ? "border-brand-500/40 bg-brand-500/10" : "border-surface-800 bg-surface-900/20 hover:bg-surface-900/40",
          isOver ? "ring-1 ring-brand-500/40" : null,
        )}
        onClick={() => onSelect(section.id)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect(section.id);
          }
        }}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              className="h-7 w-7 rounded-md hover:bg-surface-800 flex items-center justify-center text-surface-600 hover:text-surface-200"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              {...listeners}
              aria-label="Drag to reorder"
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <div className="text-sm font-medium text-surface-50 truncate">{labelForType(section.type)}</div>
              {section.id !== section.type ? (
                <div className="text-xs text-surface-500 truncate">{section.id}</div>
              ) : (
                <div className="text-xs text-surface-500 truncate">&nbsp;</div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggle(section.id);
              }}
              title={section.enabled ? "Disable" : "Enable"}
            >
              {section.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              disabled={idx === 0}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onMove(section.id, -1);
              }}
              title="Move up"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              disabled={last}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onMove(section.id, 1);
              }}
              title="Move down"
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              disabled={!canDuplicate(section)}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDuplicate(section.id);
              }}
              title="Duplicate"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-red-400"
              disabled={!canDelete(section)}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete(section.id);
              }}
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddMenu({
  items,
  onAdd,
}: {
  items: LandingSectionType[];
  onAdd: (type: LandingSectionType) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="secondary"
        size="sm"
        className="gap-2"
        onClick={() => setOpen((v: boolean) => !v)}
        type="button"
      >
        <Plus className="h-4 w-4" />
        Add
      </Button>
      {open ? (
        <div className="absolute right-0 mt-2 w-56 rounded-md border border-surface-800 bg-surface-950 shadow-xl z-20">
          <div className="py-1">
            {items.map((t) => (
              <button
                key={t}
                type="button"
                className="w-full text-left px-3 py-2 text-sm text-surface-200 hover:bg-surface-900"
                onClick={() => {
                  onAdd(t);
                  setOpen(false);
                }}
              >
                {labelForType(t)}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
