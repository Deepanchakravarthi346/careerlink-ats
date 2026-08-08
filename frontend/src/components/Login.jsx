import { useState } from "react";
import { FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import "../css/register.css";
import Button from "./ui/Button";
import Input from "./ui/Input";

const API_BASE = import.meta.env.VITE_API_URL || API_BASE;

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showpassword, setShowpassword] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_BASE}/accounts/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const responseData = await response.json();

      if (response.ok && responseData.refresh) {
        localStorage.setItem("username", responseData.username);
        localStorage.setItem("accessTokens", responseData.access);
        localStorage.setItem("refreshTokens", responseData.refresh);
        localStorage.setItem("role", responseData.role);
        
        setSuccess("Login Successful!");

        if (responseData.role === "recruiter") {
          navigate("/myjobs");
          return;
        }

        const profileResponse = await fetch(`${API_BASE}/accounts/profilecheck/`, {
          method: "GET",
          headers: { Authorization: `Bearer ${responseData.access}` },
        });
        
        if (profileResponse.ok) {
           const profileData = await profileResponse.json();
           if (profileData.profile_exists) {
             navigate("/home");
           } else {
             navigate("/profile");
           }
        } else {
           navigate("/home");
        }
      } else {
        setError(responseData.error?.non_field_errors?.[0] || "Username or Password Is Incorrect");
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to continue to CareerLink ATS</p>
        </div>

        {error && <div className="auth-alert auth-alert-error">{error}</div>}
        {success && <div className="auth-alert auth-alert-success">{success}</div>}

        <form className="auth-form" onSubmit={handleLogin}>
          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            type="text"
            placeholder="Enter your username"
            required
            disabled={isLoading}
          />
          
          <div className="ui-input-group">
            <label className="ui-input-label">Password</label>
            <div className="password-wrapper">
              <input
                className="ui-input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showpassword ? "text" : "password"}
                placeholder="Enter your password"
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

          <Button type="submit" variant="primary" disabled={isLoading} style={{ marginTop: "16px", width: "100%", justifyContent: "center" }}>
            {isLoading ? <><FaSpinner className="spinner-icon" /> Authenticating...</> : "Sign In"}
          </Button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/" className="auth-link">Register here</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
