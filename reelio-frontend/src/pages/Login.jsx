import { useState } from "react";
import { login } from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleLogin() {
    const res = await login({ email, password });

    if (res.user) {
      navigate("/dashboard");
    } else {
      alert("Login failed");
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h2>Welcome back</h2>
        <p>Login to access your creative operating system.</p>

        <input className="input" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <input className="input" type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />

        <button className="btn btn-dark full" onClick={handleLogin}>Login</button>

        <p>
          New here? <Link to="/register">Create account</Link>
        </p>
      </div>
    </div>
  );
}