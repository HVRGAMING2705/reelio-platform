import { useState } from "react";
import { login, register } from "../api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth";

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      if (mode === "login") {
        await login({ email, password });
      } else {
        await register({ email, password });
        await login({ email, password });
      }

      await refreshUser();
      navigate("/dashboard");
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card animated-card">
        <div className="auth-toggle">
          <button
            className={mode === "login" ? "active" : ""}
            onClick={() => setMode("login")}
          >
            Login
          </button>

          <button
            className={mode === "register" ? "active" : ""}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        <h2>{mode === "login" ? "Welcome back" : "Create workspace"}</h2>

        <p>
          {mode === "login"
            ? "Access your Reelio creative operating system."
            : "Start your creator workspace and publish your work beautifully."}
        </p>

        <form onSubmit={handleSubmit}>
          <input
            className="input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="btn btn-dark full" type="submit">
            {mode === "login" ? "Login" : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}