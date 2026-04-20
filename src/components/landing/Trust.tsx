import type { HomepageContent } from "@/content/homepage";
import { MaterialIcon } from "@/components/ui/MaterialIcon";

type Props = {
  content: HomepageContent;
};

export function Trust({ content }: Props) {
  if ((content.site as any)?.designPreset?.startsWith("landing")) return null;
  return (
    <section className="border-y border-slate-200/20 bg-slate-50/50 py-12 dark:border-white/10 dark:bg-black/20">
      <div className="mx-auto max-w-7xl px-6">
        <p className="mb-8 text-center text-sm font-medium uppercase tracking-widest text-slate-500 dark:text-slate-400">
          {content.trust.eyebrow}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-12 opacity-60 grayscale md:gap-24">
          {content.trust.icons.map((icon, idx) =>
            icon.type === "image" && icon.url ? (
              <img
                key={icon.path || `${idx}`}
                src={icon.url}
                alt=""
                className="h-10 w-10 object-contain"
              />
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
