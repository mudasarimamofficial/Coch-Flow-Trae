const SCOPE_CLASS = "cf-rebuilt-shell";

export type ScopedTemplate = {
  scopeClass: string;
  css: string;
  bodyHtml: string;
};

export function scopeRebuiltTemplate(rawHtml: string): ScopedTemplate {
  const styleBlocks = extractStyleBlocks(rawHtml);
  const bodyHtml = extractBodyInner(rawHtml);
  const css = styleBlocks.map((block) => scopeCss(block, `.${SCOPE_CLASS}`)).join("\n\n");
  return { scopeClass: SCOPE_CLASS, css, bodyHtml };
}

function extractStyleBlocks(html: string): string[] {
  const blocks: string[] = [];
  const re = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(html))) {
    if (match[1]) blocks.push(match[1]);
  }
  return blocks;
}

function extractBodyInner(html: string): string {
  const match = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i);
  return match ? match[1] : html;
}

function scopeCss(css: string, scope: string): string {
  let out = "";
  let i = 0;
  while (i < css.length) {
    while (i < css.length && /\s/.test(css[i])) {
      out += css[i];
      i++;
    }
    if (i >= css.length) break;

    if (css.startsWith("/*", i)) {
      const close = css.indexOf("*/", i + 2);
      if (close === -1) {
        out += css.slice(i);
        break;
      }
      out += css.slice(i, close + 2);
      i = close + 2;
      continue;
    }

    if (css[i] === "@") {
      const semi = findStatementEnd(css, i);
      const brace = findOpenBrace(css, i);
      if (brace === -1 || (semi !== -1 && semi < brace)) {
        out += css.slice(i, semi + 1);
        i = semi + 1;
        continue;
      }
      const atHead = css.slice(i, brace).trim();
      const end = matchBrace(css, brace);
      const body = css.slice(brace + 1, end);
      if (/^@(media|supports|container|layer)\b/i.test(atHead)) {
        out += `${atHead} {\n${scopeCss(body, scope)}\n}`;
      } else {
        out += css.slice(i, end + 1);
      }
      i = end + 1;
      continue;
    }

    const brace = css.indexOf("{", i);
    if (brace === -1) {
      out += css.slice(i);
      break;
    }
    const end = matchBrace(css, brace);
    const selectorList = css.slice(i, brace).trim();
    const ruleBody = css.slice(brace + 1, end);
    const scopedSelectors = selectorList
      .split(",")
      .map((raw) => scopeOneSelector(raw.trim(), scope))
      .filter((s) => s.length)
      .join(", ");
    out += scopedSelectors + " {" + ruleBody + "}";
    i = end + 1;
  }
  return out;
}

function findStatementEnd(css: string, start: number): number {
  let depth = 0;
  for (let i = start; i < css.length; i++) {
    const ch = css[i];
    if (ch === "(") depth++;
    else if (ch === ")") depth = Math.max(0, depth - 1);
    else if (ch === ";" && depth === 0) return i;
    else if (ch === "{" && depth === 0) return -1;
  }
  return css.length - 1;
}

function findOpenBrace(css: string, start: number): number {
  let depth = 0;
  for (let i = start; i < css.length; i++) {
    const ch = css[i];
    if (ch === "(") depth++;
    else if (ch === ")") depth = Math.max(0, depth - 1);
    else if (ch === "{" && depth === 0) return i;
    else if (ch === ";" && depth === 0) return -1;
  }
  return -1;
}

function matchBrace(css: string, open: number): number {
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return css.length - 1;
}

function scopeOneSelector(sel: string, scope: string): string {
  if (!sel) return sel;
  if (sel === ":root" || sel === ":host") return sel;
  if (sel === "html") return scope;
  if (sel === "body") return scope;
  if (sel === "html, body" || sel === "body, html") return scope;
  if (/^from\b/i.test(sel) || /^to\b/i.test(sel) || /^\d+%$/.test(sel)) return sel;
  if (sel.startsWith("@")) return sel;
  if (sel.startsWith(`${scope} `) || sel === scope) return sel;
  return `${scope} ${sel}`;
}
