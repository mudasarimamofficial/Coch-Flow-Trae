## Admin UX Direction (Mobile-First)

### Goals
- Premium SaaS admin UX (Shopify/Linear/Notion quality)
- Mobile-first responsiveness (no forced landscape)
- Zero-friction Pages workflows (create/edit/publish)

### Mobile Navigation
- Use a bottom tab bar for primary destinations: Builder, Pages, Leads, Settings.
- Provide secondary destinations (JSON, Custom, Sign out) via a lightweight “More” sheet.
- No horizontal scrolling and no multi-column layouts on mobile.

### Pages Tab UX

#### Desktop (2-zone)
- Left zone: searchable page navigation list with cards.
- Right zone: editor with clear hierarchy:
  - Page header with primary action (Publish) and secondary actions.
  - Stacked cards: Basic info, SEO.
  - Content structure with section blocks.
  - Inspector as a contextual panel when a section is selected.

#### Mobile
- Screen 1: page list (search + “New page” CTA).
- Screen 2: page editor (stacked cards + section blocks).
- Section editing uses a full-screen modal editor to avoid cramped side panels.

### Slug Safety
- Slugs must be auto-generated and unique.
- Page creation must never fail due to slug collisions.
- Saving/publishing must prevent duplicate slugs.

