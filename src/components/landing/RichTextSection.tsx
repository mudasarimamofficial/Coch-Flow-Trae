import type { ReactNode } from "react";

type Props = {
  title?: string;
  html?: string;
  containerClassName?: string;
};

function safeString(v: unknown) {
  return typeof v === "string" ? v : "";
}

export function RichTextSection({ title, html, containerClassName }: Props) {
  const t = safeString(title).trim();
  const h = safeString(html).trim();
  if (!t && !h) return null;
  return (
    <section className={containerClassName || "mx-auto w-full max-w-3xl px-6 py-16"}>
      {t ? <h1 className="text-3xl font-semibold tracking-tight">{t}</h1> : null}
      {h ? (
        <div
          className="mt-6 space-y-4 text-[15px] leading-7 text-white/80"
          dangerouslySetInnerHTML={{ __html: h }}
        />
      ) : null}
    </section>
  );
}

export function renderRichTextFromSectionSettings(settings: Record<string, unknown> | null | undefined): ReactNode {
  const s = (settings || {}) as any;
  return <RichTextSection title={s.title} html={s.content} />;
}

