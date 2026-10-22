import { useEffect, useState } from "react";
import { Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "";
// Demo mode: when no backend URL is configured (e.g. this static Vercel
// preview), the API is unreachable — the app degrades gracefully instead
// of calling a dead endpoint.
const DEMO_MODE = !import.meta.env.VITE_API_URL;

async function api(path, options = {}) {
  if (DEMO_MODE) throw new Error("Live data unavailable in demo");
  const res = await fetch(API + path, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.message || "Request failed");
  return data;
}

function ReelioLogo() {
  return (
    <Link to="/" className="brand">
      <span className="brand-icon">▶</span>
      <span>REELIO</span>
    </Link>
  );
}

function Home({ user }) {
  return (
    <main>
      <section className="hero" id="home">
        <div className="hero-topline">
          <span>PORTFOLIO / 2026</span>
          <span>Instagram Growth • Content • Ads • Outreach</span>
        </div>

        <div className="hero-grid">
          <div className="hero-side-card left-card">
            <div className="photo-placeholder"></div>
          </div>

          <div className="hero-center glass-red">
            <div className="sparkle sparkle-one">✦</div>

            <h1>REELIO</h1>

            <p className="script-text">Social media agency</p>

            <p className="hero-copy">
              We help cafés, restaurants, fashion and lifestyle brands grow on
              Instagram through reels, branding, ads, outreach, and creator-led content.
            </p>

            <div className="hero-actions">
              <a href="#contact" className="btn white-btn">Get Clients</a>

              {user ? (
                <Link to="/dashboard" className="btn black-btn">Workspace</Link>
              ) : (
                <Link to="/auth" className="btn black-btn">Login / Register</Link>
              )}
            </div>
          </div>

          <div className="hero-side-card right-card">
            <div className="photo-placeholder dark"></div>
          </div>
        </div>

        <div className="page-badge">PAGE 1</div>
      </section>

      <section className="section about" id="about">
        <div className="section-label">ABOUT REELIO</div>

        <div className="split">
          <div>
            <h2>Creative growth for brands that need attention.</h2>
          </div>

          <div className="glass-panel">
            <p>
              Reelio is an all-in-one creative and growth social media agency
              focused on helping cafés, restaurants, and lifestyle brands grow on Instagram.
            </p>

            <p>
              We produce platform-ready reels, strong branding, targeted ads,
              proactive outreach, and campaign content aimed at more leads,
              more sales, and measurable growth.
            </p>
          </div>
        </div>
      </section>

      <section className="section" id="services">
        <div className="section-head">
          <h2>Our Services</h2>
          <p>Everything a modern brand needs to look premium and grow fast.</p>
        </div>

        <div className="services-grid">
          {[
            ["Digital Marketing", "META ad setup, audience targeting, scaling, tracking, and weekly optimization."],
            ["Content Creation", "Instagram posts, reels, campaigns, and creative assets built for visibility."],
            ["Outreach & Growth", "Lead generation, influencer outreach, collaborations, and community building."],
            ["Video Editing", "Short-form reels, thumbnails, posters, motion graphics, and digital creatives."],
            ["Photography", "Brand shoots, product visuals, café ambience, lifestyle content, and cinematic videos."],
            ["Models & Creators", "Models and creators for shoots, campaigns, and promotional content."],
          ].map(([title, text]) => (
            <article className="service-card" key={title}>
              <div className="starburst">✹</div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section niches" id="niches">
        <h2>Niches We Serve</h2>

        <div className="niche-grid">
          {["Cafés", "Fashion", "Restaurants", "Startups", "Beauty", "Lifestyle"].map((niche) => (
            <div className="niche-card" key={niche}>
              <span>{niche}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section work" id="work">
        <div className="section-head">
          <h2>Case Studies</h2>
          <p>Proof for brands, campaigns, shoots, and collaborations.</p>
        </div>

        <div className="case-grid">
          <div className="case-card tall">
            <h3>Rithm Cafe</h3>
            <p>Café | Latte Arts Studio</p>
            <p>
              Created viral, high-impact brand videos using professional gear,
              driving strong customer footfall from Day 1.
            </p>
          </div>

          <div className="case-card">
            <h3>Savana</h3>
            <p>Beauty & Fashion</p>
            <p>
              Handled PR through creator collaborations, social buzz, influencer
              partnerships, and content amplification.
            </p>
          </div>

          <div className="case-card">
            <h3>Brand Collaborations</h3>
            <p>
              We connect brands with creators and businesses to increase reach,
              credibility, engagement, and trust.
            </p>
          </div>
        </div>
      </section>

      <section className="section packages" id="packages">
        <div className="section-head">
          <h2>Growth Packages</h2>
          <p>Simple offers that make it easy for new clients to start.</p>
        </div>

        <div className="package-grid">
          <div className="package-card">
            <div className="package-tag">FREE STARTER</div>
            <h3>1-Week Free Instagram Plan</h3>
            <p>
              Includes 1 post, 2 reels, 10–14 stories, highlights,
              profile optimization, and branding boost.
            </p>
            <a href="#contact" className="btn white-btn">Claim Free Plan</a>
          </div>

          <div className="package-card premium">
            <div className="package-tag">MONTHLY</div>
            <h3>₹50,000 / month</h3>
            <p>
              Weekly posts, reels, stories, ads, highlights,
              and consistent brand growth support.
            </p>
            <a href="#contact" className="btn black-btn">Start Monthly Plan</a>
          </div>
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div>
          <h2>Ready to grow your brand on Instagram?</h2>
          <p>Contact Reelio and let’s build your content engine.</p>
        </div>

        <div className="contact-card glass-panel">
          <p><strong>Phone:</strong> +91 93818 94142</p>
          <p><strong>Email:</strong> reelio.team@gmail.com</p>
          <p><strong>Instagram:</strong> @reelio.agency</p>
          <a href="mailto:reelio.team@gmail.com" className="btn white-btn">Contact Reelio</a>
        </div>
      </section>

      <footer className="site-footer">
        <p>© 2026 Reelio · <a href="/legal.html">Privacy · Terms</a></p>
      </footer>
    </main>
  );
}

function Auth({ setUser }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();

    try {
      if (mode === "register") {
        await api("/auth/register", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
      }

      await api("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      const me = await api("/auth/me");
      setUser(me.user);
      navigate("/dashboard");
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-box glass-panel" onSubmit={submit}>
        <ReelioLogo />

        <div className="auth-toggle">
          <button type="button" onClick={() => setMode("login")} className={mode === "login" ? "active" : ""}>
            Login
          </button>

          <button type="button" onClick={() => setMode("register")} className={mode === "register" ? "active" : ""}>
            Register
          </button>
        </div>

        <h2>{mode === "login" ? "Welcome back" : "Create account"}</h2>

        <p>{mode === "login" ? "Access your Reelio workspace." : "Start your agency/client workspace."}</p>

        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />

        <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

        <button className="btn white-btn full" type="submit">
          {mode === "login" ? "Login" : "Create Account"}
        </button>
      </form>
    </main>
  );
}

function DemoAuthNotice() {
  return (
    <main className="auth-page">
      <div className="auth-box glass-panel">
        <ReelioLogo />
        <h2>Demo preview</h2>
        <p>
          Live data unavailable in demo — login and the workspace need the
          Reelio backend, which isn't connected to this static preview.
        </p>
        <Link to="/" className="btn white-btn full">Back to home</Link>
      </div>
    </main>
  );
}

function Dashboard({ user }) {
  const [portfolio, setPortfolio] = useState([]);

  useEffect(() => {
    api("/portfolio")
      .then((res) => setPortfolio(res.portfolio || []))
      .catch(() => {});
  }, []);

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <main className="dashboard">
      <div className="dashboard-head">
        <div>
          <h1>Workspace</h1>
          <p>Welcome, {user.email}</p>
        </div>

        <button className="btn white-btn">Create Campaign</button>
      </div>

      <div className="dash-grid">
        <div className="dash-card">
          <h3>Portfolio</h3>
          <p>{portfolio.length} public items</p>
        </div>

        <div className="dash-card">
          <h3>Projects</h3>
          <p>Manage client work and campaigns.</p>
        </div>

        <div className="dash-card">
          <h3>Account</h3>
          <p>Logged in and secured.</p>
        </div>
      </div>
    </main>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (DEMO_MODE) {
      setChecking(false);
      return;
    }
    api("/auth/me")
      .then((res) => setUser(res.user))
      .catch(() => setUser(null))
      .finally(() => setChecking(false));
  }, []);

  async function logout() {
    await api("/auth/logout", { method: "POST" }).catch(() => {});
    setUser(null);
  }

  if (checking) return <div className="loading">Loading Reelio...</div>;

  return (
    <div className="site">
      <div className="liquid liquid-one"></div>
      <div className="liquid liquid-two"></div>

      <nav className="top-nav">
        <ReelioLogo />

        <div className="nav-links">
          <a href="/#about">About</a>
          <a href="/#services">Services</a>
          <a href="/#work">Work</a>
          <a href="/#packages">Packages</a>
          <a href="/#contact">Contact</a>
          {user && <Link to="/dashboard">Workspace</Link>}
        </div>

        {user ? (
          <button className="nav-btn" onClick={logout}>Logout</button>
        ) : (
          <Link to="/auth" className="nav-btn">Login / Register</Link>
        )}
      </nav>

      <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route path="/auth" element={DEMO_MODE ? <DemoAuthNotice /> : <Auth setUser={setUser} />} />
        <Route path="/dashboard" element={<Dashboard user={user} />} />
      </Routes>
    </div>
  );
}