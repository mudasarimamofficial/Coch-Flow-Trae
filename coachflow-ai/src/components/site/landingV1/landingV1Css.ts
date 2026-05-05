export const landingV1Css = String.raw`*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --black: #0A0A0A;
  --white: #F5F2ED;
  --gold: #C9A84C;
  --gold-light: #E8D5A3;
  --gold-dim: #8A6F32;
  --charcoal: #1A1A1A;
  --mid: #2E2E2E;
  --muted: #6B6B6B;
  --border: rgba(201,168,76,0.2);
  --border-subtle: rgba(255,255,255,0.06);
  --font-body: 'DM Sans', sans-serif;
  --font-heading: 'Bebas Neue', sans-serif;
  --font-serif: 'DM Serif Display', serif;
}

html { scroll-behavior: smooth; }

body {
  background: var(--black);
  color: var(--white);
  font-family: var(--font-body);
  font-size: 17px;
  line-height: 1.7;
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

nav {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 4rem;
  background: rgba(10,10,10,0.9);
  backdrop-filter: blur(12px);
  border-bottom: 0.5px solid var(--border-subtle);
}

.nav-logo {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  letter-spacing: 0.1em;
  color: var(--gold);
  text-decoration: none;
}

.nav-logo-img { height: 24px; width: auto; display: block; }

.nav-links {
  display: flex;
  gap: 2.5rem;
  list-style: none;
}

.nav-links a {
  color: rgba(245,242,237,0.6);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 400;
  letter-spacing: 0.05em;
  transition: color 0.2s;
}

.nav-links a:hover { color: var(--white); }

.nav-cta {
  background: var(--gold);
  color: var(--black) !important;
  padding: 0.5rem 1.25rem;
  border-radius: 2px;
  font-weight: 500;
  font-size: 0.875rem;
  letter-spacing: 0.05em;
  transition: background 0.2s !important;
}

.nav-cta:hover { background: var(--gold-light) !important; color: var(--black) !important; }

.hero {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 8rem 4rem 5rem;
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: -20%;
  right: -10%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(201,168,76,0.07) 0%, transparent 70%);
  pointer-events: none;
}

.hero-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 2rem;
}

.hero-tag::before {
  content: '';
  display: block;
  width: 24px;
  height: 1px;
  background: var(--gold);
}

.hero h1 {
  font-family: var(--font-heading);
  font-size: clamp(4rem, 8vw, 7.5rem);
  line-height: 0.95;
  letter-spacing: 0.02em;
  color: var(--white);
  max-width: 900px;
  margin-bottom: 1rem;
}

.hero h1 em {
  font-style: normal;
  color: var(--gold);
}

.hero-sub {
  font-size: 1.2rem;
  color: rgba(245,242,237,0.65);
  max-width: 560px;
  margin-bottom: 3rem;
  font-weight: 300;
  line-height: 1.6;
}

.hero-sub strong {
  color: var(--white);
  font-weight: 500;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
}

.btn-primary {
  display: inline-block;
  background: var(--gold);
  color: var(--black);
  padding: 0.9rem 2rem;
  font-family: var(--font-body);
  font-size: 0.9rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
  border-radius: 2px;
  transition: background 0.2s, transform 0.15s;
}

.btn-primary:hover { background: var(--gold-light); transform: translateY(-1px); }

.btn-ghost {
  display: inline-block;
  color: rgba(245,242,237,0.6);
  padding: 0.9rem 2rem;
  font-size: 0.9rem;
  font-weight: 400;
  text-decoration: none;
  border: 0.5px solid rgba(255,255,255,0.15);
  border-radius: 2px;
  transition: color 0.2s, border-color 0.2s;
}

.btn-ghost:hover { color: var(--white); border-color: rgba(255,255,255,0.35); }

.hero-note {
  margin-top: 2rem;
  font-size: 0.8rem;
  color: var(--muted);
  letter-spacing: 0.03em;
}

.divider {
  height: 0.5px;
  background: var(--border-subtle);
  margin: 0 4rem;
}

.founder {
  padding: 6rem 4rem;
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 6rem;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.founder-label {
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: 1.5rem;
}

.founder-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--mid);
  border: 2px solid var(--gold);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 2rem;
  color: var(--gold);
  margin-bottom: 1.5rem;
}

.founder-name {
  font-family: var(--font-serif);
  font-size: 1.6rem;
  color: var(--white);
  margin-bottom: 0.25rem;
}

.founder-title {
  font-size: 0.85rem;
  color: var(--muted);
  letter-spacing: 0.05em;
  margin-bottom: 2rem;
}

.founder-quote {
  font-family: var(--font-serif);
  font-size: 1.5rem;
  line-height: 1.4;
  color: var(--white);
  margin-bottom: 2rem;
  font-style: italic;
}

.founder-body {
  color: rgba(245,242,237,0.65);
  line-height: 1.8;
  font-size: 1rem;
  font-weight: 300;
}

.founder-body p + p { margin-top: 1rem; }
.founder-body strong { color: var(--white); font-weight: 500; }

.trust-strip {
  background: var(--charcoal);
  border-top: 0.5px solid var(--border-subtle);
  border-bottom: 0.5px solid var(--border-subtle);
  padding: 2rem 4rem;
  display: flex;
  gap: 3rem;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}

.trust-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.85rem;
  color: rgba(245,242,237,0.5);
  letter-spacing: 0.03em;
}

.trust-item::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--gold);
  flex-shrink: 0;
}

section { padding: 7rem 4rem; max-width: 1200px; margin: 0 auto; }
.section-tag { font-size: 0.7rem; font-weight: 500; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold); margin-bottom: 1.25rem; }
.section-title { font-family: var(--font-heading); font-size: clamp(2.5rem, 4vw, 3.5rem); letter-spacing: 0.03em; line-height: 1; color: var(--white); margin-bottom: 1rem; }
.section-body { color: rgba(245,242,237,0.55); max-width: 520px; font-weight: 300; font-size: 1rem; }

.cta-grid { display: grid; grid-template-columns: 1.3fr 0.7fr; gap: 2rem; align-items: start; }

.promise-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: var(--border-subtle); border: 0.5px solid var(--border-subtle); margin-top: 4rem; }
.promise-card { background: var(--black); padding: 2.5rem; transition: background 0.2s; }
.promise-card:hover { background: var(--charcoal); }
.promise-num { font-family: var(--font-heading); font-size: 3.5rem; line-height: 1; margin-bottom: 1rem; color: rgba(201,168,76,0.15); }
.promise-title { font-size: 1rem; font-weight: 500; color: var(--white); margin-bottom: 0.75rem; letter-spacing: 0.02em; }
.promise-body { font-size: 0.9rem; color: rgba(245,242,237,0.5); font-weight: 300; line-height: 1.7; }

.steps { margin-top: 4rem; display: flex; flex-direction: column; gap: 0; }
.step { display: grid; grid-template-columns: 60px 1fr; gap: 2rem; padding: 2.5rem 0; border-bottom: 0.5px solid var(--border-subtle); align-items: start; }
.step:last-child { border-bottom: none; }
.step-num { font-family: var(--font-heading); font-size: 1rem; color: var(--gold); letter-spacing: 0.1em; padding-top: 0.2rem; }
.step-title { font-size: 1.05rem; font-weight: 500; color: var(--white); margin-bottom: 0.5rem; }
.step-body { font-size: 0.9rem; color: rgba(245,242,237,0.5); font-weight: 300; line-height: 1.7; }

.honest { background: var(--charcoal); border-top: 0.5px solid var(--border-subtle); border-bottom: 0.5px solid var(--border-subtle); padding: 6rem 4rem; }
.honest-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 6rem; align-items: start; }
.honest-quote { font-family: var(--font-serif); font-size: 1.8rem; line-height: 1.4; color: var(--white); font-style: italic; padding-left: 1.5rem; border-left: 2px solid var(--gold); }
.honest-body { color: rgba(245,242,237,0.6); font-weight: 300; line-height: 1.8; font-size: 1rem; }
.honest-body p + p { margin-top: 1rem; }
.honest-body strong { color: var(--white); font-weight: 500; }
.honest-pledge { margin-top: 2rem; padding: 1.5rem; border: 0.5px solid var(--border); border-radius: 2px; }
.honest-pledge-title { font-size: 0.75rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--gold); margin-bottom: 0.75rem; }
.honest-pledge-items { list-style: none; display: flex; flex-direction: column; gap: 0.5rem; }
.honest-pledge-items li { font-size: 0.9rem; color: rgba(245,242,237,0.6); display: flex; align-items: center; gap: 0.75rem; }
.honest-pledge-items li::before { content: '→'; color: var(--gold); font-size: 0.8rem; }

.founding { padding: 7rem 4rem; max-width: 1200px; margin: 0 auto; }
.founding-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 3rem; flex-wrap: wrap; gap: 2rem; }
.tiers { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--border-subtle); border: 0.5px solid var(--border-subtle); }
.tier { background: var(--black); padding: 2.5rem; position: relative; display: flex; flex-direction: column; }
.tier.featured { background: var(--charcoal); border: 1px solid var(--gold); margin: -1px; z-index: 1; }
.tier-badge { display: inline-block; font-size: 0.65rem; font-weight: 500; letter-spacing: 0.15em; text-transform: uppercase; color: var(--black); background: var(--gold); padding: 0.25rem 0.75rem; margin-bottom: 1.5rem; align-self: flex-start; border-radius: 1px; }
.tier-name { font-family: var(--font-heading); font-size: 1.75rem; letter-spacing: 0.05em; color: var(--white); margin-bottom: 0.5rem; }
.tier-desc { font-size: 0.85rem; color: var(--muted); font-weight: 300; margin-bottom: 1.5rem; line-height: 1.5; }
.tier-price { margin-bottom: 2rem; }
.tier-price-num { font-family: var(--font-heading); font-size: 3rem; color: var(--white); letter-spacing: 0.02em; line-height: 1; }
.tier-price-was { font-size: 0.8rem; color: var(--muted); text-decoration: line-through; margin-left: 0.5rem; }
.tier-price-mo { font-size: 0.8rem; color: var(--muted); margin-top: 0.25rem; }
.tier-features { list-style: none; display: flex; flex-direction: column; gap: 0.6rem; flex: 1; margin-bottom: 2rem; }
.tier-features li { font-size: 0.875rem; color: rgba(245,242,237,0.6); display: flex; gap: 0.6rem; align-items: flex-start; }
.tier-features li::before { content: '–'; color: var(--gold); flex-shrink: 0; }
.tier-cta { display: block; text-align: center; padding: 0.85rem; font-size: 0.85rem; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; text-decoration: none; border-radius: 2px; transition: all 0.2s; }
.tier-cta-outline { border: 0.5px solid rgba(255,255,255,0.2); color: rgba(245,242,237,0.7); }
.tier-cta-outline:hover { border-color: var(--gold); color: var(--gold); }
.tier-cta-solid { background: var(--gold); color: var(--black); }
.tier-cta-solid:hover { background: var(--gold-light); }
.founding-note { margin-top: 2rem; font-size: 0.8rem; color: var(--muted); text-align: center; letter-spacing: 0.03em; }

.form-section { background: var(--charcoal); border-top: 0.5px solid var(--border-subtle); padding: 7rem 4rem; }
.form-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1.1fr; gap: 6rem; align-items: start; }
.form-promise { margin-top: 3rem; display: flex; flex-direction: column; gap: 1.5rem; }
.form-promise-item { display: flex; gap: 1rem; align-items: flex-start; }
.form-promise-icon { width: 32px; height: 32px; border: 0.5px solid var(--border); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: var(--gold); font-size: 0.75rem; margin-top: 0.1rem; }
.form-promise-text strong { display: block; font-size: 0.9rem; font-weight: 500; color: var(--white); margin-bottom: 0.2rem; }
.form-promise-text span { font-size: 0.85rem; color: var(--muted); font-weight: 300; }
.form-right { background: var(--black); border: 0.5px solid var(--border); padding: 2.5rem; border-radius: 2px; }
.form-title { font-family: var(--font-heading); font-size: 1.75rem; letter-spacing: 0.05em; color: var(--white); margin-bottom: 0.5rem; }
.form-subtitle { font-size: 0.875rem; color: var(--muted); font-weight: 300; margin-bottom: 2rem; }
.form-group { margin-bottom: 1.25rem; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem; }
label { display: block; font-size: 0.78rem; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(245,242,237,0.4); margin-bottom: 0.5rem; }
input[type="text"], input[type="email"], select, textarea { width: 100%; background: var(--charcoal); border: 0.5px solid rgba(255,255,255,0.1); color: var(--white); font-family: var(--font-body); font-size: 0.9rem; padding: 0.8rem 1rem; border-radius: 2px; outline: none; transition: border-color 0.2s; -webkit-appearance: none; }
input:focus, select:focus, textarea:focus { border-color: var(--gold); }
select option { background: var(--charcoal); }
textarea { resize: vertical; min-height: 100px; }
.form-submit { width: 100%; background: var(--gold); color: var(--black); font-family: var(--font-body); font-size: 0.9rem; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; padding: 1rem; border: none; border-radius: 2px; cursor: pointer; margin-top: 0.5rem; transition: background 0.2s; }
.form-submit:hover { background: var(--gold-light); }
.form-submit:disabled { opacity: 0.7; cursor: not-allowed; }
.form-disclaimer { font-size: 0.75rem; color: var(--muted); text-align: center; margin-top: 1rem; line-height: 1.5; }
.form-success { display: none; text-align: center; padding: 3rem 1rem; }
.form-success.open { display: block; }
.form-success-icon { width: 48px; height: 48px; border: 1px solid var(--gold); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; color: var(--gold); font-size: 1.2rem; }
.form-success h3 { font-family: var(--font-heading); font-size: 1.75rem; letter-spacing: 0.05em; color: var(--white); margin-bottom: 0.75rem; }
.form-success p { font-size: 0.9rem; color: var(--muted); font-weight: 300; }

footer { background: var(--black); border-top: 0.5px solid var(--border-subtle); padding: 2.5rem 4rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
.footer-logo { font-family: var(--font-heading); font-size: 1.2rem; letter-spacing: 0.1em; color: var(--gold); }
.footer-logo-img { height: 22px; width: auto; display: block; }
.footer-links { display: flex; gap: 2rem; list-style: none; }
.footer-links a { font-size: 0.8rem; color: var(--muted); text-decoration: none; transition: color 0.2s; }
.footer-links a:hover { color: var(--white); }
.footer-copy { font-size: 0.78rem; color: var(--muted); }

@keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.hero-tag, .hero h1, .hero-sub, .hero-actions, .hero-note { opacity: 0; animation: fadeUp 0.7s ease forwards; }
.hero-tag { animation-delay: 0.1s; }
.hero h1 { animation-delay: 0.25s; }
.hero-sub { animation-delay: 0.4s; }
.hero-actions { animation-delay: 0.55s; }
.hero-note { animation-delay: 0.7s; }

.nav-hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; padding: 4px; background: none; border: none; }
.nav-hamburger span { display: block; width: 22px; height: 1.5px; background: var(--white); transition: all 0.3s; }
.nav-hamburger.open span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
.nav-hamburger.open span:nth-child(2) { opacity: 0; }
.nav-hamburger.open span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

.mobile-menu { display: none; position: fixed; top: 60px; left: 0; right: 0; background: rgba(10,10,10,0.98); backdrop-filter: blur(16px); border-bottom: 0.5px solid var(--border-subtle); padding: 1.5rem 1.5rem 2rem; z-index: 99; flex-direction: column; gap: 0; }
.mobile-menu.open { display: flex; }
.mobile-menu a { color: rgba(245,242,237,0.7); text-decoration: none; font-size: 1rem; padding: 0.9rem 0; border-bottom: 0.5px solid var(--border-subtle); letter-spacing: 0.03em; transition: color 0.2s; }
.mobile-menu a:last-child { border-bottom: none; }
.mobile-menu a:hover { color: var(--white); }
.mobile-menu .mob-cta { margin-top: 1.25rem; background: var(--gold); color: var(--black); text-align: center; padding: 0.9rem; font-weight: 500; font-size: 0.875rem; letter-spacing: 0.08em; text-transform: uppercase; border-radius: 2px; border: none; }

@media (max-width: 768px) {
  nav { padding: 1rem 1.5rem; }
  .nav-links { display: none; }
  .nav-hamburger { display: flex; }
  .hero { padding: 7rem 1.5rem 4rem; min-height: 90vh; }
  .hero h1 { font-size: clamp(3rem, 14vw, 4.5rem); }
  .hero-sub { font-size: 1rem; margin-bottom: 2rem; }
  .hero-actions { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
  .btn-primary, .btn-ghost { width: 100%; text-align: center; }
  .divider { margin: 0 1.5rem; }
  .founder { grid-template-columns: 1fr; gap: 2.5rem; padding: 4rem 1.5rem; }
  .founder-quote { font-size: 1.2rem; }
  .trust-strip { padding: 1.5rem; gap: 1rem; justify-content: flex-start; flex-direction: column; align-items: flex-start; }
  section { padding: 4rem 1.5rem; }
  .promise-grid { grid-template-columns: 1fr; }
  .promise-card { padding: 1.75rem 1.5rem; }
  .step { grid-template-columns: 50px 1fr; gap: 1rem; padding: 2rem 0; }
  .honest { padding: 4rem 1.5rem; }
  .honest-inner { grid-template-columns: 1fr; gap: 2.5rem; }
  .honest-quote { font-size: 1.25rem; }
  .founding { padding: 4rem 1.5rem; }
  .founding-header { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
  .founding-header p { text-align: left; max-width: 100%; }
  .tiers { grid-template-columns: 1fr; }
  .tier.featured { margin: 0; border: 1px solid var(--gold); }
  .tier { padding: 2rem 1.5rem; }
  .form-section { padding: 4rem 1.5rem; }
  .form-inner { grid-template-columns: 1fr; gap: 3rem; }
  .form-row { grid-template-columns: 1fr; }
  .form-right { padding: 1.75rem 1.25rem; }
  footer { flex-direction: column; text-align: center; padding: 2rem 1.5rem; gap: 1.25rem; }
  .footer-links { flex-wrap: wrap; justify-content: center; gap: 1rem; }
  .cta-grid { grid-template-columns: 1fr; }
}

@media (max-width: 480px) {
  .hero h1 { font-size: clamp(2.75rem, 16vw, 3.5rem); }
  .section-title { font-size: clamp(2rem, 10vw, 2.5rem); }
  .promise-num { font-size: 2.5rem; }
  .tier-price-num { font-size: 2.25rem; }
}`;
