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
    },
    typography: {
      headingFont: "var(--font-heading)",
      bodyFont: "var(--font-body)",
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
  const cssVars = `:root{--cf-primary:${colors.primary};--cf-secondary:${colors.secondary};--cf-accent:${colors.accent};--cf-bg:${colors.background};--cf-text:${colors.text};--cf-surface:${colors.surface};--cf-border:${colors.border};--cf-font-heading:${(typography.headingFont || "").trim()};--cf-font-body:${(typography.bodyFont || "").trim()};--color-primary:${colors.primary};--color-secondary:${colors.secondary};--color-accent:${colors.accent};--color-background:${colors.background};--color-text:${colors.text};--color-surface:${colors.surface};--color-border:${colors.border};}`;
  const faviconHref =
    content.site?.favicon?.url ||
    "https://ekwydksbprxebgmhbmtj.supabase.co/storage/v1/object/public/assets/coch%20flow%20favicon.png";
  const appleTouchHref = faviconHref;
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
        {content.site?.customCss && content.site.customCss.trim().length ? (
          <style dangerouslySetInnerHTML={{ __html: content.site.customCss }} />
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
        {content.site?.customJs && content.site.customJs.trim().length ? (
          <script dangerouslySetInnerHTML={{ __html: content.site.customJs }} />
        ) : null}
      </body>
    </html>
  );
}
