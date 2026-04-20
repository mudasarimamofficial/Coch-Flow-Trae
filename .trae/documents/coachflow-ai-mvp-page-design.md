# Page Design Spec — CoachFlow AI MVP (Desktop-first)

## Global Styles
- Layout system: CSS Grid for page-level sections; Flexbox inside components.
- Max content width: 1120px; centered with responsive side padding (24px desktop, 16px mobile).
- Typography: 
  - H1 44/52, H2 28/36, Body 16/24, Small 14/20.
- Color tokens:
  - Background: #0B1220 (or white for minimalist theme)
  - Surface: #111A2E
  - Primary: #5B8CFF
  - Text: #EAF0FF, Muted: #AAB6D3
  - Error: #FF5B6E, Success: #2AD1A3
- Buttons:
  - Primary: filled, 44px height, hover darken 6%, disabled 40% opacity.
  - Secondary: outline, hover surface tint.
- Inputs:
  - 44px height, clear focus ring (2px primary), inline error message below field.
- Motion: 150–220ms ease-out for hover/focus; no heavy animations.

---

## Page 1: Landing Page (/)

### Meta Information
- Title: "CoachFlow AI — Turn visitors into coaching leads"
- Description: "Capture coaching inquiries in seconds. Admin dashboard included."
- Open Graph: title/description + generic preview image.

### Page Structure
- Stacked sections, single column, strong top hero + form.
- Above-the-fold split layout (desktop): left value prop, right lead form card.

### Sections & Components
1. Top Navigation (minimal)
   - Left: logo/text “CoachFlow AI” (links to /).
   - Right: “Admin” link to /admin (subtle).
2. Hero Section
   - H1 headline + 1–2 sentence subheadline.
   - 3 short benefit bullets.
   - Trust microcopy (optional): “No spam. Reply within 24h.”
3. Lead Capture Form (primary CTA)
   - Card container with title “Request a demo / Join waitlist”.
   - Fields:
     - Name (optional)
     - Email (required)
     - Note (optional textarea: “What are you looking for?”)
   - Submit button: “Get in touch”.
   - States:
     - Loading: disable inputs + spinner.
     - Success: replace form with confirmation panel.
     - Error: show inline field errors + top-level error banner.
4. Confirmation Panel (post-submit)
   - Success title, short message, and “Submit another” link/button.
5. Footer
   - Copyright.
   - Small link: “Admin dashboard” (/admin).

### Responsive Behavior
- Desktop: 2-column hero (7/5 split); form card sticky within viewport (optional).
- Tablet/mobile: single column; form below hero text.

---

## Page 2: Admin Dashboard (/admin)

### Meta Information
- Title: "CoachFlow AI Admin"
- Description: "Manage leads and notification settings."
- Open Graph: noindex recommended for admin routes.

### Page Structure
- Auth-gated dashboard.
- Desktop: left sidebar + main content.

### Sections & Components
1. Auth Gate (logged-out state)
   - Centered panel:
     - Title: “Admin sign in”
     - Email input
     - Action: “Send magic link” (or OTP)
     - Helper text: “Only approved admin emails can access.”
   - Error states:
     - Not allowlisted email: clear error message.
2. Admin Shell (logged-in state)
   - Header bar:
     - Product name + environment indicator (optional)
     - Right: signed-in email + “Sign out” button
   - Sidebar (desktop)
     - Nav items: Leads, Settings
   - Main Content
     - Leads (default view)
       - Toolbar: search by email/name (optional for MVP), refresh.
       - Table:
         - Columns: Created, Name, Email, Note (truncated)
         - Row click opens detail drawer/panel
       - Detail panel:
         - Full note, copy email button
     - Settings
       - Field: “Admin notification email”
       - Save button with success toast and error banner

### Responsive Behavior
- Mobile: sidebar collapses to top tabs.
- Leads table becomes stacked cards with key fields.

### Accessibility & Interaction
- Keyboard navigable forms and table rows.
- Visible focus states.
- Toasts also render as inline status region for screen readers.
