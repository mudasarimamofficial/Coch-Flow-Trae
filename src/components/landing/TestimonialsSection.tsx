import type { HomepageContent } from "@/content/homepage";
import { DynamicIcon } from "@/components/ui/DynamicIcon";

type PageSection = NonNullable<HomepageContent["page"]>["sections"][number];

type Props = {
  section: PageSection;
};

function s<T extends Record<string, unknown>>(v: unknown) {
  if (!v || typeof v !== "object") return null;
  return v as T;
}

function asString(v: unknown) {
  return typeof v === "string" ? v : "";
}

function asNumber(v: unknown) {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

export function TestimonialsSection({ section }: Props) {
  const settings = s<Record<string, unknown>>(section.settings) || {};
  const heading = asString(settings.heading) || "Testimonials";
  const subcopy = asString(settings.subcopy);
  const icon = s<{ type: "library" | "upload"; value: string }>(settings.icon);

  const blocks = Array.isArray(section.blocks) ? section.blocks : [];
  const items = blocks
    .filter((b) => b.type === "testimonial")
    .map((b) => {
      const c = b.content || {};
      return {
        id: b.id,
        name: asString(c.name),
        role: asString(c.role || c.title),
        quote: asString(c.quote),
        rating: asNumber(c.rating) || 5,
        avatarUrl: asString((c as any).avatar?.url),
      };
    })
    .filter((x) => x.quote.trim().length);

  return (
    <section className="mx-auto max-w-7xl px-6 py-24" id={section.id}>
      <div className="mx-auto mb-12 max-w-3xl text-center">
        <div className="mb-3 flex items-center justify-center gap-2 text-[#b58a2f]">
          <DynamicIcon icon={icon || { type: "library", value: "website" }} className="h-5 w-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Social Proof</span>
        </div>
        <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">{heading}</h2>
        {subcopy ? <p className="text-slate-600 dark:text-slate-400">{subcopy}</p> : null}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {items.map((t) => (
          <div
            key={t.id}
            className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5"
          >
            <div className="mb-4 flex items-center gap-1 text-[#b58a2f]">
              {Array.from({ length: Math.max(1, Math.min(5, t.rating)) }).map((_, i) => (
                <span key={i} className="text-sm">★</span>
              ))}
            </div>
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">“{t.quote}”</p>
            <div className="mt-6">
              <div className="flex items-center gap-3">
                {t.avatarUrl ? (
                  <img src={t.avatarUrl} alt={t.name} className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-white/10" />
                )}
                <div>
                  <div className="text-sm font-bold">{t.name || "Anonymous"}</div>
                  {t.role ? <div className="text-xs text-slate-500 dark:text-slate-400">{t.role}</div> : null}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
