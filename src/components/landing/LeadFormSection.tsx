"use client";

import { useMemo, useState } from "react";
import { z } from "zod";
import type { HomepageContent } from "@/content/homepage";
import type { PageSection } from "@/components/landing/sectionRegistry";

const schema = z.object({
  first_name: z.string().min(1, "First name is required").max(120),
  last_name: z.string().min(1, "Last name is required").max(120),
  email: z.string().email("Enter a valid email").max(240),
  revenue: z.string().min(1, "Select a revenue range").max(120),
  message: z.string().max(4000).optional().nullable(),
  company: z.string().optional().nullable(),
});

type FormState = z.infer<typeof schema>;

type Props = {
  content: HomepageContent;
  section?: PageSection;
};

export function LeadFormSection({ content, section }: Props) {
  const label = (section?.settings as any)?.label ? String((section?.settings as any).label) : "";
  const footnote = content.application.footnote || "We’ll review your answers and reply with next steps.";
  const [values, setValues] = useState<FormState>({
    first_name: "",
    last_name: "",
    email: "",
    revenue: "",
    message: "",
    company: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const payload = useMemo(() => {
    return {
      first_name: values.first_name.trim(),
      last_name: values.last_name.trim(),
      email: values.email.trim(),
      revenue: values.revenue?.trim() || null,
      message: values.message?.trim() || null,
      company: values.company?.trim() || null,
    };
  }, [values]);

  return (
    <section id="lead-form">
      <div className="container">
        <div className="form-wrap" id={content.application.id}>
          <div id="form-content" style={{ display: submitted ? "none" : "block" }}>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setError(null);
                setFieldErrors({});

                const parsed = schema.safeParse(payload);
                if (!parsed.success) {
                  const next: Record<string, string> = {};
                  for (const issue of parsed.error.issues) {
                    const key = String(issue.path[0] ?? "");
                    if (key && !next[key]) next[key] = issue.message;
                  }
                  setFieldErrors(next);
                  return;
                }

                setSubmitting(true);
                try {
                  const res = await fetch("/api/leads", {
                    method: "POST",
                    headers: { "content-type": "application/json" },
                    body: JSON.stringify(parsed.data),
                  });

                  const json = (await res.json()) as { ok: boolean; message?: string };
                  if (!res.ok || !json.ok) {
                    setError(json.message || "Something went wrong. Please try again.");
                    return;
                  }

                  setSubmitted(true);
                  setValues({
                    first_name: "",
                    last_name: "",
                    email: "",
                    revenue: "",
                    message: "",
                    company: "",
                  });
                } catch {
                  setError("Network error. Please try again.");
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              <div className="form-shell">
                <div className="form-copy">
                  {label ? <div className="label-tag">{label}</div> : null}
                  <h2 className="form-title">{content.application.heading}</h2>
                  <p className="form-subcopy">{content.application.subcopy}</p>
                </div>

                <div className="form-fields">
                  {error ? (
                    <div className="form-alert" role="alert">
                      {error}
                    </div>
                  ) : null}

                  <fieldset className="form-section" aria-label="Your details">
                    <legend className="form-section-title">Your details</legend>
                    <div className="form-row">
                      <div className="form-group">
                        <label>{content.application.fields.firstNameLabel}</label>
                        <input
                          value={values.first_name}
                          onChange={(e) => setValues((v) => ({ ...v, first_name: e.target.value }))}
                          autoComplete="given-name"
                          placeholder={content.application.fields.firstNamePlaceholder || ""}
                          aria-invalid={Boolean(fieldErrors.first_name)}
                          aria-describedby={fieldErrors.first_name ? "cf-first-name-error" : undefined}
                        />
                        {fieldErrors.first_name ? (
                          <div className="form-note form-error" id="cf-first-name-error">
                            {fieldErrors.first_name}
                          </div>
                        ) : null}
                      </div>

                      <div className="form-group">
                        <label>{content.application.fields.lastNameLabel}</label>
                        <input
                          value={values.last_name}
                          onChange={(e) => setValues((v) => ({ ...v, last_name: e.target.value }))}
                          autoComplete="family-name"
                          placeholder={content.application.fields.lastNamePlaceholder || ""}
                          aria-invalid={Boolean(fieldErrors.last_name)}
                          aria-describedby={fieldErrors.last_name ? "cf-last-name-error" : undefined}
                        />
                        {fieldErrors.last_name ? (
                          <div className="form-note form-error" id="cf-last-name-error">
                            {fieldErrors.last_name}
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="form-group">
                      <label>{content.application.fields.emailLabel}</label>
                      <input
                        value={values.email}
                        onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
                        placeholder={content.application.fields.emailPlaceholder || ""}
                        autoComplete="email"
                        aria-invalid={Boolean(fieldErrors.email)}
                        aria-describedby={fieldErrors.email ? "cf-email-error" : undefined}
                      />
                      {fieldErrors.email ? (
                        <div className="form-note form-error" id="cf-email-error">
                          {fieldErrors.email}
                        </div>
                      ) : null}
                    </div>
                  </fieldset>

                  <fieldset className="form-section" aria-label="Your business">
                    <legend className="form-section-title">Your business</legend>
                    <div className="form-group">
                      <label>{content.application.fields.revenueLabel}</label>
                      <select
                        value={values.revenue || ""}
                        onChange={(e) => setValues((v) => ({ ...v, revenue: e.target.value }))}
                        aria-invalid={Boolean(fieldErrors.revenue)}
                        aria-describedby={fieldErrors.revenue ? "cf-revenue-error" : undefined}
                      >
                        <option value="" disabled>
                          {content.application.fields.revenuePlaceholder || "Select..."}
                        </option>
                        {content.application.fields.revenueOptions.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                      {fieldErrors.revenue ? (
                        <div className="form-note form-error" id="cf-revenue-error">
                          {fieldErrors.revenue}
                        </div>
                      ) : null}
                    </div>

                    <div className="form-group">
                      <label>{content.application.fields.bottleneckLabel}</label>
                      <textarea
                        value={values.message || ""}
                        onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
                        placeholder={content.application.fields.bottleneckPlaceholder}
                      />
                    </div>
                  </fieldset>

                  <div className="form-actions">
                    <button type="submit" className="btn-primary form-submit" disabled={submitting}>
                      {submitting ? "Submitting..." : content.application.submitText}
                      <span className="arrow">→</span>
                    </button>
                    <div className="form-trust" aria-label="What happens next">
                      <div className="form-trust-title">What happens next</div>
                      <p className="form-note">{footnote}</p>
                    </div>
                  </div>
                </div>
              </div>

              <input
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                name="company"
                value={values.company || ""}
                onChange={(e) => setValues((v) => ({ ...v, company: e.target.value }))}
              />

            </form>
          </div>

          <div className="form-success" id="form-success" style={{ display: submitted ? "block" : "none" }}>
            <div className="gold-line" style={{ display: "block", margin: "0 auto 20px" }} />
            <h3>{content.application.successTitle}</h3>
            <p>{content.application.successBody}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

