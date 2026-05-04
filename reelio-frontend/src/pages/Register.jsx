import { useState } from "react";
import { register } from "../api";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleRegister() {
    const res = await register({ email, password });

    if (res.user || res.ok || res.id) {
      navigate("/login");
    } else {
      alert(JSON.stringify(res));
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h2>Create account</h2>
        <p>Launch your Reelio workspace in seconds.</p>

        <input className="input" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <input className="input" type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />

        <button className="btn btn-dark full" onClick={handleRegister}>Create Account</button>

        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}