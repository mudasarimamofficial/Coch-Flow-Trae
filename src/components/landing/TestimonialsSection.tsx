"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import type { HomepageContent } from "@/content/homepage";

type PageSection = NonNullable<HomepageContent["page"]>["sections"][number];

type Props = {
  section: PageSection;
};

type ProofItem = {
  id: string;
  name: string;
  role: string;
  quote: string;
  rating: number;
  avatarUrl: string;
  metric: string;
};

function objectValue<T extends Record<string, unknown>>(value: unknown) {
  if (!value || typeof value !== "object") return null;
  return value as T;
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function asNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function getAvatarUrl(value: unknown) {
  const avatar = objectValue<{ url?: unknown }>(value);
  return asString(avatar?.url);
}

export function TestimonialsSection({ section }: Props) {
  const settings = objectValue<Record<string, unknown>>(section.settings) || {};
  const eyebrow = asString(settings.eyebrow) || "Proof of pipeline";
  const heading = asString(settings.heading) || "Built for coaches who need booked calls, not vanity metrics";
  const subcopy =
    asString(settings.subcopy) ||
    "Concrete pipeline indicators and client-style proof before asking a serious buyer to choose a partnership tier.";
  const stats = Array.isArray(settings.stats)
    ? settings.stats
        .map((stat) => objectValue<{ value?: unknown; label?: unknown }>(stat))
        .filter(Boolean)
        .map((stat) => ({ value: asString(stat?.value), label: asString(stat?.label) }))
        .filter((stat) => stat.value && stat.label)
    : [];

  const blocks = Array.isArray(section.blocks) ? section.blocks : [];
  const items: ProofItem[] = blocks
    .filter((block) => block.type === "testimonial")
    .map((block) => {
      const content = block.content || {};
      return {
        id: block.id,
        name: asString(content.name) || "CoachFlow client",
        role: asString(content.role || content.title) || "High-ticket coaching business",
        quote: asString(content.quote),
        rating: asNumber(content.rating) || 5,
        avatarUrl: getAvatarUrl((content as any).avatar),
        metric: asString((content as any).metric) || "Qualified pipeline",
      };
    })
    .filter((item) => item.quote.trim().length);

  const limited = useMemo(() => items.slice(0, 10), [items]);

  const trackRef = useRef<HTMLDivElement | null>(null);
  const [perView, setPerView] = useState(3);
  const [pageIndex, setPageIndex] = useState(0);

  useEffect(() => {
    function update() {
      const w = window.innerWidth;
      setPerView(w < 640 ? 1 : w < 1024 ? 2 : 3);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const pageCount = Math.max(1, Math.ceil(limited.length / perView));

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    function onScroll() {
      const step = el.clientWidth;
      const idx = step ? Math.round(el.scrollLeft / step) : 0;
      setPageIndex(Math.max(0, Math.min(pageCount - 1, idx)));
    }
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [pageCount]);

  function scrollToPage(nextIndex: number) {
    const el = trackRef.current;
    if (!el) return;
    const idx = Math.max(0, Math.min(pageCount - 1, nextIndex));
    el.scrollTo({ left: idx * el.clientWidth, behavior: "smooth" });
  }

  if (!limited.length) return null;

  return (
    <section className="proof-section" id={section.id} data-reveal>
      <div className="proof-shell">
        <div className="proof-copy">
          <div className="proof-eyebrow">
            <span />
            {eyebrow}
          </div>
          <h2>{heading}</h2>
          <p>{subcopy}</p>
        </div>

        {stats.length ? (
          <div className="proof-stats" aria-label="CoachFlow AI proof metrics">
            {stats.map((stat) => (
              <div key={`${stat.value}-${stat.label}`} className="proof-stat">
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        ) : null}

        <div className="proof-carousel" aria-label="Client reviews">
          <div className="proof-carousel-controls">
            <button
              type="button"
              className="proof-carousel-btn"
              onClick={() => scrollToPage(pageIndex - 1)}
              disabled={pageIndex <= 0}
              aria-label="Previous reviews"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              className="proof-carousel-btn"
              onClick={() => scrollToPage(pageIndex + 1)}
              disabled={pageIndex >= pageCount - 1}
              aria-label="Next reviews"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div
            ref={trackRef}
            className="proof-carousel-track"
            style={{
              ...(perView ? ({ ["--perView" as any]: String(perView) } as any) : null),
            }}
          >
            {limited.map((item) => (
              <article key={item.id} className="proof-card" aria-label={`Review from ${item.name}`}>
                <div className="proof-card-top">
                  <div className="proof-avatar-wrap">
                    {item.avatarUrl ? (
                      <img src={item.avatarUrl} alt={item.name} className="proof-avatar" loading="lazy" />
                    ) : (
                      <div className="proof-avatar proof-avatar-fallback" aria-hidden="true" />
                    )}
                  </div>
                  <div>
                    <div className="proof-name">{item.name}</div>
                    <div className="proof-role">{item.role}</div>
                  </div>
                </div>
                <p className="proof-quote">&quot;{item.quote}&quot;</p>
                <div className="proof-card-bottom">
                  <div className="proof-stars" aria-label={`${Math.max(1, Math.min(5, item.rating))} out of 5 stars`}>
                    {Array.from({ length: 5 }).map((_, index) => {
                      const filled = index < Math.max(1, Math.min(5, item.rating));
                      return (
                        <Star
                          key={index}
                          size={14}
                          className={filled ? "proof-star is-filled" : "proof-star"}
                          aria-hidden="true"
                        />
                      );
                    })}
                  </div>
                  <span>{item.metric}</span>
                </div>
              </article>
            ))}
          </div>

          <div className="proof-carousel-dots" aria-label="Review pages">
            {Array.from({ length: pageCount }).map((_, i) => (
              <button
                key={i}
                type="button"
                className={`proof-dot ${i === pageIndex ? "is-active" : ""}`}
                aria-label={`Go to reviews page ${i + 1}`}
                aria-current={i === pageIndex}
                onClick={() => scrollToPage(i)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
