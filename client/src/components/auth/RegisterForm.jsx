import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import AuthMessage from "./AuthMessage";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterForm() {
  const { register, loading, error, setError } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setError(null);
  }, [setError]);

  const validate = () => {
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      return "All fields are required";
    }
    if (name.trim().length > 80) {
      return "Name must be 80 characters or fewer";
    }
    if (!EMAIL_PATTERN.test(email.trim())) {
      return "Enter a valid email address";
    }
    if (password.length < 8 || password.length > 128) {
      return "Password must be between 8 and 128 characters";
    }
    if (password !== confirmPassword) {
      return "Passwords do not match";
    }
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
    const res = await register(name, email, password);
    if (res.success) {
      navigate("/login");
    }
  };

  return (
    <form className="hf-form" onSubmit={handleSubmit} noValidate>
      <div className="hf-form-group">
        <label htmlFor="register-name">Full name</label>
        <input
          id="register-name"
          type="text"
          autoComplete="name"
          placeholder="Enter your full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="hf-form-group">
        <label htmlFor="register-email">Email</label>
        <input
          id="register-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="hf-form-group">
        <label htmlFor="register-password">Password</label>
        <input
          id="register-password"
          type="password"
          autoComplete="new-password"
          placeholder="Create a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <div className="hf-form-group">
        <label htmlFor="register-confirm-password">Confirm password</label>
        <input
          id="register-confirm-password"
          type="password"
          autoComplete="new-password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>

      <button
        type="submit"
        className="hf-btn hf-btn-primary hf-auth-submit"
        disabled={loading}
      >
        {loading ? "Creating account..." : "Create account"}
      </button>

      <AuthMessage message={error} type="error" />

      <p className="hf-auth-switch">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </form>
  );
}
