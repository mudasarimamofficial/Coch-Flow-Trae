"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { HomepageContent } from "@/content/homepage";

type Props = {
  content: HomepageContent;
};

type LandingSectionBg = {
  selector: string;
  type: "none" | "image" | "video";
  url: string | null;
};

type LandingPayload = {
  header: {
    brandText: string;
    nav: { label: string; href: string }[];
    primaryCta: { text: string; href: string };
  };
  hero: {
    badgeText: string;
    headingPrefix: string;
    headingHighlight: string;
    subcopyHtml: string;
    primaryCta: { text: string; href: string };
    secondaryCta: { text: string; href: string };
    note: string;
    trustItems: string[];
  };
  workflow: {
    tag: string;
    heading: string;
    subcopy: string;
    steps: { title: string; copy: string }[];
  };
  pricing: {
    heading: string;
    subcopy: string;
    tiers: {
      name: string;
      tagline: string;
      price: string;
      bullets: string[];
      ctaText: string;
      ctaHref: string;
    }[];
  };
  application: {
    heading: string;
    subcopy: string;
    fields: {
      firstNameLabel: string;
      lastNameLabel: string;
      emailLabel: string;
      revenueLabel: string;
      bottleneckLabel: string;
      revenueOptions: { label: string; value: string }[];
    };
    submitText: string;
    successTitle: string;
    successBody: string;
  };
  footer: {
    brandText: string;
    links: { label: string; href: string }[];
    copyright: string;
  };
  backgrounds: LandingSectionBg[];
};

function safeJsonForInlineScript(value: unknown) {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

function resolveBackgrounds(content: HomepageContent): LandingSectionBg[] {
  const sections = (content.page?.sections as any[]) || [];
  const byType = new Map<string, any>();
  for (const s of sections) {
    if (!s || typeof s !== "object") continue;
    if (typeof s.type !== "string") continue;
    byType.set(s.type, s.settings || null);
  }

  const pick = (type: string): { type: "none" | "image" | "video"; url: string | null } => {
    const settings = byType.get(type) as any;
    const backgroundType = String(settings?.backgroundType || "none");
    if (backgroundType === "image") {
      const u = String(settings?.backgroundImage?.url || "").trim();
      return { type: "image", url: u || null };
    }
    if (backgroundType === "video") {
      const u = String(settings?.backgroundVideo?.url || "").trim();
      return { type: "video", url: u || null };
    }
    return { type: "none", url: null };
  };

  const hero = pick("hero");
  const features = pick("features");
  const workflow = pick("workflow");
  const testimonials = pick("testimonials");
  const pricing = pick("pricing");
  const auditBridge = pick("audit_bridge");
  const application = pick("application");
  const footer = pick("footer");

  const resolveApply = application.type !== "none" ? application : auditBridge;

  return [
    { selector: ".hero", ...hero },
    { selector: "#promise", ...features },
    { selector: "#how", ...workflow },
    { selector: "#honest", ...testimonials },
    { selector: "#pricing", ...pricing },
    { selector: "#apply", ...resolveApply },
    { selector: "footer", ...footer },
  ];
}

function buildPayload(content: HomepageContent): LandingPayload {
  const getSectionLabel = (type: string, fallback: string) => {
    const sections = (content.page?.sections as any[]) || [];
    const s = sections.find((sec) => sec && typeof sec === "object" && String(sec.type) === type);
    const label = String((s as any)?.settings?.label || "").trim();
    return label || fallback;
  };

  const trustItems =
    Array.isArray((content.hero as any)?.trust?.pills) && (content.hero as any).trust.pills.length
      ? ((content.hero as any).trust.pills as string[])
      : [
          "Fit-first — we turn away wrong clients",
          "Human outreach — no bots, no spam",
          "Brand-safe — your reputation is protected",
          "Weekly optimisation — the system improves every month",
          "No lock-in contracts",
        ];

  const workflowSteps = Array.isArray(content.workflow?.steps) ? content.workflow.steps : [];
  const pricingTiers = Array.isArray(content.pricing?.tiers) ? content.pricing.tiers : [];
  const navItems = Array.isArray(content.header?.nav) ? content.header.nav : [];

  return {
    header: {
      brandText: String(content.header?.brandText || "CoachFlow AI"),
      nav: navItems.map((i) => ({ label: String((i as any)?.label || ""), href: String((i as any)?.href || "#") })),
      primaryCta: {
        text: String(content.header?.primaryCta?.text || "Apply Now"),
        href: String(content.header?.primaryCta?.href || "#apply"),
      },
    },
    hero: {
      badgeText: String(content.hero?.badge?.text || "Client Acquisition For Masculinity Coaches"),
      headingPrefix: String(content.hero?.heading?.prefix || "Stop Guessing."),
      headingHighlight: String(content.hero?.heading?.highlight || "Closing."),
      subcopyHtml: String(content.hero?.subcopy || ""),
      primaryCta: {
        text: String(content.hero?.primaryCta?.text || "Apply for Partnership"),
        href: String(content.hero?.primaryCta?.href || "#apply"),
      },
      secondaryCta: {
        text: String(content.hero?.secondaryCta?.text || "See How It Works"),
        href: String(content.hero?.secondaryCta?.href || "#how"),
      },
      note: String(content.hero?.note || "Applications reviewed personally. No automated responses."),
      trustItems: trustItems.map((t) => String(t)),
    },
    workflow: {
      tag: getSectionLabel("workflow", "The Framework"),
      heading: String(content.workflow?.heading || "How We Fill Your Calendar"),
      subcopy: String(content.workflow?.subcopy || ""),
      steps: workflowSteps.map((s: any) => ({ title: String(s?.title || ""), copy: String(s?.copy || "") })),
    },
    pricing: {
      heading: String(content.pricing?.heading || "Pricing"),
      subcopy: String(content.pricing?.subcopy || ""),
      tiers: pricingTiers.map((t: any) => ({
        name: String(t?.name || ""),
        tagline: String(t?.tagline || ""),
        price: String(t?.price || ""),
        bullets: Array.isArray(t?.bullets) ? t.bullets.map((b: any) => String(b)) : [],
        ctaText: String(t?.ctaText || "Apply"),
        ctaHref: String(t?.ctaHref || "#apply"),
      })),
    },
    application: {
      heading: String(content.application?.heading || "Let's build your system"),
      subcopy: String(content.application?.subcopy || ""),
      fields: {
        firstNameLabel: String(content.application?.fields?.firstNameLabel || "First name"),
        lastNameLabel: String(content.application?.fields?.lastNameLabel || "Last name"),
        emailLabel: String(content.application?.fields?.emailLabel || "Email address"),
        revenueLabel: String(content.application?.fields?.revenueLabel || "Current monthly revenue"),
        bottleneckLabel: String(content.application?.fields?.bottleneckLabel || "What is your biggest bottleneck right now?"),
        revenueOptions: Array.isArray(content.application?.fields?.revenueOptions)
          ? content.application.fields.revenueOptions.map((o: any) => ({ label: String(o?.label || o?.value || ""), value: String(o?.value || "") }))
          : [],
      },
      submitText: String(content.application?.submitText || "Submit Application"),
      successTitle: String(content.application?.successTitle || "Application received."),
      successBody: String(content.application?.successBody || ""),
    },
    footer: {
      brandText: String(content.footer?.brandText || content.header?.brandText || "CoachFlow AI"),
      links: Array.isArray(content.footer?.links)
        ? content.footer.links.map((l: any) => ({ label: String(l?.label || ""), href: String(l?.href || "#") }))
        : [],
      copyright: String(content.footer?.copyright || ""),
    },
    backgrounds: resolveBackgrounds(content),
  };
}

function buildDynamicCss(payload: LandingPayload) {
  const rules: string[] = [];
  for (const bg of payload.backgrounds) {
    if (!bg.url || bg.type !== "image") continue;
    rules.push(
      `${bg.selector}{background-image:url('${bg.url.replaceAll("'", "\\'")}') !important;background-size:cover !important;background-position:center !important;background-repeat:no-repeat !important}`,
    );
  }
  return rules.join("\n");
}

function buildSrcDoc(templateHtml: string, payload: LandingPayload) {
  const css = buildDynamicCss(payload);
  const payloadJson = safeJsonForInlineScript(payload);

  const bootstrapScript = `
(function(){
  var ORIGIN = (function(){try{return window.location.origin}catch(e){return ''}})();
  function $(sel){return document.querySelector(sel);}
  function setText(sel, text){var el=$(sel); if(!el) return; el.textContent=String(text||'');}
  function setHtml(sel, html){var el=$(sel); if(!el) return; el.innerHTML=String(html||'');}
  function ensureList(sel){var el=$(sel); if(!el) return null; while(el.firstChild) el.removeChild(el.firstChild); return el;}
  function applyNav(data){
    setText('.nav-logo', data.header.brandText);
    var nav=ensureList('.nav-links');
    if(nav){
      for(var i=0;i<(data.header.nav||[]).length;i++){
        var item=data.header.nav[i];
        var li=document.createElement('li');
        var a=document.createElement('a');
        a.href=item.href||'#';
        a.textContent=item.label||'';
        li.appendChild(a);
        nav.appendChild(li);
      }
      var cta=document.createElement('li');
      var ctaA=document.createElement('a');
      ctaA.href=data.header.primaryCta.href||'#apply';
      ctaA.className='nav-cta';
      ctaA.textContent=data.header.primaryCta.text||'Apply Now';
      cta.appendChild(ctaA);
      nav.appendChild(cta);
    }
    var mob=ensureList('#mobile-menu');
    if(mob){
      for(var j=0;j<(data.header.nav||[]).length;j++){
        var mi=data.header.nav[j];
        var ma=document.createElement('a');
        ma.href=mi.href||'#';
        ma.setAttribute('onclick','closeMenu()');
        ma.textContent=mi.label||'';
        mob.appendChild(ma);
      }
      var mcta=document.createElement('a');
      mcta.href=data.header.primaryCta.href||'#apply';
      mcta.className='mob-cta';
      mcta.setAttribute('onclick','closeMenu()');
      mcta.textContent=data.header.primaryCta.text||'Apply Now';
      mob.appendChild(mcta);
    }
  }
  function applyHero(data){
    setText('.hero-tag', data.hero.badgeText);
    setHtml('.hero h1', String(data.hero.headingPrefix||'') + '<br>Start <em>' + String(data.hero.headingHighlight||'') + '</em>');
    (function(){
      var sub = String(data.hero.subcopyHtml||'');
      if(!sub){ return; }
      if(sub.indexOf('<') >= 0){
        setHtml('.hero-sub', sub);
        return;
      }
      var parts = sub.split('. ');
      if(parts.length >= 2){
        var first = parts.shift();
        var rest = parts.join('. ');
        setHtml('.hero-sub', String(first) + '. <strong>' + String(rest) + '</strong>');
      } else {
        setText('.hero-sub', sub);
      }
    })();
    var a1=$('.hero-actions .btn-primary');
    if(a1){ a1.textContent=String(data.hero.primaryCta.text||''); a1.href=data.hero.primaryCta.href||'#apply'; }
    var a2=$('.hero-actions .btn-ghost');
    if(a2){ a2.textContent=String(data.hero.secondaryCta.text||''); a2.href=data.hero.secondaryCta.href||'#how'; }
    setText('.hero-note', data.hero.note);
    var strip=ensureList('.trust-strip');
    if(strip){
      for(var i=0;i<(data.hero.trustItems||[]).length;i++){
        var d=document.createElement('div');
        d.className='trust-item';
        d.textContent=String(data.hero.trustItems[i]||'');
        strip.appendChild(d);
      }
    }
  }
  function applyWorkflow(data){
    setText('#how .section-tag', data.workflow.tag);
    setText('#how .section-title', data.workflow.heading);
    setText('#how .section-body', data.workflow.subcopy);
    var steps=$('#how .steps');
    if(steps){
      var items=data.workflow.steps||[];
      var children=steps.querySelectorAll('.step');
      for(var i=0;i<children.length;i++){
        var t=items[i]||{};
        var title=children[i].querySelector('.step-title');
        var body=children[i].querySelector('.step-body');
        if(title) title.textContent=String(t.title||'');
        if(body) body.textContent=String(t.copy||'');
      }
    }
  }
  function applyPricing(data){
    var header = document.querySelector('#pricing .founding-header');
    if(header){
      var tag = header.querySelector('.section-tag');
      var title = header.querySelector('.section-title');
      if(tag) tag.textContent = 'Partnership Tiers';
      if(title) title.textContent = String(data.pricing.heading||'');
    }
    var note = document.querySelector('#pricing .founding-header p');
    if(note && data.pricing.subcopy) note.textContent = String(data.pricing.subcopy);
    var cards = document.querySelectorAll('#pricing .tier');
    var tiers = data.pricing.tiers || [];
    for(var i=0;i<cards.length;i++){
      var t = tiers[i];
      if(!t) continue;
      var card = cards[i];
      var name = card.querySelector('.tier-name');
      var desc = card.querySelector('.tier-desc');
      var priceNum = card.querySelector('.tier-price-num');
      if(name) name.textContent = String(t.name||'');
      if(desc) desc.textContent = String(t.tagline||'');
      if(priceNum) priceNum.textContent = String(t.price||'');
      var ul = card.querySelector('.tier-features');
      if(ul){
        while(ul.firstChild) ul.removeChild(ul.firstChild);
        var bullets = t.bullets || [];
        for(var j=0;j<bullets.length;j++){
          var li = document.createElement('li');
          li.textContent = String(bullets[j]||'');
          ul.appendChild(li);
        }
      }
      var cta = card.querySelector('a.tier-cta');
      if(cta){
        cta.textContent = String(t.ctaText||'');
        cta.href = t.ctaHref || '#apply';
      }
    }
  }
  function applyApplication(data){
    setText('#apply .section-tag', 'Apply');
    setText('#apply .section-title', data.application.heading);
    setText('#apply .section-body', data.application.subcopy);
    setText('#apply label[for="fname"]', data.application.fields.firstNameLabel);
    setText('#apply label[for="lname"]', data.application.fields.lastNameLabel);
    setText('#apply label[for="email"]', data.application.fields.emailLabel);
    setText('#apply label[for="revenue"]', data.application.fields.revenueLabel);
    setText('#apply label[for="bottleneck"]', data.application.fields.bottleneckLabel);
    var sel=document.getElementById('revenue');
    if(sel){
      while(sel.firstChild) sel.removeChild(sel.firstChild);
      var o0=document.createElement('option');
      o0.value='';
      o0.textContent='Select your range';
      sel.appendChild(o0);
      var opts=data.application.fields.revenueOptions||[];
      for(var i=0;i<opts.length;i++){
        var o=document.createElement('option');
        o.value=String(opts[i].value||'');
        o.textContent=String(opts[i].label||opts[i].value||'');
        sel.appendChild(o);
      }
    }
    var btn=document.querySelector('.form-submit');
    if(btn) btn.textContent=String(data.application.submitText||'Submit Application');
    setText('#form-success h3', data.application.successTitle);
    setText('#form-success p', data.application.successBody);
  }
  function applyFooter(data){
    setText('footer .footer-logo', data.footer.brandText);
    var list = document.querySelector('footer .footer-links');
    if(list){
      while(list.firstChild) list.removeChild(list.firstChild);
      var items=data.footer.links||[];
      for(var i=0;i<items.length;i++){
        var li=document.createElement('li');
        var a=document.createElement('a');
        a.href=items[i].href||'#';
        a.textContent=items[i].label||'';
        li.appendChild(a);
        list.appendChild(li);
      }
    }
    setText('footer .footer-copy', data.footer.copyright);
  }
  function applyBackgroundCss(data){
    var css='';
    for(var i=0;i<(data.backgrounds||[]).length;i++){
      var bg=data.backgrounds[i];
      if(bg.type!=='image' || !bg.url) continue;
      css += bg.selector + "{background-image:url('" + String(bg.url).replace(/'/g,"\\'") + "') !important;background-size:cover !important;background-position:center !important;background-repeat:no-repeat !important}" + "\n";
    }
    var style=document.getElementById('cf-dynamic-bg');
    if(style) style.textContent = css;
  }
  function postHeight(){
    try{
      var h=Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
      if(window.parent && window.parent!==window) window.parent.postMessage({type:'coachflow_landing_height', height:h}, ORIGIN || '*');
    }catch(e){}
  }
  function applyAll(data){
    try{applyNav(data);}catch(e){}
    try{applyHero(data);}catch(e){}
    try{applyWorkflow(data);}catch(e){}
    try{applyPricing(data);}catch(e){}
    try{applyApplication(data);}catch(e){}
    try{applyFooter(data);}catch(e){}
    try{applyBackgroundCss(data);}catch(e){}
    try{postHeight();}catch(e){}
  }

  window.__CF_LANDING_DATA__ = ${payloadJson};

  window.addEventListener('message', function(e){
    try{
      if(ORIGIN && e.origin !== ORIGIN) return;
    }catch(_e){}
    var d=e && e.data;
    if(!d || d.type!=='coachflow_landing_update') return;
    if(!d.payload) return;
    window.__CF_LANDING_DATA__ = d.payload;
    applyAll(d.payload);
  });

  try{
    if('ResizeObserver' in window){
      new ResizeObserver(function(){postHeight();}).observe(document.documentElement);
    }
  }catch(e){}

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', function(){applyAll(window.__CF_LANDING_DATA__); postHeight();});
  } else {
    applyAll(window.__CF_LANDING_DATA__);
    postHeight();
  }
})();
`;

  let out = templateHtml;
  out = out.replace(
    "</head>",
    `<style id="cf-dynamic-bg">${css}</style></head>`,
  );
  out = out.replace("</body>", `<script>${bootstrapScript}</script></body>`);
  return out;
}

export function LandingHtmlV1({ content }: Props) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [height, setHeight] = useState<number>(1200);
  const [templateHtml, setTemplateHtml] = useState<string>("");

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.origin !== window.location.origin) return;
      const data = e.data as any;
      if (!data || data.type !== "coachflow_landing_height") return;
      const h = Number(data.height);
      if (!Number.isFinite(h) || h <= 0) return;
      setHeight(Math.min(Math.max(h, 600), 20000));
    }
    window.addEventListener("message", onMessage);
    return () => {
      window.removeEventListener("message", onMessage);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/coachflow-rebuilt-1.html", { cache: "force-cache" });
      if (!res.ok) return;
      const html = await res.text();
      if (cancelled) return;
      setTemplateHtml(html);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const payload = useMemo(() => buildPayload(content), [content]);
  const initialSrcDoc = useMemo(() => {
    if (!templateHtml) return "";
    return buildSrcDoc(templateHtml, payload);
  }, [templateHtml, payload]);

  useEffect(() => {
    const iframe = iframeRef.current;
    const win = iframe?.contentWindow;
    if (!win) return;
    win.postMessage({ type: "coachflow_landing_update", payload }, window.location.origin);
  }, [payload]);

  if (!initialSrcDoc) return null;

  return (
    <iframe
      ref={iframeRef}
      title="CoachFlow Landing"
      sandbox="allow-scripts allow-forms allow-same-origin"
      srcDoc={initialSrcDoc}
      style={{ width: "100%", height, border: 0, display: "block" }}
    />
  );
}

