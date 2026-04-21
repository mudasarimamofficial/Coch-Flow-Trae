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
    };
    typography?: {
      headingFont?: string;
      bodyFont?: string;
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
      };
      typography?: {
        headingFont?: string;
        bodyFont?: string;
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
      primary: "#0fa3a3",
      secondary: "#0b1414",
      accent: "#b58a2f",
      background: "#0b1414",
      text: "#e2e8f0",
      surface: "#112121",
      border: "rgba(255,255,255,0.10)",
    },
    typography: {
      headingFont: "",
      bodyFont: "",
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
      },
      typography: {
        headingFont: "",
        bodyFont: "",
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
      { id: "hero", type: "hero", enabled: true, settings: { heroBackground: true } },
      { id: "features", type: "features", enabled: true, settings: { label: "What we do" } },
      {
        id: "workflow",
        type: "workflow",
        enabled: true,
        settings: { label: "The CoachFlow framework", variant: "landing" },
      },
      { id: "pricing", type: "pricing", enabled: true, settings: { label: "Partnership tiers" } },
      {
        id: "audit-bridge",
        type: "audit_bridge",
        enabled: true,
        settings: {
          heading: "Not sure which tier is right for you?",
          subcopy:
            "Take our free 60-second client acquisition audit. Answer 7 questions and we will show you exactly where your lead generation is leaking — and which tier fits your current stage.",
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
      { label: "How It Works", href: "#workflow" },
      { label: "What We Do", href: "#features" },
      { label: "Pricing", href: "#pricing" },
    ],
    primaryCta: { text: "Apply Now", href: "#lead-form" },
  },
  hero: {
    badge: { icon: "auto_awesome", text: "Client Acquisition Infrastructure" },
    heading: {
      prefix: "Predictable Booked Calls For ",
      highlight: "Masculinity Coaches",
    },
    subcopy:
      "We install a client acquisition infrastructure that generates qualified sales conversations consistently — so you stop relying on content, referrals, or luck.",
    note: "Every campaign is personally overseen by our team — AI handles the scale, humans handle the strategy.",
    trust: {
      text: "Built exclusively for",
      pills: ["Masculinity coaches", "$1k–$5k programmes", "High-ticket scale"],
    },
    primaryCta: { text: "Apply for Partnership", href: "#lead-form", icon: "arrow_forward" },
    secondaryCta: { text: "See How It Works", href: "#workflow" },
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
        copy: "We start by auditing your current offer and deeply defining your ideal client avatar. Every message, every outreach sequence, every campaign is built around the specific man your coaching programme transforms.",
        open: true,
      },
      {
        title: "Targeted prospect database build",
        copy: "We build a hyper-targeted list of coaches' ideal clients using behavioural and interest signals — men who are actively searching for the transformation you provide. Quality over volume at every stage.",
      },
      {
        title: "Strategic multi-channel outreach",
        copy: "Our team executes personalised outreach campaigns across Instagram, LinkedIn, and email — starting real conversations that feel human, not automated. We handle every reply, every objection, every follow-up.",
      },
      {
        title: "Qualified call delivery to your calendar",
        copy: "Prospects are qualified, pre-framed, and booked directly onto your calendar. You show up to calls with men who already understand your offer and are ready to invest — not cold strangers.",
      },
      {
        title: "Weekly optimisation and scaling",
        copy: "Every campaign is analysed weekly. Scripts are tested. Targeting is refined. Conversion rates improve continuously. The system gets stronger every single month you are with us.",
      },
    ],
  },
  pricing: {
    id: "pricing",
    heading: "Transparent pricing for serious coaches",
    subcopy: "Three tiers built around where you are right now and where you want to go. No hidden fees. No long-term lock-in.",
    note: "Currently onboarding 5 new coaches this month — apply to see if you qualify.",
    bulletIcon: "check_circle",
    tiers: [
      {
        name: "Starter",
        tagline: "For coaches building their first consistent lead flow.",
        price: "$900",
        priceSuffix: "/mo",
        outcome: "Expected 8–15 qualified conversations per month",
        bullets: [
          "Targeted prospect identification",
          "Instagram + email outreach",
          "Lead qualification",
          "Appointment setting",
        ],
        ctaText: "Apply for Starter",
        ctaHref: "#lead-form",
      },
      {
        name: "Growth",
        tagline: "For coaches ready for predictable $20k+ months.",
        price: "$1,400",
        priceSuffix: "/mo",
        highlight: { badge: "Most Popular", accentHex: "#b58a2f" },
        outcome: "Expected 20–35 booked calls per month",
        bullets: [
          "Everything in Starter",
          "Multi-channel outreach",
          "CRM setup and management",
          "Weekly campaign optimisation",
          "Dedicated account manager",
        ],
        ctaText: "Apply for Growth",
        ctaHref: "#lead-form",
      },
      {
        name: "Scale",
        tagline: "For established coaches scaling aggressively.",
        price: "$2,000",
        priceSuffix: "/mo",
        outcome: "Expected 40+ calls with full pipeline visibility",
        bullets: [
          "Everything in Growth",
          "Full funnel automation",
          "Sales pipeline optimisation",
          "Priority support and strategy calls",
        ],
        ctaText: "Apply for Scale",
        ctaHref: "#lead-form",
      },
    ],
  },
  application: {
    id: "lead-form",
    heading: "Let's build your system",
    subcopy:
      "We only work with 5 new coaches per month to ensure delivery quality. Tell us about your business and we will be in touch within 24 hours.",
    fields: {
      firstNameLabel: "First name",
      lastNameLabel: "Last name",
      emailLabel: "Email address",
      firstNamePlaceholder: "Hamza",
      lastNamePlaceholder: "Mukhtar",
      emailPlaceholder: "you@example.com",
      revenueLabel: "Current monthly revenue",
      revenuePlaceholder: "Select your range",
      bottleneckLabel: "What is your biggest bottleneck right now?",
      bottleneckPlaceholder: "e.g. I get engagement on my content but no one books a call...",
      revenueOptions: [
        { value: "Under $3k/mo", label: "Under $3k/mo" },
        { value: "$3k–$8k/mo", label: "$3k–$8k/mo" },
        { value: "$8k–$20k/mo", label: "$8k–$20k/mo" },
        { value: "$20k–$50k/mo", label: "$20k–$50k/mo" },
        { value: "$50k+/mo", label: "$50k+/mo" },
      ],
    },
    submitText: "Submit Application",
    successTitle: "Application received.",
    successBody:
      "We review every application personally and will be in touch within 24 hours if it is a fit. Check your email — including your spam folder.",
    submitAnotherText: "Submit another",
    footnote: "We review every application personally and respond within 24 hours.",
  },
  footer: {
    brandText: "CoachFlow AI",
    brandIcon: {
      type: "image",
      url: "https://ekwydksbprxebgmhbmtj.supabase.co/storage/v1/object/public/assets/header%20icon.png",
    },
    links: [
      { label: "Privacy Policy", href: "/p/privacy-policy" },
      { label: "Terms of Service", href: "/p/terms-of-service" },
      { label: "Contact", href: "/p/contact" },
    ],
    copyright: "© 2026 CoachFlow AI. All rights reserved.",
  },
};
