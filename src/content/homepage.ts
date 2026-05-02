import { createDefaultTypographyScale, type TypographyScale } from "@/utils/typographyScale";

export type HomepageContent = {
  branding?: {
    enabled?: boolean;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
      surface: string;
      border: string;
      navy?: string;
      navy2?: string;
      navy3?: string;
      navy4?: string;
      white?: string;
      muted?: string;
      off?: string;
      gold?: string;
      gold2?: string;
      gold3?: string;
      borderGold?: string;
      border2?: string;
    };
    typography?: {
      headingFont?: string;
      bodyFont?: string;
      scale?: TypographyScale;
    };
  };
  site: {
    favicon: { type: "ico" | "image"; url: string; path?: string };
    designPreset?: "landing_html_v1" | "classic";
    theme?: {
      enabled?: boolean;
      colors: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        text: string;
        surface: string;
        border: string;
        navy?: string;
        navy2?: string;
        navy3?: string;
        navy4?: string;
        white?: string;
        muted?: string;
        off?: string;
        gold?: string;
        gold2?: string;
        gold3?: string;
        borderGold?: string;
        border2?: string;
      };
      typography?: {
        headingFont?: string;
        bodyFont?: string;
        scale?: TypographyScale;
      };
    };
    customCss?: string;
    customJs?: string;
  };
  socialLinks?: {
    label: string;
    href: string;
    icon?: { type: "material" | "image"; name?: string; url?: string; path?: string };
  }[];
  socialLinksV2?: {
    id: string;
    platform: string;
    url: string;
    enabled: boolean;
    icon?: { type: "library" | "upload"; value: string } | null;
  }[];
  whatsapp?: {
    enabled: boolean;
    phone: string;
    message: string;
    avatar?: { url: string; path?: string };
    tooltip: string;
    modalTitle: string;
    modalSubtitle: string;
    buttonText: string;
    headerColorHex?: string;
    position?: "left" | "right";
    delayMs?: number;
    autoOpen?: boolean;
  };
  page?: {
    sections: {
      id: string;
      type:
        | "hero"
        | "trust"
        | "features"
        | "workflow"
        | "pricing"
        | "audit_bridge"
        | "application"
        | "footer"
        | "custom"
        | "testimonials"
        | "custom_html"
        | "rich_text";
      enabled: boolean;
      settings?: Record<string, unknown>;
      blocks?: {
        id: string;
        type: string;
        content: Record<string, unknown>;
      }[];
    }[];
  };
  customSections?: {
    id: string;
    enabled: boolean;
    html: string;
    css?: string;
    js?: string;
  }[];
  header: {
    brandText: string;
    brandIcon: { type: "material" | "image"; name?: string; url?: string; path?: string };
    nav: { label: string; href: string }[];
    primaryCta: { text: string; href: string };
  };
  hero: {
    badge: { icon: string; text: string };
    heading: { prefix: string; highlight: string };
    subcopy: string;
    note?: string;
    trust?: { text: string; pills: string[] };
    proof?: {
      title: string;
      eyebrow: string;
      avatars?: { url: string; alt?: string }[];
    };
    metrics?: {
      title: string;
      value: string;
      change?: string;
      icon?: string;
      tone?: "gold" | "blue" | "green";
    }[];
    revenueVisual?: {
      value: string;
      label: string;
    };
    primaryCta: { text: string; href: string; icon: string };
    secondaryCta: { text: string; href: string };
    backgroundImage?: { url: string; path?: string };
  };
  trust: {
    eyebrow: string;
    icons: { type: "material" | "image"; name?: string; url?: string; path?: string }[];
  };
  features: {
    id: string;
    heading: string;
    subcopy: string;
    cards: { icon?: string; iconRef?: { type: "library" | "upload"; value: string }; title: string; copy: string }[];
    backgroundImage?: { url: string; path?: string };
  };
  workflow: {
    id: string;
    heading: string;
    subcopy: string;
    expandIcon: string;
    steps: { title: string; copy: string; open?: boolean }[];
    backgroundImage?: { url: string; path?: string };
  };
  pricing: {
    id: string;
    heading: string;
    subcopy: string;
    note?: string;
    bulletIcon: string;
    tiers: {
      name: string;
      tagline: string;
      price: string;
      priceSuffix?: string;
      highlight?: { badge: string; accentHex: string };
      outcome?: string;
      bullets: string[];
      ctaText: string;
      ctaHref: string;
    }[];
    backgroundImage?: { url: string; path?: string };
  };
  application: {
    id: string;
    heading: string;
    subcopy: string;
    fields: {
      firstNameLabel: string;
      lastNameLabel: string;
      emailLabel: string;
      firstNamePlaceholder?: string;
      lastNamePlaceholder?: string;
      emailPlaceholder?: string;
      revenueLabel: string;
      revenuePlaceholder?: string;
      bottleneckLabel: string;
      bottleneckPlaceholder: string;
      revenueOptions: { value: string; label: string }[];
    };
    submitText: string;
    successTitle: string;
    successBody: string;
    submitAnotherText: string;
    footnote?: string;
    backgroundImage?: { url: string; path?: string };
  };
  footer: {
    brandText: string;
    brandIcon: { type: "material" | "image"; name?: string; url?: string; path?: string };
    links: { label: string; href: string }[];
    copyright: string;
  };
};

export const homepageDefaults: HomepageContent = {
  branding: {
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
      scale: createDefaultTypographyScale(),
    },
  },
  site: {
    favicon: {
      type: "image",
      url: "https://ekwydksbprxebgmhbmtj.supabase.co/storage/v1/object/public/assets/coch%20flow%20favicon.png",
    },
    designPreset: "landing_html_v1",
    theme: {
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
        scale: createDefaultTypographyScale(),
      },
    },
    customCss: "",
    customJs: "",
  },
  socialLinks: [
    {
      label: "Instagram",
      href: "https://instagram.com/",
      icon: { type: "material", name: "photo_camera" },
    },
    {
      label: "YouTube",
      href: "https://youtube.com/",
      icon: { type: "material", name: "smart_display" },
    },
    {
      label: "X",
      href: "https://x.com/",
      icon: { type: "material", name: "tag" },
    },
  ],
  socialLinksV2: [
    {
      id: "instagram",
      platform: "instagram",
      url: "https://instagram.com/",
      enabled: true,
      icon: { type: "library", value: "instagram" },
    },
    {
      id: "facebook",
      platform: "facebook",
      url: "https://facebook.com/",
      enabled: false,
      icon: { type: "library", value: "facebook" },
    },
    {
      id: "youtube",
      platform: "youtube",
      url: "https://youtube.com/",
      enabled: true,
      icon: { type: "library", value: "youtube" },
    },
    {
      id: "x",
      platform: "x",
      url: "https://x.com/",
      enabled: true,
      icon: { type: "library", value: "x" },
    },
    {
      id: "linkedin",
      platform: "linkedin",
      url: "https://linkedin.com/",
      enabled: true,
      icon: { type: "library", value: "linkedin" },
    },
    {
      id: "tiktok",
      platform: "tiktok",
      url: "https://tiktok.com/",
      enabled: false,
      icon: { type: "library", value: "tiktok" },
    },
    {
      id: "whatsapp",
      platform: "whatsapp",
      url: "https://wa.me/",
      enabled: false,
      icon: { type: "library", value: "whatsapp" },
    },
    {
      id: "telegram",
      platform: "telegram",
      url: "https://t.me/",
      enabled: false,
      icon: { type: "library", value: "telegram" },
    },
    {
      id: "email",
      platform: "email",
      url: "mailto:",
      enabled: false,
      icon: { type: "library", value: "email" },
    },
    {
      id: "website",
      platform: "website",
      url: "https://",
      enabled: false,
      icon: { type: "library", value: "website" },
    },
  ],
  whatsapp: {
    enabled: true,
    phone: "+923191106310",
    message: "Hi, I want to learn more about your services",
    tooltip: "Chat with us!",
    modalTitle: "CoachFlow AI",
    modalSubtitle: "Usually replies instantly",
    buttonText: "Start Chat",
    headerColorHex: "#25D366",
    position: "right",
    delayMs: 1200,
    autoOpen: false,
  },
  page: {
    sections: [
      { id: "hero", type: "hero", enabled: true, settings: { heroBackground: true, heroPanel: true } },
      { id: "features", type: "features", enabled: true, settings: { label: "What we do" } },
      {
        id: "workflow",
        type: "workflow",
        enabled: true,
        settings: { label: "The CoachFlow framework", variant: "landing" },
      },
      {
        id: "proof",
        type: "testimonials",
        enabled: true,
        settings: {
          eyebrow: "Proof of pipeline",
          heading: "Built for coaches who need booked calls, not vanity metrics",
          subcopy:
            "A credibility layer before pricing: concrete pipeline indicators, client-style proof, and reassurance that the system is built around qualified conversations.",
          stats: [
            { value: "Fit-first", label: "no-pressure" },
            { value: "Structured", label: "weekly iteration" },
            { value: "Brand-safe", label: "human outreach" },
          ],
        },
        blocks: [
          {
            id: "proof_1",
            type: "proof_card",
            content: {
              name: "Qualified conversations",
              role: "System proof point",
              body: "Campaign activity is measured around qualified conversations, booked calls, and follow-up discipline instead of vanity reach.",
              metric: "Intent",
            },
          },
          {
            id: "proof_2",
            type: "proof_card",
            content: {
              name: "Audience fit",
              role: "System proof point",
              body: "Prospects are segmented before outreach, so the system can prioritize fit, intent, and high-ticket readiness.",
              metric: "Fit",
            },
          },
          {
            id: "proof_3",
            type: "proof_card",
            content: {
              name: "Pipeline visibility",
              role: "System proof point",
              body: "Pipeline visibility keeps the coach focused on the highest-leverage conversations and the next optimization lever.",
              metric: "Clarity",
            },
          },
          {
            id: "proof_4",
            type: "proof_card",
            content: {
              name: "Follow-up discipline",
              role: "System proof point",
              body: "Follow-up windows are tracked tightly so warm leads do not disappear during busy delivery weeks.",
              metric: "Speed",
            },
          },
          {
            id: "proof_5",
            type: "proof_card",
            content: {
              name: "Weekly optimization",
              role: "System proof point",
              body: "The operating rhythm is built for weekly optimization, not one-off campaign guessing.",
              metric: "Iteration",
            },
          },
          {
            id: "proof_6",
            type: "proof_card",
            content: {
              name: "Brand-safe outreach",
              role: "System proof point",
              body: "Every stage is designed to protect brand authority while increasing sales-call consistency.",
              metric: "Authority",
            },
          },
        ],
      },
      { id: "pricing", type: "pricing", enabled: true, settings: { label: "Partnership tiers" } },
      {
        id: "audit-bridge",
        type: "audit_bridge",
        enabled: true,
        settings: {
          heading: "Not sure which tier is right for you?",
          subcopy:
            "Take the client acquisition fit audit. Answer a few questions and we will show you where your lead generation may be leaking - and which tier fits your current stage.",
          ctaText: "Take the free audit",
          ctaHref: "#lead-form",
        },
      },
      { id: "application", type: "application", enabled: true, settings: { label: "Apply for partnership" } },
      { id: "footer", type: "footer", enabled: true, settings: { showSocial: false } },
    ],
  },
  customSections: [],
  header: {
    brandText: "CoachFlow AI",
    brandIcon: {
      type: "image",
      url: "https://ekwydksbprxebgmhbmtj.supabase.co/storage/v1/object/public/assets/header%20icon.png",
    },
    nav: [
      { label: "Our Story", href: "#founder" },
      { label: "How It Works", href: "#how" },
      { label: "Pricing", href: "#pricing" },
    ],
    primaryCta: { text: "Apply Now", href: "#apply" },
  },
  hero: {
    badge: { icon: "auto_awesome", text: "Client Acquisition For Masculinity Coaches" },
    heading: {
      prefix: "Stop Guessing.",
      highlight: "Closing.",
    },
    subcopy:
      "You've built a real coaching business. Your calendar shouldn't depend on content going viral or a referral showing up. We install a system that fills it — month after month, without ads.",
    note: "Applications reviewed personally. No automated responses.",
    trust: {
      text: "",
      pills: [
        "Fit-first — we turn away wrong clients",
        "Human outreach — no bots, no spam",
        "Brand-safe — your reputation is protected",
        "Weekly optimisation — the system improves every month",
        "No lock-in contracts",
      ],
    },
    proof: {
      title: "Built for premium coaching businesses",
      eyebrow: "A fit-first partnership process",
      avatars: [],
    },
    metrics: [
      { title: "Prospects Reached", value: "Consistent", icon: "users", tone: "gold" },
      { title: "Qualified Leads", value: "Qualified", icon: "target", tone: "blue" },
      { title: "Calls Booked", value: "Booked", icon: "calendar", tone: "green" },
    ],
    revenueVisual: {
      value: "",
      label: "Pipeline visibility",
    },
    primaryCta: { text: "Apply for Partnership", href: "#apply", icon: "arrow_forward" },
    secondaryCta: { text: "See How It Works", href: "#how" },
  },
  trust: {
    eyebrow: "Built exclusively for masculinity coaches selling $1k–$5k programmes.",
    icons: [
      { type: "material", name: "sports_martial_arts" },
      { type: "material", name: "fitness_center" },
      { type: "material", name: "self_improvement" },
      { type: "material", name: "mindfulness" },
      { type: "material", name: "psychology_alt" },
    ],
  },
  features: {
    id: "features",
    heading: "How CoachFlow AI fills your calendar",
    subcopy:
      "Three core capabilities working together to turn cold prospects into booked sales calls — consistently, every month.",
    cards: [
      {
        icon: "search",
        title: "Precision Prospect Identification",
        copy: "We identify men actively seeking transformation and growth — the exact people your coaching programme is built for. No guesswork. No wasted outreach.",
      },
      {
        icon: "chat",
        title: "Real Conversations. Not Spam.",
        copy: "Our team starts genuine, personalised conversations on your behalf across Instagram, LinkedIn, and email — building trust before a single sales call happens.",
      },
      {
        icon: "pulse",
        title: "Full Pipeline Visibility",
        copy: "Real-time dashboards showing your prospect pipeline, booked calls, and revenue trajectory. You always know exactly what is working and what is being optimised.",
      },
    ],
  },
  workflow: {
    id: "workflow",
    heading: "A systematic path to predictable revenue",
    subcopy:
      "Five steps that transform your coaching business from inconsistent leads to a structured client acquisition machine.",
    expandIcon: "expand_more",
    steps: [
      {
        title: "Offer and niche calibration",
        copy: "We start by deeply auditing your offer and defining exactly who you're for. Not a broad ICA exercise — a precise, signal-based definition of the man your programme transforms. Every message we write for you starts here.",
        open: true,
      },
      {
        title: "Targeted prospect database build",
        copy: "We build a hyper-targeted list using behavioural and interest signals — men who are actively searching for the transformation you provide. Quality over volume at every stage. A smaller, better list outperforms a large, cold one every time.",
      },
      {
        title: "Strategic multi-channel outreach",
        copy: "Personalised outreach across Instagram, LinkedIn, and email — starting real conversations, not spray-and-pray sequences. We handle every reply, every objection, every follow-up. You never touch the cold side of the conversation.",
      },
      {
        title: "Qualified call delivery to your calendar",
        copy: "Prospects are qualified, pre-framed, and booked directly. You show up to calls with men who already understand your offer and are ready to invest — not cold strangers who need convincing of the basics.",
      },
      {
        title: "Weekly optimisation and scaling",
        copy: "Every campaign is analysed weekly. Scripts are tested. Targeting is refined. The system compounds — what works in month one is better in month three. We don't set it and leave it.",
      },
    ],
  },
  pricing: {
    id: "pricing",
    heading: "Transparent Pricing",
    subcopy: "Applications are reviewed for fit before onboarding begins. We say no when it's not the right match.",
    note: "",
    bulletIcon: "check_circle",
    tiers: [
      {
        name: "Starter",
        tagline: "For coaches building their first consistent lead flow. Founding rate — 3 spots only.",
        price: "$600",
        priceSuffix: "",
        outcome: "",
        bullets: [
          "Targeted prospect identification",
          "Instagram + email outreach",
          "Lead qualification",
          "Appointment setting",
          "Weekly reporting",
          "60-day results guarantee",
        ],
        ctaText: "Apply for Starter",
        ctaHref: "#apply",
      },
      {
        name: "Growth",
        tagline: "For coaches ready to scale beyond inconsistent lead flow into a proper acquisition machine.",
        price: "$1,400",
        priceSuffix: "",
        highlight: { badge: "Most Selected", accentHex: "#C9A84C" },
        outcome: "",
        bullets: [
          "Everything in Starter",
          "Multi-channel outreach (Instagram, LinkedIn, Email)",
          "CRM setup and management",
          "Weekly campaign optimisation",
          "Dedicated account manager",
          "Monthly strategy call",
        ],
        ctaText: "Apply for Growth",
        ctaHref: "#apply",
      },
      {
        name: "Scale",
        tagline: "For coaches with an established offer scaling their pipeline aggressively.",
        price: "$2,000",
        priceSuffix: "",
        outcome: "",
        bullets: [
          "Everything in Growth",
          "Full funnel automation",
          "Sales pipeline optimisation",
          "Priority support and strategy calls",
          "Quarterly audit and scale review",
        ],
        ctaText: "Apply for Scale",
        ctaHref: "#apply",
      },
    ],
  },
  application: {
    id: "lead-form",
    heading: "Let's build your system",
    subcopy:
      "Tell us about your business and we will review fit before the next step.",
    fields: {
      firstNameLabel: "First Name",
      lastNameLabel: "Last Name",
      emailLabel: "Email Address",
      firstNamePlaceholder: "Hamza",
      lastNamePlaceholder: "Khan",
      emailPlaceholder: "you@yourcoaching.com",
      revenueLabel: "Current Monthly Revenue",
      revenuePlaceholder: "Select your range",
      bottleneckLabel: "What's your biggest bottleneck right now?",
      bottleneckPlaceholder: "Be honest — the more specific you are, the better we can assess fit.",
      revenueOptions: [
        { value: "", label: "Select your range" },
        { value: "Under $3k/mo", label: "Under $3k/mo" },
        { value: "$3k – $8k/mo", label: "$3k – $8k/mo" },
        { value: "$8k – $20k/mo", label: "$8k – $20k/mo" },
        { value: "$20k – $50k/mo", label: "$20k – $50k/mo" },
        { value: "$50k+/mo", label: "$50k+/mo" },
      ],
    },
    submitText: "Submit Application",
    successTitle: "Application received.",
    successBody:
      "We review every application personally and will be in touch if it is a fit. Check your email, including your spam folder.",
    submitAnotherText: "Submit another",
    footnote: "We review every application personally.",
  },
  footer: {
    brandText: "CoachFlow AI",
    brandIcon: {
      type: "image",
      url: "https://ekwydksbprxebgmhbmtj.supabase.co/storage/v1/object/public/assets/header%20icon.png",
    },
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Contact", href: "#" },
    ],
    copyright: "© 2026 CoachFlow AI. All rights reserved.",
  },
};
