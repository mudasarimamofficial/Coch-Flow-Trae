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
  const steps = Array.isArray(content.workflow?.steps) ? content.workflow.steps.slice(0, 5) : [];
  const tiers = Array.isArray(content.pricing?.tiers) ? content.pricing.tiers.slice(0, 3) : [];

  return (
    <div className="cf-landing">
      <LandingHtmlV1Nav
        brandText={content.header?.brandText || "CoachFlow AI"}
        nav={props.nav}
        ctaHref={content.header?.primaryCta?.href || "#apply"}
        ctaText={content.header?.primaryCta?.text || "Apply Now"}
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

