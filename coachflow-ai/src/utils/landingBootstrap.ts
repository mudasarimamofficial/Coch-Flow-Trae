type AnyContent = any;

const SOCIAL_LIB_SVG: Record<string, string> = {
  instagram:
    '<rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>',
  facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>',
  twitter:
    '<path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>',
  x: '<path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>',
  linkedin:
    '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle>',
  youtube:
    '<path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"></path><path d="m10 15 5-3-5-3z"></path>',
  tiktok: '<circle cx="8" cy="18" r="4"></circle><path d="M12 18V2l7 4"></path>',
  whatsapp: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>',
  telegram:
    '<line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>',
  email: '<rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m2 7 10 6 10-6"></path>',
  website:
    '<circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>',
};

export type LandingDevice = "desktop" | "tablet" | "mobile";

export function attachLandingBootstrap(
  root: HTMLElement,
  content: AnyContent,
  device: LandingDevice = "desktop",
  options?: { scopeDeviceToRoot?: boolean },
): () => void {
  const win = root.ownerDocument?.defaultView;
  if (!win) return () => undefined;

  const cleanupFns: Array<() => void> = [];
  const currentContent: AnyContent = content;

  function q<T extends Element = Element>(sel: string): T | null {
    return root.querySelector<T>(sel);
  }
  function qa<T extends Element = Element>(sel: string): T[] {
    return Array.prototype.slice.call(root.querySelectorAll<T>(sel));
  }
  function setText(el: Element | null, value: unknown) {
    if (!el) return;
    el.textContent = String(value ?? "");
  }
  function setRichText(el: Element | null, raw: unknown) {
    if (!el) return;
    let s = String(raw ?? "");
    s = s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    s = s.replace(/&lt;(\/?)\s*(strong|em)\s*&gt;/gi, "<$1$2>");
    s = s.replace(/&lt;br\s*\/?&gt;/gi, "<br>");
    (el as HTMLElement).innerHTML = s;
  }
  function safeItems(arr: unknown): string[] {
    return Array.isArray(arr) ? arr.map((v) => (typeof v === "string" ? v : "")).filter(Boolean) : [];
  }
  function normalizeAnchorHref(href: unknown): string {
    const h = String(href ?? "").trim();
    if (h === "#lead-form") return "#apply";
    if (h === "#workflow") return "#how";
    if (h === "#features") return "#promise";
    return h;
  }
  function isExternalHref(href: unknown): boolean {
    const h = String(href ?? "").trim();
    return /^https?:\/\//i.test(h) || /^mailto:/i.test(h) || /^tel:/i.test(h);
  }
  function isAbsoluteExternal(href: string): boolean {
    if (/^(mailto:|tel:|sms:)/i.test(href)) return true;
    if (/^https?:\/\//i.test(href)) {
      try {
        const u = new URL(href, win!.location.href);
        return u.origin !== win!.location.origin;
      } catch {
        return true;
      }
    }
    return false;
  }
  function isInternalPath(href: string): boolean {
    if (href.startsWith("/")) return true;
    if (/^https?:\/\//i.test(href)) {
      try {
        const u = new URL(href, win!.location.href);
        return u.origin === win!.location.origin;
      } catch {
        return false;
      }
    }
    return false;
  }
  function openExternal(href: string) {
    try {
      const w = win!.open(href, "_blank", "noopener,noreferrer");
      if (w) {
        try { (w as any).opener = null; } catch {}
      }
    } catch {}
  }
  function sectionByType(c: AnyContent, type: string) {
    const sections = c?.page?.sections;
    if (!Array.isArray(sections)) return null;
    return sections.find((s) => s && s.type === type) || null;
  }
  function sectionBg(section: any) {
    const settings = section?.settings || {};
    const background = settings?.background || {};
    const mobileBackground = settings?.mobileBackground || {};
    return {
      type: typeof settings.backgroundType === "string" ? settings.backgroundType : "",
      image: typeof settings.backgroundImage === "string" ? settings.backgroundImage : (typeof background.url === "string" ? background.url : ""),
      mobileImage: typeof settings.mobileBackgroundImage === "string" ? settings.mobileBackgroundImage : (typeof mobileBackground.url === "string" ? mobileBackground.url : ""),
      overlay: typeof settings.overlayColor === "string" ? settings.overlayColor : "",
      color: typeof settings.backgroundColor === "string" ? settings.backgroundColor : (typeof settings.backgroundColorHex === "string" ? settings.backgroundColorHex : ""),
    };
  }
  function shouldUseMobileBg(): boolean {
    const scopedDevice = root.dataset.cfPreviewDevice;
    if (scopedDevice === "mobile") return true;
    if (scopedDevice === "desktop" || scopedDevice === "tablet") return false;
    if (root.ownerDocument?.documentElement?.dataset.device === "mobile") return true;
    try { return win!.matchMedia && win!.matchMedia("(max-width: 767px)").matches; } catch { return false; }
  }
  function applyBg(target: HTMLElement | null, cfg: ReturnType<typeof sectionBg>) {
    if (!target) return;
    const desktopImage = cfg.image || "";
    const mobileImage = cfg.mobileImage || "";
    const activeImage = shouldUseMobileBg() && mobileImage ? mobileImage : desktopImage;
    const hasImage = cfg.type === "image" && !!activeImage;
    target.style.backgroundImage = hasImage ? `url(${activeImage})` : "";
    target.style.backgroundSize = hasImage ? "cover" : "";
    target.style.backgroundPosition = hasImage ? "center" : "";
    target.style.backgroundRepeat = hasImage ? "no-repeat" : "";
    target.style.backgroundColor = cfg.type === "color" && cfg.color ? cfg.color : "";
  }
  function applyOverlay(target: HTMLElement | null, rgba: string) {
    if (!target) return;
    let ov = target.querySelector(":scope > .cf-bg-overlay") as HTMLDivElement | null;
    if (!rgba) {
      if (ov && ov.parentNode) ov.parentNode.removeChild(ov);
      return;
    }
    if (!ov) {
      ov = root.ownerDocument!.createElement("div");
      ov.className = "cf-bg-overlay";
      ov.style.position = "absolute";
      ov.style.inset = "0";
      ov.style.pointerEvents = "none";
      target.insertBefore(ov, target.firstChild || null);
    }
    ov.style.backgroundColor = rgba;
  }
  function applySectionBackgrounds(c: AnyContent) {
    if (!c) return;
    const heroSection = sectionByType(c, "hero");
    const heroCfg = sectionBg(heroSection);
    const heroFallback = c?.hero?.backgroundImage?.url ? String(c.hero.backgroundImage.url) : "";
    const heroMobileFallback = c?.hero?.mobileBackgroundImage?.url ? String(c.hero.mobileBackgroundImage.url) : "";
    if (!heroCfg.image && heroFallback) { heroCfg.image = heroFallback; if (!heroCfg.type) heroCfg.type = "image"; }
    if (!heroCfg.mobileImage && heroMobileFallback) { heroCfg.mobileImage = heroMobileFallback; if (!heroCfg.type) heroCfg.type = "image"; }
    const heroEl = q<HTMLElement>(".hero");
    if (heroEl) {
      if (!heroEl.style.position) heroEl.style.position = "relative";
      applyBg(heroEl, heroCfg);
      applyOverlay(heroEl, heroCfg.overlay);
    }

    const sectionMap: { type: string; selector: string }[] = [
      { type: "founder", selector: "#founder" },
      { type: "promise", selector: "#promise" },
      { type: "how", selector: "#how" },
      { type: "honest", selector: "#honest" },
      { type: "pricing", selector: "#pricing" },
      { type: "application", selector: "#apply" },
    ];
    for (const item of sectionMap) {
      const sec = sectionByType(c, item.type);
      const cfg = sectionBg(sec);
      if (item.type === "pricing" && c?.pricing?.backgroundImage?.url && !cfg.image) {
        cfg.image = String(c.pricing.backgroundImage.url); if (!cfg.type) cfg.type = "image";
      }
      if (item.type === "pricing" && c?.pricing?.mobileBackgroundImage?.url && !cfg.mobileImage) {
        cfg.mobileImage = String(c.pricing.mobileBackgroundImage.url); if (!cfg.type) cfg.type = "image";
      }
      if (item.type === "application" && c?.application?.backgroundImage?.url && !cfg.image) {
        cfg.image = String(c.application.backgroundImage.url); if (!cfg.type) cfg.type = "image";
      }
      if (item.type === "application" && c?.application?.mobileBackgroundImage?.url && !cfg.mobileImage) {
        cfg.mobileImage = String(c.application.mobileBackgroundImage.url); if (!cfg.type) cfg.type = "image";
      }
      const el = q<HTMLElement>(item.selector);
      if (!el) continue;
      if (!el.style.position) el.style.position = "relative";
      applyBg(el, cfg);
      applyOverlay(el, cfg.overlay);
    }
  }
  function applySectionEnabled(pageMap: any) {
    if (!pageMap) return;
    const byType: Record<string, boolean> = {};
    if (Array.isArray(pageMap.sections)) {
      for (const s of pageMap.sections) {
        if (!s || !s.type) continue;
        byType[String(s.type)] = s.enabled !== false;
      }
    }
    const show = (selector: string, enabled: boolean) => {
      const el = q<HTMLElement>(selector);
      if (!el) return;
      el.style.display = enabled ? "" : "none";
    };
    show(".hero", byType.hero !== false);
    show(".trust-strip", byType.trust_strip !== false);
    show("#founder", byType.founder !== false);
    show("#promise", byType.promise !== false);
    show("#how", byType.how !== false);
    show("#honest", byType.honest !== false);
    show("#pricing", byType.pricing !== false);
    show("#apply", byType.application !== false);
    show("footer", byType.footer !== false);
  }

  function socialLabel(item: any): string {
    return String(item?.platform || item?.label || item?.id || "Social").trim();
  }
  function socialHref(item: any): string {
    return String(item?.url || item?.href || "").trim();
  }
  function isValidSocialHref(href: string): boolean {
    const h = href.trim();
    if (!h) return false;
    if (h === "#" || h === "undefined" || h === "null") return false;
    if (/^https?:\/\/$/i.test(h)) return false;
    if (/^mailto:\s*$/i.test(h)) return false;
    if (/^tel:\s*$/i.test(h)) return false;
    return true;
  }
  function formatSocialLabel(raw: string): string {
    const s = String(raw || "").trim();
    if (!s) return "Social";
    if (s.length <= 2) return s.toUpperCase();
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  function libSvgKey(platform: string): string {
    const p = String(platform || "").trim().toLowerCase();
    if (p === "twitter") return "twitter";
    if (SOCIAL_LIB_SVG[p]) return p;
    return "website";
  }
  function safeAttrEscape(s: string): string {
    return String(s || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function buildSocialIconHtml(icon: any, platform: string): string {
    if (icon && typeof icon === "object") {
      const t = String(icon.type || "").toLowerCase();
      if (t === "upload" || t === "image") {
        const url = String(icon.url || icon.value || "").trim();
        if (url) return `<img class="footer-social-icon" src="${safeAttrEscape(url)}" alt="" width="20" height="20" />`;
      } else if (t === "material") {
        const name = String(icon.name || icon.value || "").trim().toLowerCase();
        if (name) return `<span class="footer-social-icon material-symbols-outlined" aria-hidden="true">${safeAttrEscape(name)}</span>`;
      } else if (t === "library") {
        const key = libSvgKey(String(icon.value || platform));
        return `<svg class="footer-social-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${SOCIAL_LIB_SVG[key]}</svg>`;
      }
    }
    const fallbackKey = libSvgKey(platform);
    return `<svg class="footer-social-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${SOCIAL_LIB_SVG[fallbackKey]}</svg>`;
  }
  function renderFooterSocials(c: AnyContent) {
    const rootEl = q<HTMLElement>("footer .footer-socials");
    if (!rootEl) return;
    const footerSection = sectionByType(c, "footer");
    const settings = (footerSection as any)?.settings || {};
    const showSocial = settings.showSocial !== false;
    const v2 = Array.isArray(c?.socialLinksV2) ? c.socialLinksV2 : [];
    const legacy = Array.isArray(c?.socialLinks) ? c.socialLinks : [];
    const items: { label: string; href: string; platform: string; icon: any }[] = [];
    for (const it of v2) {
      const href = socialHref(it);
      if (it?.enabled === false || !isValidSocialHref(href)) continue;
      items.push({ label: formatSocialLabel(socialLabel(it)), href, platform: String(it?.platform || it?.id || "").trim(), icon: it?.icon || null });
    }
    if (!items.length) {
      for (const li of legacy) {
        const lh = socialHref(li);
        if (!isValidSocialHref(lh)) continue;
        items.push({ label: formatSocialLabel(socialLabel(li)), href: lh, platform: String(li?.label || li?.platform || li?.id || "").trim(), icon: li?.icon || null });
      }
    }
    if (!showSocial || !items.length) {
      rootEl.innerHTML = "";
      rootEl.style.display = "none";
      return;
    }
    rootEl.style.display = "flex";
    rootEl.innerHTML = items
      .map((item) => {
        const href = item.href.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const label = item.label.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const attrs = isExternalHref(item.href) ? ' target="_blank" rel="noopener noreferrer"' : "";
        const iconHtml = buildSocialIconHtml(item.icon, item.platform);
        return `<a class="footer-social" href="${href}"${attrs} aria-label="${label}" title="${label}">${iconHtml}<span class="footer-social-sr">${label}</span></a>`;
      })
      .join("");
  }

  let selectedTier = "";
  function setSelectedTier(value: string) {
    selectedTier = String(value || "").trim();
    const input = q<HTMLInputElement>("#selected_tier");
    if (input) input.value = selectedTier;
    const box = q<HTMLElement>("#selected-tier-summary");
    if (box) {
      if (selectedTier) {
        box.style.display = "";
        box.textContent = "Selected tier: " + selectedTier;
      } else {
        box.style.display = "none";
        box.textContent = "";
      }
    }
  }
  function tierFromTrigger(a: Element | null): string {
    if (!a) return "";
    const direct = (a as HTMLElement).getAttribute("data-selected-tier") || "";
    if (direct) return direct;
    const tier = (a as HTMLElement).closest(".tier");
    const name = tier ? tier.querySelector(".tier-name") : null;
    return name ? name.textContent || "" : "";
  }

  function applyContent(c: AnyContent) {
    try {
      if (!c) return;
      const rebuilt = c.rebuilt || {};
      const brandText = c.header?.brandText ? String(c.header.brandText) : "Coachflow Aquisition";
      setText(q(".nav-logo"), brandText);
      setText(q("footer .footer-logo"), c.footer?.brandText || brandText);

      const navItems = Array.isArray(c.header?.nav) ? c.header.nav : [];
      const navCta = c.header?.primaryCta || null;
      const navAnchors = qa<HTMLAnchorElement>("nav .nav-links a");
      if (navAnchors.length >= 4) {
        for (let i = 0; i < 3; i++) {
          const n = navItems[i] || null;
          if (n?.label) setText(navAnchors[i], n.label);
          if (n?.href) navAnchors[i].setAttribute("href", normalizeAnchorHref(n.href));
        }
        if (navCta?.text) setText(navAnchors[3], navCta.text);
        if (navCta?.href) navAnchors[3].setAttribute("href", normalizeAnchorHref(navCta.href));
      }

      const mobileAnchors = qa<HTMLAnchorElement>("#mobile-menu a");
      if (mobileAnchors.length >= 4) {
        for (let j = 0; j < 3; j++) {
          const mn = navItems[j] || null;
          if (mn?.label) setText(mobileAnchors[j], mn.label);
          if (mn?.href) mobileAnchors[j].setAttribute("href", normalizeAnchorHref(mn.href));
        }
        if (navCta?.text) setText(mobileAnchors[3], navCta.text);
        if (navCta?.href) mobileAnchors[3].setAttribute("href", normalizeAnchorHref(navCta.href));
      }

      const hero = rebuilt.hero || {};
      if (hero.tag) setText(q(".hero-tag"), hero.tag);
      if (hero.headlineLine1 || hero.headlineLine2Prefix || hero.headlineHighlight) {
        const h1 = q(".hero h1");
        if (h1) {
          const line1 = String(hero.headlineLine1 || "");
          const line2p = String(hero.headlineLine2Prefix || "");
          const hi = String(hero.headlineHighlight || "");
          setRichText(h1, line1 + "<br>" + line2p + "<em>" + hi + "</em>");
        }
      }
      if (hero.subcopyBeforeStrong || hero.subcopyStrong || hero.subcopyAfterStrong) {
        const p = q(".hero-sub");
        if (p) {
          const pre = String(hero.subcopyBeforeStrong || "");
          const strong = String(hero.subcopyStrong || "");
          const post = String(hero.subcopyAfterStrong || "");
          setRichText(p, pre + "<strong>" + strong + "</strong>" + post);
        }
      }
      if (hero.note) setText(q(".hero-note"), hero.note);

      const heroActions = qa<HTMLAnchorElement>(".hero-actions a");
      if (heroActions.length >= 2) {
        const cta1 = c.hero?.primaryCta || null;
        const cta2 = c.hero?.secondaryCta || null;
        if (cta1) {
          if (cta1.text) setText(heroActions[0], cta1.text);
          if (cta1.href) heroActions[0].setAttribute("href", normalizeAnchorHref(cta1.href));
        }
        if (cta2) {
          if (cta2.text) setText(heroActions[1], cta2.text);
          if (cta2.href) heroActions[1].setAttribute("href", normalizeAnchorHref(cta2.href));
        }
      }

      const trust = rebuilt.trustStrip || {};
      const trustItems = Array.isArray(trust.items) ? trust.items : [];
      const trustEls = qa(".trust-strip .trust-item");
      for (let t = 0; t < trustEls.length; t++) {
        if (trustItems[t]) setText(trustEls[t], trustItems[t]);
      }

      const founder = rebuilt.founder || {};
      if (founder.label) setText(q("#founder .founder-label"), founder.label);
      if (founder.avatarText) setText(q("#founder .founder-avatar"), founder.avatarText);
      if (founder.name) setText(q("#founder .founder-name"), founder.name);
      if (founder.title) setText(q("#founder .founder-title"), founder.title);
      if (founder.quote) setText(q("#founder .founder-quote"), founder.quote);
      const founderPs = qa("#founder .founder-body p");
      const fp = safeItems(founder.paragraphs);
      for (let fi = 0; fi < founderPs.length; fi++) {
        if (fp[fi]) setRichText(founderPs[fi], fp[fi]);
      }

      const promise = rebuilt.promise || {};
      if (promise.tag) setText(q("#promise .section-tag"), promise.tag);
      if (promise.heading) setText(q("#promise .section-title"), promise.heading);
      if (promise.subcopy) setText(q("#promise .section-body"), promise.subcopy);
      const cardEls = qa("#promise .promise-card");
      const promiseCards = Array.isArray(promise.cards) ? promise.cards : [];
      for (let ci = 0; ci < cardEls.length; ci++) {
        const cc = promiseCards[ci] || null;
        if (!cc) continue;
        setText(cardEls[ci].querySelector(".promise-title"), cc.title);
        setText(cardEls[ci].querySelector(".promise-body"), cc.body);
      }

      const how = rebuilt.how || {};
      if (how.tag) setText(q("#how .section-tag"), how.tag);
      if (how.heading) setText(q("#how .section-title"), how.heading);
      if (how.subcopy) setText(q("#how .section-body"), how.subcopy);
      const stepEls = qa("#how .step");
      const steps = Array.isArray(how.steps) ? how.steps : [];
      for (let si = 0; si < stepEls.length; si++) {
        const st = steps[si] || null;
        if (!st) continue;
        setText(stepEls[si].querySelector(".step-title"), st.title);
        setText(stepEls[si].querySelector(".step-body"), st.body);
      }

      const honest = rebuilt.honest || {};
      if (honest.tag) setText(q("#honest .section-tag"), honest.tag);
      if (honest.quote) setText(q("#honest .honest-quote"), honest.quote);
      const honestPs = qa("#honest .honest-body p");
      const hp = safeItems(honest.paragraphs);
      for (let hi = 0; hi < honestPs.length; hi++) {
        if (hp[hi]) setRichText(honestPs[hi], hp[hi]);
      }
      if (honest.pledgeTitle) setText(q("#honest .honest-pledge-title"), honest.pledgeTitle);
      const pledgeItems = safeItems(honest.pledgeItems);
      const pledgeEls = qa("#honest .honest-pledge-items li");
      for (let pi = 0; pi < pledgeEls.length; pi++) {
        if (pledgeItems[pi]) setText(pledgeEls[pi], pledgeItems[pi]);
      }

      const pricing = c.pricing || {};
      if (pricing.tag) setText(q("#pricing .founding-header .section-tag"), pricing.tag);
      if (pricing.heading) setText(q("#pricing .founding-header .section-title"), pricing.heading);
      if (pricing.subcopy) setText(q("#pricing .founding-header p"), pricing.subcopy);
      if (pricing.note) setText(q("#pricing .founding-note"), pricing.note);

      const tiers = Array.isArray(pricing.tiers) ? pricing.tiers : [];
      const tierEls = qa<HTMLElement>("#pricing .tier");
      for (let ti = 0; ti < tierEls.length; ti++) {
        const tr = tiers[ti] || null;
        if (!tr) continue;
        const badge = tierEls[ti].querySelector(".tier-badge");
        if (badge) {
          if (tr.highlight?.badge) setText(badge, tr.highlight.badge);
          if (tr.badge) setText(badge, tr.badge);
        }
        if (tr.highlight) tierEls[ti].classList.add("featured");
        else tierEls[ti].classList.remove("featured");
        setText(tierEls[ti].querySelector(".tier-name"), tr.name);
        setText(tierEls[ti].querySelector(".tier-desc"), tr.tagline);
        const priceNum = tierEls[ti].querySelector(".tier-price-num");
        if (priceNum) setText(priceNum, tr.price);
        const priceWas = tierEls[ti].querySelector(".tier-price-was");
        if (priceWas && tr.priceWas) setText(priceWas, tr.priceWas);
        const priceMo = tierEls[ti].querySelector(".tier-price-mo");
        if (priceMo) setText(priceMo, tr.priceSuffix || "");
        const cta = tierEls[ti].querySelector("a.tier-cta") as HTMLAnchorElement | null;
        if (cta) {
          if (tr.ctaText) setText(cta, tr.ctaText);
          cta.setAttribute("href", normalizeAnchorHref(tr.ctaHref || "#apply"));
          cta.setAttribute("data-selected-tier", String(tr.name || ""));
        }
        tierEls[ti].setAttribute("data-tier", String(tr.name || ""));
        const bulletEls = qa<HTMLElement>(`#pricing .tier:nth-of-type(${ti + 1}) .tier-features li`);
        const bullets = Array.isArray(tr.bullets) ? tr.bullets : [];
        for (let bi = 0; bi < bulletEls.length; bi++) {
          if (typeof bullets[bi] === "string" && bullets[bi]) setText(bulletEls[bi], bullets[bi]);
        }
      }

      const app = c.application || {};
      if (app.headingTag) setText(q("#apply .form-left .section-tag"), app.headingTag);
      if (app.heading) {
        const applyH = q("#apply .form-left .section-title");
        if (applyH) setRichText(applyH, String(app.heading).split("\n").join("<br>"));
      }
      if (app.subcopy) setText(q("#apply .form-left .section-body"), app.subcopy);
      if (Array.isArray(app.promiseItems)) {
        const piEls = qa("#apply .form-promise-item");
        for (let api = 0; api < piEls.length; api++) {
          const it = app.promiseItems[api] || null;
          if (!it) continue;
          const strongEl = piEls[api].querySelector("strong");
          const spanEl = piEls[api].querySelector("span");
          if (strongEl) setText(strongEl, it.title);
          if (spanEl) setText(spanEl, it.body);
        }
      }
      if (app.formTitle) setText(q("#apply .form-title"), app.formTitle);
      if (app.formSubtitle) setText(q("#apply .form-subtitle"), app.formSubtitle);

      const fields = app.fields || {};
      if (fields.firstNameLabel) setText(q('label[for="fname"]'), fields.firstNameLabel);
      if (fields.lastNameLabel) setText(q('label[for="lname"]'), fields.lastNameLabel);
      if (fields.emailLabel) setText(q('label[for="email"]'), fields.emailLabel);
      if (fields.revenueLabel) setText(q('label[for="revenue"]'), fields.revenueLabel);
      if (fields.bottleneckLabel) setText(q('label[for="bottleneck"]'), fields.bottleneckLabel);
      const f = q<HTMLInputElement>("#fname"); if (f && fields.firstNamePlaceholder) f.setAttribute("placeholder", fields.firstNamePlaceholder);
      const l = q<HTMLInputElement>("#lname"); if (l && fields.lastNamePlaceholder) l.setAttribute("placeholder", fields.lastNamePlaceholder);
      const em = q<HTMLInputElement>("#email"); if (em && fields.emailPlaceholder) em.setAttribute("placeholder", fields.emailPlaceholder);
      const b = q<HTMLTextAreaElement>("#bottleneck"); if (b && fields.bottleneckPlaceholder) b.setAttribute("placeholder", fields.bottleneckPlaceholder);

      if (Array.isArray(fields.revenueOptions)) {
        const sel = q<HTMLSelectElement>("#revenue");
        if (sel) {
          const placeholder = String(fields.revenuePlaceholder || "Select your range");
          const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
          const opts: string[] = [`<option value="">${escape(placeholder)}</option>`];
          for (const opt of fields.revenueOptions as any[]) {
            if (!opt) continue;
            const value = String(opt.value || "");
            const label = String(opt.label || "");
            opts.push(`<option value="${escape(value)}">${escape(label)}</option>`);
          }
          sel.innerHTML = opts.join("");
        }
      }

      if (app.submitText) setText(q("#apply .form-submit"), app.submitText);
      if (app.footnote) setText(q("#apply .form-disclaimer"), app.footnote);
      if (app.successTitle) setText(q("#apply #form-success h3"), app.successTitle);
      if (app.successBody) setText(q("#apply #form-success p"), app.successBody);

      const footer = c.footer || {};
      const fLinks = qa<HTMLAnchorElement>("footer .footer-links li");
      const renderableLinks = Array.isArray(footer.links)
        ? (footer.links as any[]).filter((link) => {
            if (!link || typeof link !== "object") return false;
            const href = String(link.href || "").trim();
            if (!href) return false;
            return true;
          })
        : [];
      for (let fl = 0; fl < fLinks.length; fl++) {
        const li = fLinks[fl];
        const a = li.querySelector("a") as HTMLAnchorElement | null;
        const link = renderableLinks[fl] || null;
        if (!a) continue;
        if (!link) {
          li.style.display = "none";
          continue;
        }
        li.style.display = "";
        if (link.label) setText(a, link.label);
        a.setAttribute("href", normalizeAnchorHref(link.href));
        if (isExternalHref(link.href)) {
          a.setAttribute("target", "_blank");
          a.setAttribute("rel", "noopener noreferrer");
        } else {
          a.removeAttribute("target");
          a.removeAttribute("rel");
        }
      }
      const footerLinksWrap = q<HTMLElement>("footer .footer-links");
      if (footerLinksWrap) footerLinksWrap.style.display = renderableLinks.length ? "" : "none";
      if (footer.copyright) setText(q("footer .footer-copy"), footer.copyright);

      renderFooterSocials(c);
      applySectionEnabled(c.page || {});
      applySectionBackgrounds(c);
    } catch {
      // ignore mutation errors
    }
  }

  function onClick(e: MouseEvent) {
    const target = e.target as Element | null;
    const a = target?.closest ? (target.closest("a") as HTMLAnchorElement | null) : null;
    if (!a) return;
    if (!root.contains(a)) return;
    if (a.classList?.contains("tier-cta")) setSelectedTier(tierFromTrigger(a));
    const href = a.getAttribute("href") || "";
    if (href && href.charAt(0) === "#") {
      const targetEl = root.querySelector(href);
      if (targetEl) {
        e.preventDefault();
        closeMenu();
        (targetEl as HTMLElement).scrollIntoView({ behavior: "smooth", block: "start" });
        try { win!.history.pushState(null, "", href); } catch {}
        try { if (win!.location.hash !== href) win!.location.hash = href; } catch {}
      }
      return;
    }
    if (href && isAbsoluteExternal(href)) {
      if (e.defaultPrevented) return;
      if (e.button !== undefined && e.button !== 0) return;
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      openExternal(href);
      return;
    }
    if (href && isInternalPath(href)) {
      // let the browser handle internal navigation natively
      return;
    }
  }

  function closeMenu() {
    const menu = q<HTMLElement>("#mobile-menu");
    const btn = q<HTMLElement>("#hamburger");
    if (menu) menu.classList.remove("open");
    if (btn) btn.classList.remove("open");
  }
  function toggleMenu() {
    const menu = q<HTMLElement>("#mobile-menu");
    const btn = q<HTMLElement>("#hamburger");
    if (menu) menu.classList.toggle("open");
    if (btn) btn.classList.toggle("open");
  }
  function onHamburgerClick(e: Event) {
    e.preventDefault();
    toggleMenu();
  }
  const hamburger = q<HTMLElement>("#hamburger");
  if (hamburger) {
    hamburger.addEventListener("click", onHamburgerClick);
    cleanupFns.push(() => hamburger.removeEventListener("click", onHamburgerClick));
  }

  function onSubmit(e?: Event) {
    if (e) e.preventDefault();
    try {
      const fname = (q<HTMLInputElement>("#fname")?.value || "").trim();
      const lname = (q<HTMLInputElement>("#lname")?.value || "").trim();
      const email = (q<HTMLInputElement>("#email")?.value || "").trim();
      const revenue = (q<HTMLSelectElement>("#revenue")?.value || "").trim();
      const message = (q<HTMLTextAreaElement>("#bottleneck")?.value || "").trim();
      const tierInput = q<HTMLInputElement>("#selected_tier");
      const selectedTierValue = selectedTier || (tierInput?.value || "");

      if (!fname || !email) {
        win!.alert("Please fill in your name and email to apply.");
        return;
      }

      const btn = q<HTMLButtonElement>(".form-submit");
      if (btn) { btn.disabled = true; btn.textContent = "Submitting…"; }
      win!.fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          first_name: fname,
          last_name: lname,
          email,
          revenue: revenue || null,
          message: message || null,
          selected_tier: selectedTierValue || null,
        }),
      })
        .then((r) => {
          if (!r.ok) throw new Error("lead_submit_failed");
          return r.json();
        })
        .then(() => {
          const fc = q<HTMLElement>("#form-content");
          const fs = q<HTMLElement>("#form-success");
          if (fc) fc.style.display = "none";
          if (fs) fs.style.display = "block";
        })
        .catch(() => {
          win!.alert("Something went wrong. Please try again.");
        })
        .finally(() => {
          if (btn) { btn.disabled = false; btn.textContent = "Submit Application →"; }
        });
    } catch {
      win!.alert("Something went wrong. Please try again.");
    }
  }
  const submitBtn = q<HTMLButtonElement>(".form-submit");
  if (submitBtn) {
    submitBtn.addEventListener("click", onSubmit);
    cleanupFns.push(() => submitBtn.removeEventListener("click", onSubmit));
  }

  function onResize() {
    try { applySectionBackgrounds(currentContent); } catch {}
  }
  win.addEventListener("click", onClick, true);
  win.addEventListener("resize", onResize);
  cleanupFns.push(() => win.removeEventListener("click", onClick, true));
  cleanupFns.push(() => win.removeEventListener("resize", onResize));

  if (options?.scopeDeviceToRoot) {
    try { root.dataset.cfPreviewDevice = device; } catch {}
  } else if (root.ownerDocument?.documentElement) {
    try { root.ownerDocument.documentElement.dataset.device = device; } catch {}
  }

  applyContent(currentContent);

  return () => {
    for (const fn of cleanupFns.splice(0, cleanupFns.length)) {
      try { fn(); } catch {}
    }
  };
}
