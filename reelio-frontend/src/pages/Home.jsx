import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { saveEnquiry } from "../demoStore";

const services = [
  {
    title: "Reels & Short-Form Content",
    label: "Create",
    text: "Hooks, scripts, shoots, edits, captions and covers built as one production system — not random posts.",
    points: ["Concept + script", "Shoot direction", "Edit + captions"],
  },
  {
    title: "Brand Identity",
    label: "Look premium",
    text: "Visual direction, profile cleanup, highlight systems and templates that make the brand instantly recognisable.",
    points: ["Profile optimisation", "Highlight covers", "Template system"],
  },
  {
    title: "Meta Advertising",
    label: "Convert",
    text: "Campaign structure, audience testing, creative rotation and weekly optimisation around enquiries and sales.",
    points: ["Offer strategy", "Audience tests", "Weekly reporting"],
  },
  {
    title: "Outreach & Leads",
    label: "Start conversations",
    text: "Local partnerships, DM workflows, collaborations and follow-up systems that turn attention into enquiries.",
    points: ["Partner mapping", "DM scripts", "Follow-up tracker"],
  },
  {
    title: "Creator Collaborations",
    label: "Build trust",
    text: "Creator discovery, shortlisting, briefs, deliverable tracking and amplification for launches and social proof.",
    points: ["Creator shortlist", "Brief + approvals", "Usage planning"],
  },
  {
    title: "Photography & Campaigns",
    label: "Launch",
    text: "Product, food, fashion and lifestyle shoots planned around the calendar, the offer and the channels they must feed.",
    points: ["Shot list", "Models + creators", "Campaign edits"],
  },
];

const processSteps = [
  {
    number: "01",
    title: "Position",
    text: "We audit the profile, audience, competitors and current content. The output is a clear promise: who it is for, why it matters and what to post first.",
  },
  {
    number: "02",
    title: "Produce",
    text: "Concepts become a shoot and editing pipeline. You see the calendar, owners, review points and publishing order before production starts.",
  },
  {
    number: "03",
    title: "Publish",
    text: "Content goes live with captions, covers, stories, creator coordination and campaign support working from the same plan.",
  },
  {
    number: "04",
    title: "Improve",
    text: "We review retention, saves, shares, profile actions and enquiries, then feed the learning into the next content sprint.",
  },
];

const faqs = [
  {
    question: "What happens during the free starter week?",
    answer:
      "Reelio prepares one post, two reels, a story sequence, highlight and profile recommendations, and a branding direction you can judge before committing to a monthly engine.",
  },
  {
    question: "Do you only work with cafes and restaurants?",
    answer:
      "Food brands are a core strength, but the same system is built for fashion, beauty, fitness, startups and lifestyle brands that sell through attention and trust.",
  },
  {
    question: "Can Reelio handle both content and ads?",
    answer:
      "Yes. The monthly engine connects creative production with Meta campaign setup, audience testing and weekly optimisation so the content and media teams are not working in silos.",
  },
  {
    question: "How much input does my team need to give?",
    answer:
      "You approve the positioning, offers and final content. Reelio handles the calendar, production coordination, editing workflow, publishing plan and reporting rhythm.",
  },
  {
    question: "Is the workspace a live client backend?",
    answer:
      "This public site includes a clearly labelled local demo workspace. Demo accounts and data stay in your browser; a production client deployment would connect the same workflows to the private Reelio backend.",
  },
];

function Reveal({ children, className = "" }) {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    if (!("IntersectionObserver" in window)) {
      element.classList.add("is-visible");
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.add("is-visible");
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(element);
    const fallback = window.setTimeout(() => element.classList.add("is-visible"), 1400);
    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  );
}

function SectionHead({ kicker, title, copy, dark = false }) {
  return (
    <Reveal className={`section-head ${dark ? "section-head-dark" : ""}`}>
      <div>
        <div className="section-kicker"><span></span>{kicker}</div>
        <h2>{title}</h2>
      </div>
      {copy && <p>{copy}</p>}
    </Reveal>
  );
}

function ReelMockup() {
  return (
    <div className="reel-phone" aria-label="Illustrated Instagram reel preview">
      <div className="phone-top">
        <span>@rithm.cafe</span>
        <span>•••</span>
      </div>
      <div className="reel-scene">
        <div className="scene-sun"></div>
        <div className="scene-arch"></div>
        <div className="scene-table"></div>
        <div className="scene-cup"><span></span></div>
        <div className="scene-steam steam-one"></div>
        <div className="scene-steam steam-two"></div>
        <div className="play-badge">▶</div>
        <div className="reel-hook">The 7-second<br />first sip.</div>
      </div>
      <div className="reel-actions">
        <span>♥<small>12.4K</small></span>
        <span>◯<small>486</small></span>
        <span>↗<small>Share</small></span>
      </div>
      <div className="reel-caption">
        <strong>Signature pour · Reel 04</strong>
        <span>Hook tested against three opening frames.</span>
      </div>
      <div className="reel-progress"><span></span></div>
    </div>
  );
}

function InsightStack() {
  return (
    <div className="insight-stack" aria-label="Illustrated campaign insight cards">
      <div className="insight-card insight-main">
        <div className="insight-label">Campaign reach rhythm</div>
        <svg viewBox="0 0 300 120" role="img" aria-label="Upward content reach chart">
          <path d="M8 104 C50 92, 66 70, 104 76 S164 42, 202 48 S264 18, 292 12" />
          <path className="chart-area" d="M8 104 C50 92, 66 70, 104 76 S164 42, 202 48 S264 18, 292 12 L292 118 L8 118 Z" />
          <circle cx="104" cy="76" r="5" />
          <circle cx="202" cy="48" r="5" />
          <circle cx="292" cy="12" r="5" />
        </svg>
        <div className="insight-foot"><span>Content</span><strong>Plan → Post → Learn</strong></div>
      </div>
      <div className="insight-card insight-mini">
        <span>Next shoot</span>
        <strong>Friday · 6:30 PM</strong>
        <small>Chef special + customer reaction</small>
      </div>
      <div className="insight-card insight-mini cream-card">
        <span>Creator queue</span>
        <strong>8 briefs ready</strong>
        <small>Shortlist, usage and deadlines tracked</small>
      </div>
    </div>
  );
}

function ContactForm({ initialService }) {
  const [form, setForm] = useState({
    name: "",
    brand: "",
    email: "",
    phone: "",
    service: initialService,
    budget: "₹50,000 / month",
    message: "",
    companyWebsite: "",
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
    setSubmitted(false);
  }

  function submit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (form.name.trim().length < 2) nextErrors.name = "Tell us who we should address.";
    if (form.brand.trim().length < 2) nextErrors.brand = "Add your brand or business name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = "Enter a valid work email.";
    if (form.phone && !/^[+\d][\d\s-]{7,}$/.test(form.phone)) nextErrors.phone = "Enter a valid phone number or leave it blank.";
    if (form.message.trim().length < 12) nextErrors.message = "Give us a little more detail about the goal.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    // Honeypot: a real visitor never sees or completes this field. A filled
    // value receives the same success surface without storing an enquiry.
    if (!form.companyWebsite) {
      saveEnquiry({ ...form, companyWebsite: undefined, submittedAt: new Date().toISOString() });
    }
    setSubmitted(true);
  }

  return (
    <form className="contact-form glass-panel" onSubmit={submit} noValidate>
      <div className="form-heading">
        <span>Start a conversation</span>
        <strong>Tell Reelio what needs to grow.</strong>
      </div>

      <div className="form-grid">
        <label>
          Your name
          <input value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="e.g. Ananya Rao" aria-invalid={Boolean(errors.name)} />
          {errors.name && <small className="field-error">{errors.name}</small>}
        </label>
        <label>
          Brand / business
          <input value={form.brand} onChange={(event) => update("brand", event.target.value)} placeholder="e.g. Casa Verde" aria-invalid={Boolean(errors.brand)} />
          {errors.brand && <small className="field-error">{errors.brand}</small>}
        </label>
        <label>
          Email
          <input type="email" value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="you@brand.com" aria-invalid={Boolean(errors.email)} />
          {errors.email && <small className="field-error">{errors.email}</small>}
        </label>
        <label>
          Phone <span className="optional">optional</span>
          <input value={form.phone} onChange={(event) => update("phone", event.target.value)} placeholder="+91 …" aria-invalid={Boolean(errors.phone)} />
          {errors.phone && <small className="field-error">{errors.phone}</small>}
        </label>
        <label>
          I am interested in
          <select value={form.service} onChange={(event) => update("service", event.target.value)}>
            <option>Free Starter Week</option>
            <option>Monthly Growth Engine</option>
            <option>Reels & Content Production</option>
            <option>Brand Identity</option>
            <option>Meta Advertising</option>
            <option>Creator Collaborations</option>
          </select>
        </label>
        <label>
          Monthly budget
          <select value={form.budget} onChange={(event) => update("budget", event.target.value)}>
            <option>Start with the free week</option>
            <option>Under ₹25,000</option>
            <option>₹25,000–₹50,000</option>
            <option>₹50,000 / month</option>
            <option>Above ₹50,000</option>
          </select>
        </label>
      </div>

      <label className="message-field">
        What should this content achieve?
        <textarea rows="4" value={form.message} onChange={(event) => update("message", event.target.value)} placeholder="More footfall, better launch content, consistent reels, stronger enquiries…" aria-invalid={Boolean(errors.message)} />
        {errors.message && <small className="field-error">{errors.message}</small>}
      </label>

      <label className="honeypot" aria-hidden="true">
        Company website
        <input tabIndex="-1" autoComplete="off" value={form.companyWebsite} onChange={(event) => update("companyWebsite", event.target.value)} />
      </label>

      {submitted && (
        <div className="form-success" role="status">
          <strong>Enquiry saved.</strong>
          <span>Thanks — Reelio has the brief in this browser demo. For an immediate conversation, use the phone or email beside this form.</span>
        </div>
      )}

      <button className="btn white-btn full" type="submit">
        {submitted ? "Send another enquiry" : "Send enquiry"}
      </button>
      <p className="form-note">No spam and no obligation. The form validates locally and stores this demo enquiry only in your browser.</p>
    </form>
  );
}

export default function Home({ user }) {
  const [selectedPackage, setSelectedPackage] = useState("Monthly Growth Engine");

  function choosePackage(name) {
    setSelectedPackage(name);
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main>
      <section className="hero" id="home">
        <div className="hero-topline">
          <span>Reelio · Social Media Agency · 2026</span>
          <span>Reels • Branding • Ads • Outreach • Creators</span>
        </div>

        <div className="hero-grid">
          <Reveal className="hero-visual hero-visual-left">
            <ReelMockup />
          </Reveal>

          <div className="hero-center glass-red">
            <div className="hero-status"><span className="pulse-dot"></span> Now booking new growth sprints</div>
            <div className="sparkle sparkle-one">✦</div>
            <p className="hero-kicker">Instagram growth, produced properly</p>
            <h1>REELIO</h1>
            <p className="script-text">Social media agency</p>
            <p className="hero-copy">
              We help cafés, restaurants, fashion and lifestyle brands turn scattered posting into a complete content engine — strategy, reels, branding, ads, outreach and creator-led campaigns working together.
            </p>
            <div className="hero-actions">
              <a href="#contact" className="btn white-btn">Start a project</a>
              {user ? (
                <Link to="/dashboard" className="btn black-btn">Open workspace</Link>
              ) : (
                <Link to="/auth" className="btn black-btn">Try demo workspace</Link>
              )}
            </div>
            <div className="hero-proof-row">
              <span>Free starter week</span>
              <span>Content + ads together</span>
              <span>Hyderabad-first, remote-ready</span>
            </div>
          </div>

          <Reveal className="hero-visual hero-visual-right">
            <InsightStack />
          </Reveal>
        </div>

        <a className="scroll-cue" href="#about" aria-label="Scroll to About Reelio">
          <span>Explore the agency</span>
          <span className="scroll-arrow">↓</span>
        </a>
      </section>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[0, 1].map((copy) => (
            <span key={copy}>Reels ✦ Branding ✦ Meta Ads ✦ Creator Content ✦ Outreach ✦ Photography ✦ Campaigns ✦ </span>
          ))}
        </div>
      </div>

      <section className="section about" id="about">
        <SectionHead
          kicker="About Reelio"
          title="Creative growth for brands that need attention."
          copy="A complete operating system for Instagram growth — not a folder of disconnected designs."
        />
        <div className="split">
          <Reveal className="about-statement">
            <p className="big-statement">Attention is only useful when it becomes a visit, an enquiry, a booking or a sale.</p>
            <p>
              Reelio connects the work most brands split across freelancers: positioning, content production, design, advertising, outreach, creators and reporting. Every asset has a job, every campaign has a next step, and every week ends with learning that improves the next one.
            </p>
          </Reveal>
          <Reveal className="glass-panel about-panel">
            <h3>What changes when the system is complete?</h3>
            <ul className="check-list">
              <li><span>✓</span> A calendar the whole team can see</li>
              <li><span>✓</span> Hooks and offers planned before the shoot</li>
              <li><span>✓</span> Creative and ads reviewed against the same goal</li>
              <li><span>✓</span> Creators briefed, tracked and amplified properly</li>
              <li><span>✓</span> Clear next actions instead of “post something today”</li>
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="section services-section" id="services">
        <SectionHead
          kicker="Services"
          title="Everything a modern brand needs to grow."
          copy="Choose one capability or plug into the full engine. Each service includes strategy, production ownership and a review rhythm."
        />
        <div className="services-grid">
          {services.map((service, index) => (
            <Reveal key={service.title}>
              <article className="service-card">
                <div className="service-number">0{index + 1}</div>
                <div className="service-label">{service.label}</div>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
                <ul>
                  {service.points.map((point) => <li key={point}>{point}</li>)}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="stats-band" aria-label="Reelio growth engine at a glance">
        {[
          ["06", "connected services", "Creative, media, outreach and creators under one plan"],
          ["07", "days to judge us", "A free starter week with real deliverables"],
          ["04", "steps in every sprint", "Position, produce, publish and improve"],
          ["01", "shared workspace", "Clients, content, campaigns and next actions together"],
        ].map(([value, label, text]) => (
          <div className="stat-item" key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
            <p>{text}</p>
          </div>
        ))}
      </section>

      <section className="section results-section" id="results">
        <SectionHead
          kicker="Results & proof"
          title="Work designed around outcomes."
          copy="Reach matters, but it is not the finish line. Reelio plans for the actions a business can actually feel."
        />
        <div className="case-grid">
          <Reveal>
            <article className="case-card tall">
              <div className="case-visual cafe-visual"><span>▶</span></div>
              <p className="case-type">Cafe · Launch content</p>
              <h3>Rithm Cafe</h3>
              <p>High-impact launch videos and latte-art content designed to make the cafe discoverable, memorable and worth visiting from day one.</p>
              <div className="outcome-row"><span>Footfall intent</span><span>Shareable product rituals</span><span>Opening buzz</span></div>
            </article>
          </Reveal>
          <Reveal>
            <article className="case-card">
              <div className="case-visual beauty-visual"><span>✦</span></div>
              <p className="case-type">Beauty & fashion · Creator PR</p>
              <h3>Savana</h3>
              <p>Creator collaborations, influencer partnerships and content amplification coordinated as one social-proof campaign.</p>
              <div className="outcome-row"><span>Creator trust</span><span>Launch reach</span></div>
            </article>
          </Reveal>
          <Reveal>
            <article className="case-card dark-case">
              <div className="case-visual collab-visual"><span>◎</span></div>
              <p className="case-type">Partnerships · Always-on</p>
              <h3>Brand Collaborations</h3>
              <p>Reelio matches brands with creators and local businesses to increase credibility, engagement and the chance of being remembered.</p>
              <div className="outcome-row"><span>New audiences</span><span>Credibility</span></div>
            </article>
          </Reveal>
        </div>
      </section>

      <section className="section process-section" id="process">
        <SectionHead
          kicker="How it works"
          title="A clear process. No content chaos."
          copy="You always know what is being made, why it matters, when it ships and what happens next."
        />
        <div className="process-grid">
          {processSteps.map((step) => (
            <Reveal key={step.number}>
              <article className="process-card">
                <span>{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section packages" id="packages">
        <SectionHead
          kicker="Packages"
          title="Start free. Scale when it works."
          copy="Transparent starting points with the deliverables and working rhythm written down before you commit."
        />
        <div className="package-grid">
          <Reveal>
            <article className="package-card">
              <div className="package-tag">Free starter · 7 days</div>
              <h3>1-Week Instagram Plan</h3>
              <p className="package-price">₹0 <span>to experience the system</span></p>
              <ul className="package-list">
                <li>1 designed post</li>
                <li>2 edited reels</li>
                <li>10–14 story frames</li>
                <li>Highlight + profile optimisation</li>
                <li>Branding direction and next-step plan</li>
              </ul>
              <button type="button" className="btn white-btn" onClick={() => choosePackage("Free Starter Week")}>Claim free plan</button>
            </article>
          </Reveal>
          <Reveal>
            <article className="package-card premium">
              <div className="package-tag">Monthly growth engine</div>
              <h3>Complete Content System</h3>
              <p className="package-price">₹50,000 <span>/ month</span></p>
              <ul className="package-list">
                <li>Weekly posts, reels and stories</li>
                <li>Shoot + edit production pipeline</li>
                <li>Meta ads setup and optimisation</li>
                <li>Creator and outreach coordination</li>
                <li>Highlights, campaigns and reporting</li>
              </ul>
              <button type="button" className="btn black-btn" onClick={() => choosePackage("Monthly Growth Engine")}>Start monthly plan</button>
            </article>
          </Reveal>
        </div>
        <div className="included-strip">
          <strong>Every package includes:</strong>
          <span>Content calendar</span><span>Approval checkpoints</span><span>Caption + cover direction</span><span>Performance review</span><span>Next-action list</span>
        </div>
      </section>

      <section className="section niches" id="niches">
        <SectionHead kicker="Who we serve" title="Built for brands people experience." />
        <div className="niche-grid">
          {[
            ["Cafés", "Launches, rituals, menus and weekend footfall"],
            ["Restaurants", "Chef stories, specials, reservations and reviews"],
            ["Fashion", "Drops, styling, creators and seasonal campaigns"],
            ["Beauty", "Transformations, education, trust and bookings"],
            ["Fitness", "Trainer authority, trials and member proof"],
            ["Startups", "Launches, explainers, community and credibility"],
          ].map(([niche, text]) => (
            <Reveal key={niche}>
              <div className="niche-card"><span>{niche}</span><p>{text}</p></div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section testimonials-section" id="testimonials">
        <SectionHead
          kicker="Working experience"
          title="What clients need from an agency."
          copy="Representative experience statements, shown without invented personal names."
        />
        <div className="testimonial-grid">
          {[
            ["The calendar finally made content feel planned instead of last-minute. We know what is shooting, what is pending and what goes live next.", "Café owner · Hyderabad"],
            ["The biggest change was connection: the reel, story, creator post and ad all pushed the same offer instead of competing with each other.", "Fashion brand lead · Bengaluru"],
            ["Approvals are faster because the idea, hook and purpose are visible before production starts. Fewer surprises, better finished content.", "Restaurant manager · Hyderabad"],
          ].map(([quote, label]) => (
            <Reveal key={label}>
              <figure className="testimonial-card">
                <div className="quote-mark">“</div>
                <blockquote>{quote}</blockquote>
                <figcaption>{label}</figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
        <p className="small-print">Representative client-style feedback included to illustrate the intended working experience. Individual outcomes vary by offer, market, budget and consistency.</p>
      </section>

      <section className="section faq-section" id="faq">
        <SectionHead kicker="Questions" title="Before we start." />
        <div className="faq-list">
          {faqs.map((faq) => (
            <details key={faq.question} className="faq-item">
              <summary>{faq.question}<span>+</span></summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="contact-section" id="contact">
        <Reveal className="contact-copy">
          <div className="section-kicker"><span></span>Contact Reelio</div>
          <h2>Ready to grow your brand on Instagram?</h2>
          <p>Send the goal, not a perfect brief. Reelio will turn it into a first content plan and a clear next step.</p>
          <div className="contact-methods">
            <a href="tel:+919381894142"><span>Phone</span><strong>+91 93818 94142</strong></a>
            <a href="mailto:reelio.team@gmail.com"><span>Email</span><strong>reelio.team@gmail.com</strong></a>
            <a href="https://www.instagram.com/reelio.agency" target="_blank" rel="noreferrer"><span>Instagram</span><strong>@reelio.agency</strong></a>
          </div>
          <div className="workspace-cta">
            <strong>Want to see the operating system first?</strong>
            <p>The demo workspace contains sample clients, a content pipeline and campaigns you can actually operate locally.</p>
            {user ? <Link className="btn black-btn" to="/dashboard">Open workspace</Link> : <Link className="btn black-btn" to="/auth">Launch demo workspace</Link>}
          </div>
        </Reveal>
        <Reveal>
          <ContactForm key={selectedPackage} initialService={selectedPackage} />
        </Reveal>
      </section>

      <footer className="site-footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="brand"><span className="brand-icon">▶</span><span>REELIO</span></Link>
            <p>A social media agency for brands that need attention — and a system that converts attention into action.</p>
          </div>
          <div>
            <h3>Explore</h3>
            <a href="#about">About</a><a href="#services">Services</a><a href="#results">Results</a><a href="#packages">Packages</a><a href="#faq">FAQ</a>
          </div>
          <div>
            <h3>Services</h3>
            <a href="#services">Reels & Content</a><a href="#services">Branding</a><a href="#services">Meta Ads</a><a href="#services">Outreach</a><a href="#services">Creators</a>
          </div>
          <div>
            <h3>Contact</h3>
            <a href="tel:+919381894142">+91 93818 94142</a>
            <a href="mailto:reelio.team@gmail.com">reelio.team@gmail.com</a>
            <a href="https://www.instagram.com/reelio.agency" target="_blank" rel="noreferrer">@reelio.agency</a>
            <Link to="/auth">Demo workspace</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Reelio · <a href="/legal.html">Privacy · Terms</a></p>
          <p>Last updated · 22 Oct 2026</p>
        </div>
      </footer>
    </main>
  );
}
