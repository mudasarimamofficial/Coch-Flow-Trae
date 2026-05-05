"use client";

import { useEffect } from "react";

function ensureSingle(id: string, build: () => HTMLElement | null, mount: (el: HTMLElement) => void) {
  const existing = document.getElementById(id);
  if (existing) existing.remove();
  const el = build();
  if (!el) return;
  el.id = id;
  mount(el);
}

export function useCustomCode(content: unknown) {
  useEffect(() => {
    const root = (content && typeof content === "object" ? (content as any) : null) as any;
    const customCss = typeof root?.customCss === "string" ? root.customCss : "";
    const customHead = typeof root?.customHead === "string" ? root.customHead : "";
    const customBodyEnd = typeof root?.customBodyEnd === "string" ? root.customBodyEnd : "";

    ensureSingle(
      "cf-custom-css",
      () => {
        if (!customCss.trim()) return null;
        const style = document.createElement("style");
        style.textContent = customCss;
        return style;
      },
      (el) => document.head.appendChild(el),
    );

    ensureSingle(
      "cf-custom-head",
      () => {
        if (!customHead.trim()) return null;
        const div = document.createElement("div");
        div.innerHTML = customHead;
        return div;
      },
      (el) => document.head.appendChild(el),
    );

    ensureSingle(
      "cf-custom-body-end",
      () => {
        if (!customBodyEnd.trim()) return null;
        const div = document.createElement("div");
        div.innerHTML = customBodyEnd;
        return div;
      },
      (el) => document.body.appendChild(el),
    );

    return () => {
      document.getElementById("cf-custom-css")?.remove();
      document.getElementById("cf-custom-head")?.remove();
      document.getElementById("cf-custom-body-end")?.remove();
    };
  }, [content]);
}

