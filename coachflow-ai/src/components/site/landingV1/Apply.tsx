"use client";

import { useState } from "react";
import type { LandingV1Content } from "@/components/site/landingV1Defaults";

export function LandingApply({ apply }: { apply: LandingV1Content["apply"] }) {
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [email, setEmail] = useState("");
  const [revenue, setRevenue] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit() {
    if (!fname.trim() || !email.trim()) {
      alert("Please fill in your name and email to apply.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          first_name: fname.trim(),
          last_name: lname.trim() || "-",
          email: email.trim(),
          revenue: revenue.trim() || null,
          message: message.trim() || null,
        }),
      });
      if (!res.ok) throw new Error("bad_response");
      setSuccess(true);
    } catch {
      alert("Something went wrong submitting your application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="form-section" id="apply">
      <div className="form-inner">
        <div className="form-left">
          <div className="section-tag">{apply.sectionTag}</div>
          <h2 className="section-title" dangerouslySetInnerHTML={{ __html: apply.titleHtml }} />
          <p className="section-body" style={{ marginTop: "1rem" }}>
            {apply.body}
          </p>

          <div className="form-promise">
            {apply.promise.map((p) => (
              <div key={p.num} className="form-promise-item">
                <div className="form-promise-icon">{p.num}</div>
                <div className="form-promise-text">
                  <strong>{p.title}</strong>
                  <span>{p.body}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-right">
          {!success ? (
            <>
              <div className="form-title">{apply.form.title}</div>
              <div className="form-subtitle">{apply.form.subtitle}</div>

              <div className="form-row">
                <div>
                  <label htmlFor="fname">{apply.form.firstNameLabel}</label>
                  <input
                    type="text"
                    id="fname"
                    value={fname}
                    onChange={(e) => setFname(e.target.value)}
                    placeholder="Hamza"
                  />
                </div>
                <div>
                  <label htmlFor="lname">{apply.form.lastNameLabel}</label>
                  <input
                    type="text"
                    id="lname"
                    value={lname}
                    onChange={(e) => setLname(e.target.value)}
                    placeholder="Khan"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">{apply.form.emailLabel}</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@yourcoaching.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="revenue">{apply.form.revenueLabel}</label>
                <select id="revenue" value={revenue} onChange={(e) => setRevenue(e.target.value)}>
                  {apply.form.revenueOptions.map((o, idx) => (
                    <option key={`${idx}:${o}`} value={idx === 0 ? "" : o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="bottleneck">{apply.form.messageLabel}</label>
                <textarea
                  id="bottleneck"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={apply.form.messagePlaceholder}
                />
              </div>

              <button className="form-submit" disabled={submitting} onClick={handleSubmit}>
                {submitting ? "Submitting..." : apply.form.submitLabel}
              </button>
              <p className="form-disclaimer">{apply.form.disclaimer}</p>
            </>
          ) : (
            <div className="form-success open">
              <div className="form-success-icon">✓</div>
              <h3>{apply.form.successTitle}</h3>
              <p>{apply.form.successBody}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

