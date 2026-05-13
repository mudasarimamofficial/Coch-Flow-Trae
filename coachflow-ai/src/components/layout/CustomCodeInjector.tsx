"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

type Props = {
  customCss: string;
  customJs: string;
};

function escapeInlineRawText(value: string) {
  return value.replace(/<\/(script|style)/gi, "<\\/$1");
}

function shouldInject(pathname: string | null) {
  const path = pathname || "/";
  return path !== "/" && !path.startsWith("/admin");
}

export function CustomCodeInjector({ customCss, customJs }: Props) {
  const pathname = usePathname();

  useEffect(() => {
    if (!shouldInject(pathname)) return;

    const css = customCss.trim();
    const js = customJs.trim();
    const nodes: HTMLElement[] = [];

    if (css.length) {
      const style = document.createElement("style");
      style.id = "cf-public-custom-css";
      style.textContent = escapeInlineRawText(css);
      document.head.appendChild(style);
      nodes.push(style);
    }

    if (js.length) {
      const script = document.createElement("script");
      script.id = "cf-public-custom-js";
      script.text = `;(() => {\n${escapeInlineRawText(js)}\n})();`;
      document.body.appendChild(script);
      nodes.push(script);
    }

    return () => {
      for (const node of nodes) node.remove();
    };
  }, [customCss, customJs, pathname]);

  return null;
}
