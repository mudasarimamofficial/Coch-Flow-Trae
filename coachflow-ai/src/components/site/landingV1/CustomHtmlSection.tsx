"use client";

export function CustomHtmlSection({
  title,
  body,
  html,
}: {
  title?: string;
  body?: string;
  html?: string;
}) {
  return (
    <section>
      {title ? <h2 className="section-title">{title}</h2> : null}
      {body ? <p className="section-body">{body}</p> : null}
      {html ? <div style={{ marginTop: "2rem" }} dangerouslySetInnerHTML={{ __html: html }} /> : null}
    </section>
  );
}

