# PROJECT BIBLE: Coachflow Aquisition

> [!IMPORTANT]
> This is the single source of truth for all AI-assisted development on the Coachflow Aquisition project. Every session MUST start by reading this file.

## Project Metadata
- **Project Name:** Coachflow Aquisition (Note spelling: "Aquisition")
- **Live URL:** [https://coachflow-a1.vercel.app/](https://coachflow-a1.vercel.app/)
- **Admin URL:** [https://coachflow-a1.vercel.app/admin](https://coachflow-a1.vercel.app/admin)
- **Repository:** `mudasarimamofficial/Coch-Flow-Trae.git`
- **Branch:** `main`
- **Latest Verified Production SHA:** `f1ae4642d99298c4182903823467e42d631dfb8c`

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
- **Typography:** Uses a fluid scale system managed in `src/utils/typographyScale.ts`.

## Admin & Persistence
- **Settings Panel:** Located at `src/components/admin/SettingsPanel.tsx`. Reorganized into logical cards (Brand, Theme, Typography, Notifications).
- **Customization Controls:**
  - `showBrandIcon`: Toggles logo visibility in Header/Footer.
  - "Reset to original palette": Restores `CLIENT_HTML_PALETTE` values.

## Last Final Polish (2026-05-14)
- **Client Palette Restored:** `CLIENT_HTML_PALETTE` is now the verified source of truth in `homepage.ts`.
- **Brand Icon Toggles:** `showBrandIcon` controls added to Header/Footer and persisted via Admin.
- **Settings Panel Reorganized:** Shifted to a card-based, Shopify-style UI for better UX.
- **Project Bible Created:** Established `docs/PROJECT_BIBLE.md` as the repository source of truth.
- **Final Production SHA:** `f1ae4642d99298c4182903823467e42d631dfb8c`

## Development Checklist (Pre-Deployment)
- [ ] Run `npm run build` to ensure production stability.
- [ ] Run `npx tsc --noEmit` for type safety.
- [ ] Verify brand spelling is "Coachflow Aquisition" in all UI elements.
- [ ] Ensure `DirectLandingRenderer` is used for `/` to maintain iframe-free status.
- [ ] Check responsive scaling in the admin builder.

## Critical Rules
- **NEVER** re-introduce iframes to the landing page.
- **NEVER** change the brand name spelling unless explicitly requested by the owner.
- **ALWAYS** use `CLIENT_HTML_PALETTE` as the fallback for branding/theme.
- **DO NOT** modify Shaditz or Maschinenbauer components within this repository.
