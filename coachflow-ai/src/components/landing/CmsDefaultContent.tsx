import type { ReactNode } from "react";
import Link from "next/link";
import type { HomepageContent } from "@/content/homepage";

type Args = {
  content: HomepageContent;
};

const LAST_UPDATED = "May 2026";

function contactEmail(content: HomepageContent): string | null {
  const candidate =
    (content.application as any)?.contactEmail ||
    (content.site as any)?.contactEmail ||
    (content.footer as any)?.contactEmail ||
    "";
  const trimmed = String(candidate || "").trim();
  return trimmed.length ? trimmed : null;
}

function whatsappLink(content: HomepageContent): string | null {
  const cfg = (content as any).whatsapp;
  if (!cfg || !cfg.enabled) return null;
  const digits = String(cfg.phone || "").replace(/[^0-9]/g, "");
  if (!digits.length) return null;
  const message = String(cfg.message || "").trim();
  return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

export function renderBrandedDefault(slug: string, args: Args): ReactNode {
  if (slug === "privacy-policy") return <PrivacyPolicyDefault content={args.content} />;
  if (slug === "terms-of-service") return <TermsOfServiceDefault content={args.content} />;
  if (slug === "contact") return <ContactDefault content={args.content} />;
  return null;
}

function PageShell({ title, eyebrow, children }: { title: string; eyebrow?: string; children: ReactNode }) {
  return (
    <section className="cf-rich-text-section">
      <article className="cf-rich-text-document">
        {eyebrow ? <p className="cf-page-eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        <div className="cf-rich-text-body">{children}</div>
      </article>
    </section>
  );
}

function PrivacyPolicyDefault({ content }: { content: HomepageContent }) {
  const email = contactEmail(content);
  return (
    <PageShell title="Privacy Policy" eyebrow={`Last updated · ${LAST_UPDATED}`}>
      <p>
        This Privacy Policy describes how Coachflow Aquisition handles information you submit through our website,
        application form, and direct communication with our team.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>Information you submit voluntarily through the application form, including your name, email, business details, and message.</li>
        <li>Information shared with us during follow-up conversations on email, WhatsApp, or video calls.</li>
        <li>Standard technical information such as IP address, browser type, and pages viewed, captured by hosting and analytics providers.</li>
      </ul>

      <h2>How we use information</h2>
      <ul>
        <li>To review your application and decide if our service is a fit.</li>
        <li>To follow up directly about your application or scheduled call.</li>
        <li>To improve our website, content, and service quality.</li>
      </ul>

      <h2>How we share information</h2>
      <p>
        We do not sell or rent your information. We share data only with the limited third-party services we use to
        operate the website and our outreach, including hosting, database, email delivery, and analytics providers.
        These providers process data on our behalf under their own privacy commitments.
      </p>

      <h2>Cookies and analytics</h2>
      <p>
        Our website may use cookies and similar technologies to operate basic features and to understand aggregate
        usage. You can disable cookies in your browser settings; some site features may not work as expected if
        you do.
      </p>

      <h2>Your choices</h2>
      <p>
        You may request access to, correction of, or deletion of the information you have submitted by contacting
        us at the address below. We will respond in a reasonable timeframe and within applicable legal requirements.
      </p>

      <h2>Children</h2>
      <p>
        Our service is intended for business owners and is not directed to children under 16. We do not knowingly
        collect information from children.
      </p>

      <h2>Updates</h2>
      <p>
        We may update this Privacy Policy from time to time. The &ldquo;Last updated&rdquo; date at the top of this
        page reflects the latest revision.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about privacy? {email ? (
          <>
            Email{" "}
            <a href={`mailto:${email}`}>{email}</a>.
          </>
        ) : (
          <>Use the contact page to reach our team.</>
        )}
      </p>

      <p className="cf-legal-note">
        This document is a starting template, not legal advice. Before launching publicly, please have a qualified
        attorney review and tailor this policy to your jurisdiction and operations.
      </p>
    </PageShell>
  );
}

function TermsOfServiceDefault({ content }: { content: HomepageContent }) {
  const email = contactEmail(content);
  return (
    <PageShell title="Terms of Service" eyebrow={`Last updated · ${LAST_UPDATED}`}>
      <p>
        These Terms govern your use of the Coachflow Aquisition website and any services you engage from us. By
        using this site or submitting an application, you agree to these Terms.
      </p>

      <h2>Our service</h2>
      <p>
        Coachflow Aquisition offers client acquisition advisory and infrastructure services to a small set of
        accepted partners. Engagements are accepted at our discretion based on your application and a fit
        conversation.
      </p>

      <h2>Application and acceptance</h2>
      <ul>
        <li>Submitting the application form does not guarantee acceptance or any specific outcome.</li>
        <li>We may decline applications without explanation.</li>
        <li>Pricing tiers and inclusions shown on the website are subject to change and are confirmed in a written agreement at the time of engagement.</li>
      </ul>

      <h2>No guarantee of results</h2>
      <p>
        We do not guarantee any specific revenue, lead volume, or business outcome. Results depend on many factors
        outside our control, including your offer, market, capacity, and follow-through. Examples on the website
        are illustrative, not promises.
      </p>

      <h2>Your responsibilities</h2>
      <ul>
        <li>Provide accurate, complete information in your application and during engagement.</li>
        <li>Use our materials and recommendations within your own business; do not resell, rebrand, or redistribute them without written permission.</li>
        <li>Keep confidential information you receive during an engagement confidential.</li>
      </ul>

      <h2>Intellectual property</h2>
      <p>
        All website content, frameworks, playbooks, and materials are owned by Coachflow Aquisition or its
        licensors. You may use them only as authorized in writing as part of a paid engagement.
      </p>

      <h2>Payment and refunds</h2>
      <p>
        Payment terms, scope, and refund eligibility are defined in the engagement agreement signed at the start
        of a paid relationship. No refund is implied by acceptance of these Terms.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the extent allowed by law, Coachflow Aquisition, its team, and its providers are not liable for
        indirect, incidental, or consequential damages arising from use of this website or our services. Total
        liability is limited to amounts you have paid us in the prior three months.
      </p>

      <h2>Termination</h2>
      <p>
        We may suspend or terminate access to this website or any service at any time if these Terms are violated
        or if continuing the engagement is not workable for either party.
      </p>

      <h2>Governing law</h2>
      <p>
        These Terms are governed by the laws applicable to where Coachflow Aquisition operates. Disputes will be
        resolved in the courts of that jurisdiction unless we agree otherwise in writing.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these Terms? {email ? (
          <>
            Email{" "}
            <a href={`mailto:${email}`}>{email}</a>.
          </>
        ) : (
          <>Use the contact page to reach our team.</>
        )}
      </p>

      <p className="cf-legal-note">
        This document is a starting template, not legal advice. Before launching publicly, please have a qualified
        attorney review and tailor these terms to your jurisdiction and operations.
      </p>
    </PageShell>
  );
}

function ContactDefault({ content }: { content: HomepageContent }) {
  const email = contactEmail(content);
  const wa = whatsappLink(content);
  return (
    <PageShell title="Contact" eyebrow="Talk to the team">
      <p>
        We keep things personal. Every inbound message reaches the founding team directly — no automated funnel,
        no outsourced SDR pool. Pick the path that fits you.
      </p>

      <h2>Apply for an engagement</h2>
      <p>
        If you want a focused conversation about a possible engagement, start with the application form. It takes
        less than two minutes and gives us what we need to come prepared.
      </p>
      <p>
        <Link href="/#apply" className="cf-cta-link">Open the application →</Link>
      </p>

      {email ? (
        <>
          <h2>Email</h2>
          <p>
            For everything else — partnership requests, press, or general questions — write to{" "}
            <a href={`mailto:${email}`}>{email}</a>. Expect a reply within two business days.
          </p>
        </>
      ) : null}

      {wa ? (
        <>
          <h2>WhatsApp</h2>
          <p>
            Prefer a chat?{" "}
            <a href={wa} target="_blank" rel="noopener noreferrer">
              Message us on WhatsApp
            </a>
            . Same team, same reply window.
          </p>
        </>
      ) : null}

      <h2>Looking for the basics?</h2>
      <ul>
        <li>
          <Link href="/#how">How it works</Link>
        </li>
        <li>
          <Link href="/#pricing">Pricing</Link>
        </li>
        <li>
          <Link href="/p/privacy-policy">Privacy Policy</Link>
        </li>
        <li>
          <Link href="/p/terms-of-service">Terms of Service</Link>
        </li>
      </ul>
    </PageShell>
  );
}
