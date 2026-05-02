import type { HomepageContent } from "@/content/homepage";

type RevenueOption = { value: string; label: string };

type Props = {
  content: HomepageContent;
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

export function LandingHtmlV1Apply(props: Props) {
  void props.content;

  const selectOptions: RevenueOption[] = [
    { value: "", label: "Select your range" },
    { value: "Under $3k/mo", label: "Under $3k/mo" },
    { value: "$3k – $8k/mo", label: "$3k – $8k/mo" },
    { value: "$8k – $20k/mo", label: "$8k – $20k/mo" },
    { value: "$20k – $50k/mo", label: "$20k – $50k/mo" },
    { value: "$50k+/mo", label: "$50k+/mo" },
  ];

  return (
    <div className="form-section" id="apply">
      <div className="form-inner">
        <div className="form-left">
          <div className="section-tag">Apply for Partnership</div>
          <h2 className="section-title">
            Let&apos;s Build<br />Your System
          </h2>
          <p className="section-body" style={{ marginTop: "1rem" }}>
            Tell us where you are and where you want to go. We review every application personally and only move forward
            when we&apos;re confident we can deliver results for you.
          </p>

          <div className="form-promise">
            {["Personal review", "Honest fit assessment", "Response within 48 hours"].map((title, i) => {
              const desc =
                i === 0
                  ? "Hamza reviews every application himself. No VA, no automation."
                  : i === 1
                    ? "If we can&apos;t help you, we&apos;ll tell you directly — and explain why."
                    : "No ghosting. No automated drip sequence. A real reply.";
              return (
                <div key={title} className="form-promise-item">
                  <div className="form-promise-icon">{i + 1}</div>
                  <div className="form-promise-text">
                    <strong>{title}</strong>
                    <span>{desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="form-right">
          <div id="form-content" style={{ display: props.submitted ? "none" : "block" }}>
            <div className="form-title">Your Application</div>
            <div className="form-subtitle">Takes 2 minutes. No pressure, no pitch call unless it&apos;s a clear fit.</div>

            <div className="form-row">
              <div>
                <label htmlFor="fname">First Name</label>
                <input
                  type="text"
                  id="fname"
                  placeholder="Hamza"
                  value={props.firstName}
                  onChange={(e) => props.setFirstName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="lname">Last Name</label>
                <input
                  type="text"
                  id="lname"
                  placeholder="Khan"
                  value={props.lastName}
                  onChange={(e) => props.setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                placeholder="you@yourcoaching.com"
                value={props.email}
                onChange={(e) => props.setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="revenue">Current Monthly Revenue</label>
              <select id="revenue" value={props.revenue} onChange={(e) => props.setRevenue(e.target.value)}>
                {selectOptions.map((o) => (
                  <option key={o.value || o.label} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="bottleneck">What&apos;s your biggest bottleneck right now?</label>
              <textarea
                id="bottleneck"
                placeholder="Be honest — the more specific you are, the better we can assess fit."
                value={props.bottleneck}
                onChange={(e) => props.setBottleneck(e.target.value)}
              />
            </div>

            <button className="form-submit" type="button" disabled={props.submitting} onClick={props.onSubmit}>
              {props.submitting ? "Submitting…" : "Submit Application →"}
            </button>
            <p className="form-disclaimer">No newsletter. No automated sales blast. Just a personal fit review from Hamza.</p>
          </div>

          <div className="form-success" id="form-success" style={{ display: props.submitted ? "block" : "none" }}>
            <div className="form-success-icon">✓</div>
            <h3>Application Received</h3>
            <p>
              Hamza reviews every application personally. You&apos;ll hear back within 48 hours — check your inbox, including
              spam.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

