import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import {
  DEMO_EMAIL,
  DEMO_PASSWORD,
  loginDemoUser,
  registerDemoUser,
} from "../demoStore";

export default function AuthPage({ user, setUser }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMode = searchParams.get("mode") === "register" ? "register" : "login";
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const heading = useMemo(
    () => (mode === "login" ? "Welcome back" : "Create your workspace"),
    [mode],
  );

  if (user) return <Navigate to="/dashboard" replace />;

  function switchMode(nextMode) {
    setMode(nextMode);
    setErrors({});
    setFormError("");
    setSearchParams({ mode: nextMode }, { replace: true });
  }

  function fillDemoLogin() {
    setMode("login");
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setConfirmPassword("");
    setErrors({});
    setFormError("");
    setSearchParams({ mode: "login" }, { replace: true });
  }

  function validate() {
    const next = {};
    if (mode === "register" && name.trim().length < 2) {
      next.name = "Enter your name so the workspace can personalise itself.";
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      next.email = "Enter a valid email address.";
    }
    if (!password) {
      next.password = "Enter a password.";
    } else if (mode === "register" && password.length < 8) {
      next.password = "Use at least 8 characters for a demo password.";
    }
    if (mode === "register" && password !== confirmPassword) {
      next.confirmPassword = "The two passwords do not match.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");
    if (!validate()) return;

    setSubmitting(true);
    try {
      const nextUser =
        mode === "register"
          ? await registerDemoUser({ name, email, password })
          : await loginDemoUser({ email, password });
      setUser(nextUser);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setFormError(error.message || "The demo sign-in could not be completed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-intro">
        <div className="section-kicker"><span></span>Demo workspace</div>
        <h1>Your content engine, in one place.</h1>
        <p>
          Clients, production, campaigns and next actions — the demo is fully
          populated and every control works locally in your browser.
        </p>
        <div className="auth-feature-list">
          <span>✓ Seeded client workspace</span>
          <span>✓ Content pipeline actions</span>
          <span>✓ Campaign controls</span>
          <span>✓ No server account created</span>
        </div>
      </section>

      <form className="auth-box glass-panel" onSubmit={handleSubmit} noValidate>
        <Link to="/" className="brand auth-brand">
          <span className="brand-icon">▶</span>
          <span>REELIO</span>
        </Link>

        <div className="demo-badge">Local demo · data stays in this browser</div>

        <div className="auth-toggle" role="tablist" aria-label="Choose login or register">
          <button type="button" onClick={() => switchMode("login")} className={mode === "login" ? "active" : ""}>
            Login
          </button>
          <button type="button" onClick={() => switchMode("register")} className={mode === "register" ? "active" : ""}>
            Register
          </button>
        </div>

        <h2>{heading}</h2>
        <p>
          {mode === "login"
            ? "Access the Reelio demo workspace and continue the sprint."
            : "Create a local demo account and open a populated starter workspace."}
        </p>

        {formError && <div className="form-alert" role="alert">{formError}</div>}

        {mode === "register" && (
          <label className="auth-field">
            Your name
            <input
              autoComplete="name"
              placeholder="e.g. Vikranth Reddy"
              value={name}
              onChange={(event) => setName(event.target.value)}
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name && <small className="field-error">{errors.name}</small>}
          </label>
        )}

        <label className="auth-field">
          Email
          <input
            type="email"
            autoComplete="email"
            placeholder="you@brand.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email && <small className="field-error">{errors.email}</small>}
        </label>

        <label className="auth-field">
          Password
          <span className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              autoComplete={mode === "register" ? "new-password" : "current-password"}
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={Boolean(errors.password)}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </span>
          {errors.password && <small className="field-error">{errors.password}</small>}
        </label>

        {mode === "register" && (
          <label className="auth-field">
            Confirm password
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Repeat the password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              aria-invalid={Boolean(errors.confirmPassword)}
            />
            {errors.confirmPassword && <small className="field-error">{errors.confirmPassword}</small>}
          </label>
        )}

        <button className="btn white-btn full" type="submit" disabled={submitting}>
          {submitting ? "Opening workspace…" : mode === "login" ? "Login to workspace" : "Create demo account"}
        </button>

        <div className="demo-login-card">
          <div>
            <strong>Just want to look around?</strong>
            <span>{DEMO_EMAIL}<br />{DEMO_PASSWORD}</span>
          </div>
          <button type="button" className="btn black-btn" onClick={fillDemoLogin}>
            Fill demo login
          </button>
        </div>

        <p className="auth-note">
          Demo only: passwords are hashed before being stored in this browser,
          but this is not a production authentication system.
        </p>
      </form>
    </main>
  );
}
