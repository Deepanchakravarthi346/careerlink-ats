import { useState } from "react";
import { FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import "../css/register.css";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Select from "./ui/Select";

const API_BASE = import.meta.env.VITE_API_URL || API_BASE;

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phonenumber, setPhonenumber] = useState("");
  const [role, setRole] = useState("job_seeker");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showpassword, setShowpassword] = useState(false);
  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    
    setIsLoading(true);
    setError("");
    setSuccess("");

    const user_data = {
      username: username.trim(),
      email: email.trim().toLowerCase(),
      role,
      password,
      phone: phonenumber,
    };

    try {
      const response = await fetch(`${API_BASE}/accounts/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user_data),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || "Registration Successful!");
        setError("");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        if (data.username) setError(data.username[0]);
        else if (data.email) setError(data.email[0]);
        else setError(data.error || "Registration failed. Please try again.");
        setSuccess("");
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Join CareerLink ATS to manage your future</p>
        </div>

        {error && <div className="auth-alert auth-alert-error">{error}</div>}
        {success && <div className="auth-alert auth-alert-success">{success}</div>}

        <form className="auth-form" onSubmit={handleRegister}>
          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            type="text"
            placeholder="Choose a username"
            required
            disabled={isLoading}
          />

          <Input
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Enter your email address"
            required
            disabled={isLoading}
          />

          <Select
            label="Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={isLoading}
            options={[
              { label: 'Job Seeker', value: 'job_seeker' },
              { label: 'Recruiter', value: 'recruiter' }
            ]}
          />

          <div className="ui-input-group">
            <label className="ui-input-label">Password</label>
            <div className="password-wrapper">
              <input
                className="ui-input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showpassword ? "text" : "password"}
                placeholder="Must be at least 8 characters"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowpassword(!showpassword)}
                disabled={isLoading}
              >
                {showpassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <Input
            label="Mobile Number"
            value={phonenumber}
            onChange={(e) => setPhonenumber(e.target.value)}
            type="tel"
            pattern="[0-9]{10}"
            placeholder="10 digit mobile number"
            maxLength="10"
            required
            disabled={isLoading}
          />

          <Button type="submit" variant="primary" disabled={isLoading} style={{ marginTop: "16px", width: "100%", justifyContent: "center" }}>
            {isLoading ? <><FaSpinner className="spinner-icon" /> Registering...</> : "Create Account"}
          </Button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login" className="auth-link">Sign In</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
