import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import AuthMessage from "./AuthMessage";

export default function LoginForm() {
  const { login, loading, error, setError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setError(null);
  }, [setError]);

  const validate = () => {
    if (!email.trim() || !password) return "Email and password are required";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const validationMessage = validate();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }
    const res = await login(email, password);
    if (res.success) {
      navigate("/dashboard");
    }
  };

  return (
    <form className="hf-form" onSubmit={handleSubmit} noValidate>
      <div className="hf-form-group">
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="hf-form-group">
        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <button
        type="submit"
        className="hf-btn hf-btn-primary hf-auth-submit"
        disabled={loading}
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      <AuthMessage message={error} type="error" />

      <p className="hf-auth-switch">
        Don't have an account? <Link to="/register">Create one</Link>
      </p>
    </form>
  );
}
