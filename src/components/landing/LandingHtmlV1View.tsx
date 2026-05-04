import type { HomepageContent } from "@/content/homepage";
import { LandingHtmlV1Nav, type LandingNavItem } from "@/components/landing/landingHtmlV1/LandingHtmlV1Nav";
import { LandingHtmlV1Hero } from "@/components/landing/landingHtmlV1/LandingHtmlV1Hero";
import { LandingHtmlV1Founder } from "@/components/landing/landingHtmlV1/LandingHtmlV1Founder";
import { LandingHtmlV1Promise } from "@/components/landing/landingHtmlV1/LandingHtmlV1Promise";
import { LandingHtmlV1How } from "@/components/landing/landingHtmlV1/LandingHtmlV1How";
import { LandingHtmlV1Honest } from "@/components/landing/landingHtmlV1/LandingHtmlV1Honest";
import { LandingHtmlV1Pricing } from "@/components/landing/landingHtmlV1/LandingHtmlV1Pricing";
import { LandingHtmlV1Apply } from "@/components/landing/landingHtmlV1/LandingHtmlV1Apply";
import { LandingHtmlV1Footer } from "@/components/landing/landingHtmlV1/LandingHtmlV1Footer";

export type LandingHtmlV1ViewProps = {
  content: HomepageContent;
  nav: LandingNavItem[];
  menuOpen: boolean;
  setMenuOpen: (next: boolean) => void;
  submitted: boolean;
  submitting: boolean;
  firstName: string;
  lastName: string;
  email: string;
  revenue: string;
  bottleneck: string;
  setFirstName: (next: string) => void;
  setLastName: (next: string) => void;
  setEmail: (next: string) => void;
  setRevenue: (next: string) => void;
  setBottleneck: (next: string) => void;
  onSubmit: () => void;
};

export function LandingHtmlV1View(props: LandingHtmlV1ViewProps) {
  const { content } = props;
  const steps = [
    {
      title: "Offer and niche calibration",
      copy: "We start by deeply auditing your offer and defining exactly who you're for. Not a broad ICA exercise — a precise, signal-based definition of the man your programme transforms. Every message we write for you starts here.",
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
  ];
  const tiers = [
    {
      name: "Starter",
      tagline: "For coaches building their first consistent lead flow. Founding rate — 3 spots only.",
      price: "$600",
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
  ];

  return (
    <div className="cf-landing-htmlv1">
      <LandingHtmlV1Nav
        brandText="CoachFlow AI"
        nav={props.nav}
        ctaHref="#apply"
        ctaText="Apply Now"
        menuOpen={props.menuOpen}
        setMenuOpen={props.setMenuOpen}
      />
      <LandingHtmlV1Hero content={content} />
      <LandingHtmlV1Founder />
      <LandingHtmlV1Promise />
      <LandingHtmlV1How steps={steps} />
      <LandingHtmlV1Honest />
      <LandingHtmlV1Pricing tiers={tiers} />
      <LandingHtmlV1Apply
        content={content}
        submitted={props.submitted}
        submitting={props.submitting}
        firstName={props.firstName}
        lastName={props.lastName}
        email={props.email}
        revenue={props.revenue}
        bottleneck={props.bottleneck}
        setFirstName={props.setFirstName}
        setLastName={props.setLastName}
        setEmail={props.setEmail}
        setRevenue={props.setRevenue}
        setBottleneck={props.setBottleneck}
        onSubmit={props.onSubmit}
      />
      <LandingHtmlV1Footer content={content} />
    </div>
  );
}

