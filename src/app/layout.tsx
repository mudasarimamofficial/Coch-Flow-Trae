import type { Metadata } from "next";
import { DM_Sans, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeScript } from "@/components/theme/ThemeScript";
import { getHomepageContent } from "@/utils/homepageContent";

const headingFont = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-heading",
  display: "swap",
});

const bodyFont = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-body",
  display: "swap",
});

const adminFont = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-admin",
  display: "swap",
});

export const dynamic = "force-dynamic";
export const revalidate = 0;

function compactText(value: unknown) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

function sanitizePx(value: unknown, fallback: string) {
  const v = typeof value === "string" ? value.trim() : "";
  if (/^\d+(?:\.\d+)?px$/.test(v)) return v;
  return fallback;
}

function pickCssFont(value: unknown, fallback: string) {
  const v = typeof value === "string" ? value.trim() : "";
  return v.length ? v : fallback;
}

function escapeInlineRawText(value: string) {
  return value.replace(/<\/(script|style)/gi, "<\\/$1");
}

export async function generateMetadata(): Promise<Metadata> {
  const content = await getHomepageContent();
  const brand = compactText(content.header?.brandText) || "CoachFlow AI";
  const promise = compactText(`${content.hero?.heading?.prefix || ""} ${content.hero?.heading?.highlight || ""}`);
  const title = promise ? `${brand} | ${promise}` : brand;
  const description =
    compactText(content.hero?.subcopy) ||
    compactText(content.application?.subcopy) ||
    "CoachFlow AI helps premium coaches build predictable client acquisition systems.";
  const faviconHref =
    content.site?.favicon?.url ||
    "https://ekwydksbprxebgmhbmtj.supabase.co/storage/v1/object/public/assets/coch%20flow%20favicon.png";

  return {
    metadataBase: new URL("https://coachflow-a1.vercel.app"),
    title,
    description,
    icons: {
      icon: [{ url: faviconHref }],
      shortcut: [{ url: faviconHref }],
      apple: [{ url: faviconHref }],
    },
    openGraph: {
      title,
      description,
      url: "https://coachflow-a1.vercel.app",
      siteName: brand,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const content = await getHomepageContent();
  const defaults = {
    enabled: false,
    colors: {
      primary: "#C9982A",
      secondary: "#0F1629",
      accent: "#E8B84B",
      background: "#0A0F1E",
      text: "#FFFFFF",
      surface: "#141D35",
      border: "rgba(255,255,255,0.07)",
      navy: "#0A0F1E",
      navy2: "#0F1629",
      navy3: "#141D35",
      navy4: "#1A2444",
      white: "#FFFFFF",
      muted: "#8A8F9E",
      off: "#F0EDE6",
      gold: "#C9982A",
      gold2: "#E8B84B",
      gold3: "#F5CC6E",
      borderGold: "rgba(201,152,42,0.18)",
      border2: "rgba(255,255,255,0.07)",
    },
    typography: {
      headingFont: "var(--font-heading)",
      bodyFont: "var(--font-body)",
      scale: {
        mobile: {
          h1: "22px",
          h2: "20px",
          h3: "18px",
          h4: "16px",
          h5: "15px",
          h6: "14px",
          body: "16px",
          small: "14px",
        },
        tablet: {
          h1: "28px",
          h2: "24px",
          h3: "22px",
          h4: "20px",
          h5: "18px",
          h6: "16px",
          body: "16px",
          small: "14px",
        },
        laptop: {
          h1: "36px",
          h2: "30px",
          h3: "26px",
          h4: "22px",
          h5: "20px",
          h6: "18px",
          body: "16px",
          small: "14px",
        },
        desktopLarge: {
          h1: "42px",
          h2: "36px",
          h3: "30px",
          h4: "26px",
          h5: "22px",
          h6: "18px",
          body: "18px",
          small: "14px",
        },
      },
    },
  };

  const branding = content.branding || defaults;
  const enabled = Boolean(branding.enabled ?? content.site?.theme?.enabled);
  const source = enabled
    ? {
        colors: {
          ...defaults.colors,
          ...(branding.colors || {}),
        },
        typography: {
          ...defaults.typography,
          ...(branding.typography || {}),
        },
      }
    : defaults;

  const colors = source.colors;
  const typography = source.typography;

  const palette = {
    navy: (colors as any).navy || colors.background,
    navy2: (colors as any).navy2 || colors.secondary,
    navy3: (colors as any).navy3 || colors.surface,
    navy4: (colors as any).navy4 || "#1A2444",
    white: (colors as any).white || colors.text,
    muted: (colors as any).muted || "#8A8F9E",
    off: (colors as any).off || "#F0EDE6",
    gold: (colors as any).gold || colors.primary,
    gold2: (colors as any).gold2 || colors.accent,
    gold3: (colors as any).gold3 || "#F5CC6E",
    borderGold: (colors as any).borderGold || "rgba(201,152,42,0.18)",
    border2: (colors as any).border2 || colors.border,
  };

  const scale =
    ((content.site as any)?.theme?.typography?.scale as any) ||
    ((content.branding as any)?.typography?.scale as any) ||
    (defaults.typography as any)?.scale;
  const mobile = scale?.mobile || {};
  const tablet = scale?.tablet || {};
  const laptop = scale?.laptop || {};
  const desktopLarge = scale?.desktopLarge || {};

  const baseVars = {
    h1: sanitizePx(mobile.h1, "22px"),
    h2: sanitizePx(mobile.h2, "20px"),
    h3: sanitizePx(mobile.h3, "18px"),
    h4: sanitizePx(mobile.h4, "16px"),
    h5: sanitizePx(mobile.h5, "15px"),
    h6: sanitizePx(mobile.h6, "14px"),
    body: sanitizePx(mobile.body, "16px"),
    small: sanitizePx(mobile.small, "14px"),
  };

  const tabletVars = {
    h1: sanitizePx(tablet.h1, "28px"),
    h2: sanitizePx(tablet.h2, "24px"),
    h3: sanitizePx(tablet.h3, "22px"),
    h4: sanitizePx(tablet.h4, "20px"),
    h5: sanitizePx(tablet.h5, "18px"),
    h6: sanitizePx(tablet.h6, "16px"),
    body: sanitizePx(tablet.body, baseVars.body),
    small: sanitizePx(tablet.small, baseVars.small),
  };

  const laptopVars = {
    h1: sanitizePx(laptop.h1, "36px"),
    h2: sanitizePx(laptop.h2, "30px"),
    h3: sanitizePx(laptop.h3, "26px"),
    h4: sanitizePx(laptop.h4, "22px"),
    h5: sanitizePx(laptop.h5, "20px"),
    h6: sanitizePx(laptop.h6, "18px"),
    body: sanitizePx(laptop.body, baseVars.body),
    small: sanitizePx(laptop.small, baseVars.small),
  };

  const desktopLargeVars = {
    h1: sanitizePx(desktopLarge.h1, "42px"),
    h2: sanitizePx(desktopLarge.h2, "36px"),
    h3: sanitizePx(desktopLarge.h3, "30px"),
    h4: sanitizePx(desktopLarge.h4, "26px"),
    h5: sanitizePx(desktopLarge.h5, "22px"),
    h6: sanitizePx(desktopLarge.h6, "18px"),
    body: sanitizePx(desktopLarge.body, "18px"),
    small: sanitizePx(desktopLarge.small, baseVars.small),
  };

  const cssVars = `:root{--cf-primary:${colors.primary};--cf-secondary:${colors.secondary};--cf-accent:${colors.accent};--cf-bg:${colors.background};--cf-text:${colors.text};--cf-surface:${colors.surface};--cf-border:${colors.border};--cf-font-heading:${pickCssFont(typography.headingFont, defaults.typography.headingFont)};--cf-font-body:${pickCssFont(typography.bodyFont, defaults.typography.bodyFont)};--cf-navy:${palette.navy};--cf-navy2:${palette.navy2};--cf-navy3:${palette.navy3};--cf-navy4:${palette.navy4};--cf-white:${palette.white};--cf-muted:${palette.muted};--cf-off:${palette.off};--cf-gold:${palette.gold};--cf-gold2:${palette.gold2};--cf-gold3:${palette.gold3};--cf-border-gold:${palette.borderGold};--cf-border2:${palette.border2};--font-size-h1:${baseVars.h1};--font-size-h2:${baseVars.h2};--font-size-h3:${baseVars.h3};--font-size-h4:${baseVars.h4};--font-size-h5:${baseVars.h5};--font-size-h6:${baseVars.h6};--font-size-body:${baseVars.body};--font-size-small:${baseVars.small};--color-primary:${colors.primary};--color-secondary:${colors.secondary};--color-accent:${colors.accent};--color-background:${colors.background};--color-text:${colors.text};--color-surface:${colors.surface};--color-border:${colors.border};}` +
    `@media (min-width: 768px){:root{--font-size-h1:${tabletVars.h1};--font-size-h2:${tabletVars.h2};--font-size-h3:${tabletVars.h3};--font-size-h4:${tabletVars.h4};--font-size-h5:${tabletVars.h5};--font-size-h6:${tabletVars.h6};--font-size-body:${tabletVars.body};--font-size-small:${tabletVars.small};}}` +
    `@media (min-width: 1024px){:root{--font-size-h1:${laptopVars.h1};--font-size-h2:${laptopVars.h2};--font-size-h3:${laptopVars.h3};--font-size-h4:${laptopVars.h4};--font-size-h5:${laptopVars.h5};--font-size-h6:${laptopVars.h6};--font-size-body:${laptopVars.body};--font-size-small:${laptopVars.small};}}` +
    `@media (min-width: 1440px){:root{--font-size-h1:${desktopLargeVars.h1};--font-size-h2:${desktopLargeVars.h2};--font-size-h3:${desktopLargeVars.h3};--font-size-h4:${desktopLargeVars.h4};--font-size-h5:${desktopLargeVars.h5};--font-size-h6:${desktopLargeVars.h6};--font-size-body:${desktopLargeVars.body};--font-size-small:${desktopLargeVars.small};}}`;
  const faviconHref =
    content.site?.favicon?.url ||
    "https://ekwydksbprxebgmhbmtj.supabase.co/storage/v1/object/public/assets/coch%20flow%20favicon.png";
  const appleTouchHref = faviconHref;
  const customCss = content.site?.customCss?.trim() || "";
  const customJs = content.site?.customJs?.trim() || "";
  const customCssId = "cf-public-custom-css";
  const lower = faviconHref.toLowerCase();
  const type =
    lower.endsWith(".png")
      ? "image/png"
      : lower.endsWith(".svg")
        ? "image/svg+xml"
        : lower.endsWith(".ico")
          ? "image/x-icon"
          : undefined;
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${headingFont.variable} ${bodyFont.variable} ${adminFont.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href={faviconHref} type={type} sizes="any" />
        <link rel="shortcut icon" href={faviconHref} type={type} />
        <link rel="apple-touch-icon" href={appleTouchHref} />
        <style dangerouslySetInnerHTML={{ __html: cssVars }} />
        {customCss.length ? (
          <>
            <style
              id={customCssId}
              media="not all"
              dangerouslySetInnerHTML={{ __html: escapeInlineRawText(customCss) }}
            />
            <script
              dangerouslySetInnerHTML={{
                __html:
                  `;(() => { const el = document.getElementById(${JSON.stringify(customCssId)});` +
                  ` if (!el) return; if (location.pathname.startsWith("/admin")) { el.remove(); return; } el.media = "all"; })();`,
              }}
            />
          </>
        ) : null}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--cf-bg)] text-[var(--cf-text)]">
        {children}
        {customJs.length ? (
          <script
            dangerouslySetInnerHTML={{
              __html: `;(() => { if (location.pathname.startsWith("/admin")) return;\n${escapeInlineRawText(customJs)}\n})();`,
            }}
          />
        ) : null}
      </body>
    </html>
  );
}
