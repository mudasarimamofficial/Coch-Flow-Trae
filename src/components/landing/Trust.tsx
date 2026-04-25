import type { HomepageContent } from "@/content/homepage";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

type Props = {
  content: HomepageContent;
};

export function Trust({ content }: Props) {
  const preset = ((content.site as any)?.designPreset as string | undefined) || "landing_html_v1";

  if (preset === "classic") {
    return (
      <section className="border-y border-slate-200/20 bg-slate-50/50 py-12 dark:border-white/10 dark:bg-black/20">
        <div className="mx-auto max-w-7xl px-6">
          <p className="mb-8 text-center text-sm font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400">
            {content.trust.eyebrow}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-60 grayscale md:gap-24">
            {content.trust.icons.map((icon, idx) =>
              icon.type === "image" && icon.url ? (
                <img key={icon.path || `${idx}`} src={icon.url} alt="" className="h-10 w-10 object-contain" />
              ) : (
                <MaterialIcon
                  key={icon.name || `${idx}`}
                  name={icon.name || "psychology_alt"}
                  className="text-4xl text-slate-800 dark:text-slate-200"
                />
              ),
            )}
          </div>
        </div>
      </section>
    );
  }

  const workflow = content.workflow?.steps || [];
  const signalItems = [
    workflow[0]?.title ? String(workflow[0]?.title) : "Offer calibration",
    workflow[2]?.title ? String(workflow[2]?.title) : "Multi-channel outreach",
    workflow[3]?.title ? String(workflow[3]?.title) : "Qualified call delivery",
  ];

  return (
    <section id="trust">
      <div className="container">
        <div className="trust-strip">
          <div className="trust-left">
            <div className="trust-eyebrow">{content.trust.eyebrow}</div>
            <div className="trust-icons" aria-hidden="true">
              {content.trust.icons.slice(0, 6).map((icon, idx) =>
                icon.type === "image" && icon.url ? (
                  <img key={icon.path || `${idx}`} src={icon.url} alt="" className="trust-icon-img" />
                ) : (
                  <MaterialIcon key={icon.name || `${idx}`} name={icon.name || "psychology_alt"} className="trust-icon" />
                ),
              )}
            </div>
          </div>

          <div className="trust-right">
            {signalItems.map((t) => (
              <div key={t} className="trust-signal">
                <div className="trust-signal-dot" aria-hidden="true" />
                <div className="trust-signal-text">{t}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
