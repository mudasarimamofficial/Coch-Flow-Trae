# PROJECT BIBLE: Coachflow Aquisition

> [!IMPORTANT]
> This is the single source of truth for all AI-assisted development on the Coachflow Aquisition project. Every session MUST start by reading this file.

## Project Metadata
- **Project Name:** Coachflow Aquisition (Note spelling: "Aquisition")
- **Live URL:** [https://coachflow-a1.vercel.app/](https://coachflow-a1.vercel.app/)
- **Admin URL:** [https://coachflow-a1.vercel.app/admin](https://coachflow-a1.vercel.app/admin)
- **Repository:** `mudasarimamofficial/Coch-Flow-Trae.git`
- **Branch:** `main`
- **Latest Verified Production SHA:** `8d1a890` (Typography Parity Finalized)

## Core Architecture
### 1. Iframe-Free Landing Page
The landing page (`/`) is rendered WITHOUT iframes. It uses a **DirectLandingRenderer** which pulls content from the `homepage_content` table (Supabase) and renders React components directly into the DOM for optimal SEO and performance.

### 2. Rendering Pipeline
- **Production (`/`):** Fetches from `homepage_content`. Uses `DirectLandingRenderer`.
- **Builder Preview:** Uses `DevicePreviewStage` with CSS scale transforms. NO IFRAMES.
- **Data Flow:** `src/content/homepage.ts` contains the canonical defaults and the `CLIENT_HTML_PALETTE` source of truth.

### 3. Styling & Tokens
- **CSS Variables:** Drive the entire theme. Defined in `src/utils/themeCss.ts`.
- **Canonical Palette:** 
  - `--black`: Background
  - `--white`: Text/Primary UI
  - `--gold`: Primary Accent
- **Typography:** Uses a fluid scale system managed in `src/utils/typographyScale.ts`. 100% parity with client HTML achieved (Bebas Neue, DM Sans, DM Serif Display).

## Admin & Persistence
- **Settings Panel:** Located at `src/components/admin/SettingsPanel.tsx`. Reorganized into logical cards (Brand, Theme, Typography, Notifications).
- **Customization Controls:**
  - `showBrandIcon`: Toggles logo visibility in Header/Footer.
  - "Reset to original palette": Restores `CLIENT_HTML_PALETTE` values.

## Final Production Polish (2026-05-14)
- **Typography Parity Achieved:** Integrated Bebas Neue (Headings), DM Sans (Body), and DM Serif Display (Quotes) with fluid `clamp()` scaling and exact CSS metrics (line-height, letter-spacing).
- **Font Optimization:** Switched to `next/font/google` for all brand fonts.
- **Client Palette Restored:** `CLIENT_HTML_PALETTE` is now the verified source of truth in `homepage.ts`.
- **Brand Icon Toggles:** `showBrandIcon` controls added to Header/Footer and persisted via Admin.
- **Settings Panel Reorganized:** Shifted to a card-based, Shopify-style UI for better UX.
- **Project Bible Updated:** Reflected final parity state and production SHA.

## Development Checklist (Pre-Deployment)
- [x] Achieve 100% typography parity with `public/coachflow-rebuilt-1.html`.
- [x] Verify brand spelling is "Coachflow Aquisition" in all UI elements.
- [x] Ensure `DirectLandingRenderer` is used for `/` to maintain iframe-free status.
- [ ] Run `npm run build` to ensure production stability.
- [ ] Run `npx tsc --noEmit` for type safety.
- [ ] Check responsive scaling in the admin builder.

## Critical Rules
- **NEVER** re-introduce iframes to the landing page.
- **NEVER** change the brand name spelling unless explicitly requested by the owner.
- **ALWAYS** use `CLIENT_HTML_PALETTE` as the fallback for branding/theme.
- **DO NOT** modify Shaditz or Maschinenbauer components within this repository.
