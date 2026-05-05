export type LandingV1Content = {
  nav: {
    logoText: string;
    logoImagePath?: string | null;
    links: Array<{ label: string; href: string; isCta?: boolean }>;
  };
  hero: {
    tag: string;
    headlineHtml: string;
    subHtml: string;
    primaryCta: { label: string; href: string };
    secondaryCta: { label: string; href: string };
    note: string;
  };
  trustStrip: string[];
  founder: {
    label: string;
    avatarText: string;
    name: string;
    title: string;
    quote: string;
    bodyHtml: string;
  };
  promise: {
    sectionTag: string;
    title: string;
    body: string;
    cards: Array<{ num: string; title: string; body: string }>;
  };
  howItWorks: {
    sectionTag: string;
    title: string;
    body: string;
    steps: Array<{ num: string; title: string; body: string }>;
  };
  honest: {
    sectionTag: string;
    quote: string;
    bodyHtml: string;
    pledgeTitle: string;
    pledgeItems: string[];
  };
  pricing: {
    sectionTag: string;
    title: string;
    sideNote: string;
    tiers: Array<{
      badge: string;
      badgeStyle?: "default" | "outline" | "goldSubtle";
      name: string;
      desc: string;
      price: string;
      priceWas?: string;
      priceMeta: string;
      features: string[];
      ctaLabel: string;
      ctaHref: string;
      featured?: boolean;
      ctaStyle?: "solid" | "outline";
    }>;
    note: string;
  };
  apply: {
    sectionTag: string;
    titleHtml: string;
    body: string;
    promise: Array<{ num: string; title: string; body: string }>;
    form: {
      title: string;
      subtitle: string;
      firstNameLabel: string;
      lastNameLabel: string;
      emailLabel: string;
      revenueLabel: string;
      revenueOptions: string[];
      messageLabel: string;
      messagePlaceholder: string;
      submitLabel: string;
      disclaimer: string;
      successTitle: string;
      successBody: string;
    };
  };
  footer: {
    logoText: string;
    logoImagePath?: string | null;
    links: Array<{ label: string; href: string }>;
    copyright: string;
  };
};

export const defaultLandingV1: LandingV1Content = {
  nav: {
    logoText: "CoachFlow AI",
    logoImagePath: null,
    links: [
      { label: "Our Story", href: "#founder" },
      { label: "How It Works", href: "#how" },
      { label: "Pricing", href: "#pricing" },
      { label: "Apply Now", href: "#apply", isCta: true },
    ],
  },
  hero: {
    tag: "Client Acquisition For Masculinity Coaches",
    headlineHtml: "Stop Guessing.<br />Start <em>Closing.</em>",
    subHtml:
      "You've built a real coaching business. <strong>Your calendar shouldn't depend on content going viral or a referral showing up.</strong> We install a system that fills it — month after month, without ads.",
    primaryCta: { label: "Apply for Partnership", href: "#apply" },
    secondaryCta: { label: "See How It Works", href: "#how" },
    note: "Applications reviewed personally. No automated responses.",
  },
  trustStrip: [
    "Fit-first — we turn away wrong clients",
    "Human outreach — no bots, no spam",
    "Brand-safe — your reputation is protected",
    "Weekly optimisation — the system improves every month",
    "No lock-in contracts",
  ],
  founder: {
    label: "Who Is Behind This",
    avatarText: "H",
    name: "Hamza",
    title: "Founder, CoachFlow AI · Masculinity Coach",
    quote: '"I didn\'t build this for coaches. I built it because I was one."',
    bodyHtml:
      "<p>I spent years in the masculinity coaching space — developing men, running programmes, trying to figure out how to fill my calendar without becoming a content machine. I know the frustration of having a life-changing offer and not being able to get it in front of the right men consistently.</p><p>Most client acquisition agencies <strong>have never coached anyone.</strong> They sell outreach systems built for SaaS companies and slap them onto coaches. It doesn't work — because they don't understand the buyer, the conversation, or what it takes to earn trust with men who are already sceptical.</p><p>CoachFlow is built differently. Every system, every message, every piece of outreach is designed specifically for masculinity coaches — because I know your world from the inside.</p><p><strong>That's not a marketing line. That's why this works.</strong></p>",
  },
  promise: {
    sectionTag: "What You're Actually Getting",
    title: "Four Things We Stand Behind",
    body: "Not features. Not deliverables. Commitments — the things that make working with us feel different from day one.",
    cards: [
      {
        num: "01",
        title: "We protect your brand like it's ours",
        body: "Every message we send goes out under your name. We write with your voice, your standards, and your reputation on the line. We would never send anything we wouldn't be proud to sign ourselves.",
      },
      {
        num: "02",
        title: "No vanity metrics. Booked calls or nothing.",
        body: "We don't report follower growth, impressions, or reply rates. The only number that matters is qualified calls booked onto your calendar. That's the only thing we optimise for.",
      },
      {
        num: "03",
        title: "You'll know exactly what's happening, always",
        body: "Real-time pipeline visibility. Weekly reporting. No black boxes. If something isn't working, we tell you before you ask — and we show you what we're changing.",
      },
      {
        num: "04",
        title: "We only work with coaches we can genuinely help",
        body: "Every application is reviewed personally. If your offer, audience, or stage isn't right for our system, we'll tell you honestly — and point you toward what will actually work for you right now.",
      },
    ],
  },
  howItWorks: {
    sectionTag: "The Framework",
    title: "How We Fill Your Calendar",
    body: "Five steps. No shortcuts. Built to compound — the longer you run it, the stronger it gets.",
    steps: [
      {
        num: "STEP 01",
        title: "Offer and niche calibration",
        body: "We start by deeply auditing your offer and defining exactly who you're for. Not a broad ICA exercise — a precise, signal-based definition of the man your programme transforms. Every message we write for you starts here.",
      },
      {
        num: "STEP 02",
        title: "Targeted prospect database build",
        body: "We build a hyper-targeted list using behavioural and interest signals — men who are actively searching for the transformation you provide. Quality over volume at every stage. A smaller, better list outperforms a large, cold one every time.",
      },
      {
        num: "STEP 03",
        title: "Strategic multi-channel outreach",
        body: "Personalised outreach across Instagram, LinkedIn, and email — starting real conversations, not spray-and-pray sequences. We handle every reply, every objection, every follow-up. You never touch the cold side of the conversation.",
      },
      {
        num: "STEP 04",
        title: "Qualified call delivery to your calendar",
        body: "Prospects are qualified, pre-framed, and booked directly. You show up to calls with men who already understand your offer and are ready to invest — not cold strangers who need convincing of the basics.",
      },
      {
        num: "STEP 05",
        title: "Weekly optimisation and scaling",
        body: "Every campaign is analysed weekly. Scripts are tested. Targeting is refined. The system compounds — what works in month one is better in month three. We don't set it and leave it.",
      },
    ],
  },
  honest: {
    sectionTag: "The Honest Part",
    quote:
      '"We\'re not the biggest agency. We\'re building something serious — and we want the right coaches to build it with."',
    bodyHtml:
      "<p>CoachFlow is new. We don't have a wall of client logos or ten years of case studies to show you. What we do have is a founder who has lived your problem, a system built specifically for your world, and a commitment to prove ourselves through results — not through looking established on a website.</p><p>That's why we're offering our first founding cohort a different arrangement: <strong>you get a reduced rate, we get to build the proof together.</strong> Full transparency. Weekly reporting. And if we don't deliver qualified conversations within the first 60 days, you don't pay for the second month.</p><p>That's the deal. No fine print.</p>",
    pledgeTitle: "Our Founding Partner Guarantee",
    pledgeItems: [
      "Qualified conversations started within 14 days of launch",
      "Weekly reporting — full visibility, no black boxes",
      "If no results in 60 days — month two is free",
      "Only 3 founding partner spots available",
    ],
  },
  pricing: {
    sectionTag: "Partnership Tiers",
    title: "Transparent Pricing",
    sideNote:
      "Applications are reviewed for fit before onboarding begins. We say no when it's not the right match.",
    tiers: [
      {
        badge: "Founding Partner",
        badgeStyle: "goldSubtle",
        name: "Starter",
        desc: "For coaches building their first consistent lead flow. Founding rate — 3 spots only.",
        price: "$600",
        priceWas: "$900",
        priceMeta: "per month · founding rate",
        features: [
          "Targeted prospect identification",
          "Instagram + email outreach",
          "Lead qualification",
          "Appointment setting",
          "Weekly reporting",
          "60-day results guarantee",
        ],
        ctaLabel: "Apply for Starter",
        ctaHref: "#apply",
        ctaStyle: "outline",
      },
      {
        badge: "Most Selected",
        badgeStyle: "default",
        name: "Growth",
        desc: "For coaches ready to scale beyond inconsistent lead flow into a proper acquisition machine.",
        price: "$1,400",
        priceMeta: "per month",
        features: [
          "Everything in Starter",
          "Multi-channel outreach (Instagram, LinkedIn, Email)",
          "CRM setup and management",
          "Weekly campaign optimisation",
          "Dedicated account manager",
          "Monthly strategy call",
        ],
        ctaLabel: "Apply for Growth",
        ctaHref: "#apply",
        featured: true,
        ctaStyle: "solid",
      },
      {
        badge: "For Established Coaches",
        badgeStyle: "outline",
        name: "Scale",
        desc: "For coaches with an established offer scaling their pipeline aggressively.",
        price: "$2,000",
        priceMeta: "per month",
        features: [
          "Everything in Growth",
          "Full funnel automation",
          "Sales pipeline optimisation",
          "Priority support and strategy calls",
          "Quarterly audit and scale review",
        ],
        ctaLabel: "Apply for Scale",
        ctaHref: "#apply",
        ctaStyle: "outline",
      },
    ],
    note: "Not sure which tier is right? Apply anyway — we'll recommend the right fit after reviewing your business.",
  },
  apply: {
    sectionTag: "Apply for Partnership",
    titleHtml: "Let's Build<br />Your System",
    body: "Tell us where you are and where you want to go. We review every application personally and only move forward when we're confident we can deliver results for you.",
    promise: [
      {
        num: "1",
        title: "Personal review",
        body: "Hamza reviews every application himself. No VA, no automation.",
      },
      {
        num: "2",
        title: "Honest fit assessment",
        body: "If we can't help you, we'll tell you directly — and explain why.",
      },
      {
        num: "3",
        title: "Response within 48 hours",
        body: "No ghosting. No automated drip sequence. A real reply.",
      },
    ],
    form: {
      title: "Your Application",
      subtitle: "Takes 2 minutes. No pressure, no pitch call unless it's a clear fit.",
      firstNameLabel: "First Name",
      lastNameLabel: "Last Name",
      emailLabel: "Email Address",
      revenueLabel: "Current Monthly Revenue",
      revenueOptions: [
        "Select your range",
        "Under $3k/mo",
        "$3k – $8k/mo",
        "$8k – $20k/mo",
        "$20k – $50k/mo",
        "$50k+/mo",
      ],
      messageLabel: "What's your biggest bottleneck right now?",
      messagePlaceholder: "Be honest — the more specific you are, the better we can assess fit.",
      submitLabel: "Submit Application →",
      disclaimer: "No newsletter. No automated sales blast. Just a personal fit review from Hamza.",
      successTitle: "Application Received",
      successBody:
        "Hamza reviews every application personally. You'll hear back within 48 hours — check your inbox, including spam.",
    },
  },
  footer: {
    logoText: "CoachFlow AI",
    logoImagePath: null,
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Contact", href: "#" },
    ],
    copyright: "© 2026 CoachFlow AI. All rights reserved.",
  },
};

export function pickLandingV1(content: unknown): LandingV1Content {
  const root = (content && typeof content === "object" ? (content as any) : null) as any;
  const v = root?.landingV1;
  if (v && typeof v === "object") {
    return { ...defaultLandingV1, ...(v as any) } as LandingV1Content;
  }
  return defaultLandingV1;
}
