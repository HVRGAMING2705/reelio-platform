import { useEffect, useState } from "react";
import {
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Home from "./pages/Home.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import { clearSession, getSessionUser } from "./demoStore";

function ReelioLogo({ onClick }) {
  return (
    <Link to="/" className="brand" onClick={onClick}>
      <span className="brand-icon">▶</span>
      <span>REELIO</span>
    </Link>
  );
}

function ScrollManager() {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== "/") {
      window.scrollTo({ top: 0, behavior: "instant" });
      return;
    }
    if (location.hash) {
      const timer = window.setTimeout(() => {
        document
          .querySelector(location.hash)
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
      return () => window.clearTimeout(timer);
    }
    window.scrollTo({ top: 0, behavior: "instant" });
    return undefined;
  }, [location.pathname, location.hash]);

  return null;
}

function BootFallback({ onRetry, onContinue }) {
  return (
    <main className="boot-screen">
      <div className="boot-card glass-panel">
        <ReelioLogo />
        <span className="boot-kicker">Startup took too long</span>
        <h1>The workspace did not open.</h1>
        <p>
          Reelio could not finish reading the local demo session in time. No
          server call is required for this preview, so you can retry the local
          check or continue to the public site.
        </p>
        <div className="boot-actions">
          <button type="button" className="btn white-btn" onClick={onRetry}>
            Retry local startup
          </button>
          <button type="button" className="btn black-btn" onClick={onContinue}>
            Continue to site
          </button>
        </div>
      </div>
    </main>
  );
}

function NotFound() {
  return (
    <main className="not-found">
      <div className="boot-card glass-panel">
        <span className="boot-kicker">404 · Page not found</span>
        <h1>This reel missed its cue.</h1>
        <p>The page you opened is not part of the Reelio site or demo workspace.</p>
        <div className="boot-actions">
          <Link className="btn white-btn" to="/">Back to home</Link>
          <Link className="btn black-btn" to="/auth">Open demo workspace</Link>
        </div>
      </div>
    </main>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [bootState, setBootState] = useState("loading");
  const [bootAttempt, setBootAttempt] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackTop, setShowBackTop] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let settled = false;

    // Structural boot guard: the demo session is read only from localStorage.
    // There is deliberately no bootstrap fetch in this preview. The 4-second
    // timer guarantees the splash settles into a useful fallback if local
    // storage access itself blocks or throws.
    const fallbackTimer = window.setTimeout(() => {
      if (!settled) setBootState("error");
    }, 4000);

    const settleTimer = window.setTimeout(() => {
      try {
        const sessionUser = getSessionUser();
        settled = true;
        window.clearTimeout(fallbackTimer);
        setUser(sessionUser);
        setBootState("ready");
      } catch {
        settled = true;
        window.clearTimeout(fallbackTimer);
        setBootState("error");
      }
    }, 40);

    return () => {
      settled = true;
      window.clearTimeout(fallbackTimer);
      window.clearTimeout(settleTimer);
    };
  }, [bootAttempt]);

  useEffect(() => {
    function onScroll() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const current = window.scrollY;
      setScrollProgress(max > 0 ? Math.min(1, current / max) : 0);
      setShowBackTop(current > 650);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [location.pathname, bootState]);

  function logout() {
    clearSession();
    setUser(null);
    setMenuOpen(false);
    navigate("/", { replace: true });
  }

  function retryBoot() {
    setBootState("loading");
    setBootAttempt((current) => current + 1);
  }

  function continueWithoutSession() {
    setUser(null);
    setBootState("ready");
  }

  if (bootState === "loading") {
    return (
      <div className="loading" role="status" aria-live="polite">
        <div className="loading-inner">
          <span className="loading-logo">REELIO</span>
          <span className="loading-line"><span></span></span>
          <p>Opening your local demo…</p>
        </div>
      </div>
    );
  }

  if (bootState === "error") {
    return <BootFallback onRetry={retryBoot} onContinue={continueWithoutSession} />;
  }

  const sectionLinks = [
    ["About", "#about"],
    ["Services", "#services"],
    ["Results", "#results"],
    ["Packages", "#packages"],
    ["FAQ", "#faq"],
    ["Contact", "#contact"],
  ];

  return (
    <div className="site">
      <ScrollManager />
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className="scroll-progress" style={{ transform: `scaleX(${scrollProgress})` }}></div>
      <div className="liquid liquid-one"></div>
      <div className="liquid liquid-two"></div>

      <nav className="top-nav" aria-label="Main navigation">
        <ReelioLogo onClick={() => setMenuOpen(false)} />

        <div className="nav-links">
          {sectionLinks.map(([label, hash]) => (
            <Link key={hash} to={{ pathname: "/", hash }}>
              {label}
            </Link>
          ))}
          {user && <Link to="/dashboard">Workspace</Link>}
        </div>

        <div className="nav-actions">
          {user ? (
            <button type="button" className="nav-btn" onClick={logout}>Logout</button>
          ) : (
            <Link to="/auth" className="nav-btn">Login / Register</Link>
          )}
          <button
            type="button"
            className="menu-button"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((current) => !current)}
          >
            {menuOpen ? "×" : "•••"}
          </button>
        </div>

        {menuOpen && (
          <div className="mobile-menu">
            {sectionLinks.map(([label, hash]) => (
              <Link key={hash} to={{ pathname: "/", hash }} onClick={() => setMenuOpen(false)}>
                {label}
              </Link>
            ))}
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setMenuOpen(false)}>Workspace</Link>
                <button type="button" onClick={logout}>Logout</button>
              </>
            ) : (
              <Link to="/auth" onClick={() => setMenuOpen(false)}>Login / Register</Link>
            )}
          </div>
        )}
      </nav>

      <div id="main-content">
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/auth" element={<AuthPage user={user} setUser={setUser} />} />
          <Route path="/login" element={<Navigate to="/auth?mode=login" replace />} />
          <Route path="/register" element={<Navigate to="/auth?mode=register" replace />} />
          <Route
            path="/dashboard"
            element={
              user ? (
                <Dashboard key={user.email} user={user} />
              ) : (
                <Navigate to="/auth?mode=login" replace />
              )
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>

      {showBackTop && (
        <button
          type="button"
          className="back-top"
          aria-label="Back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          ↑
        </button>
      )}
    </div>
  );
}
