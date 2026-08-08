import "../css/Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import {
  FaMoneyBillWave,
  FaClipboardList,
  FaSignOutAlt,
  FaUserTie,
  FaTachometerAlt,
  FaBriefcase
} from "react-icons/fa";
import Button from "./ui/Button";

function Navbar() {
  const navigate = useNavigate();

  const access_token = localStorage.getItem("accessTokens");
  const refresh_token = localStorage.getItem("refreshTokens");
  const user_name = localStorage.getItem("username");
  const role = localStorage.getItem("role");

  function logout() {
    localStorage.clear();
    navigate("/login");
    window.location.reload();
  }

  return (
    <nav className="navbar">
      <Link to="/home" className="logo">
        CareerLink
      </Link>

      {access_token && role !== "recruiter" && (
        <ul className="nav-links">
          <li>
            <Link to="/home">
              <FaMoneyBillWave /> Find Jobs
            </Link>
          </li>
          <li>
            <Link to="/appliedjobs">
              <FaClipboardList /> Applied Jobs
            </Link>
          </li>
        </ul>
      )}

      {access_token && role === "recruiter" && (
        <ul className="nav-links">
          <li>
            <Link to="/dashboard">
              <FaTachometerAlt /> Dashboard
            </Link>
          </li>
          <li>
            <Link to="/postjob">
              <FaClipboardList /> Post Job
            </Link>
          </li>
          <li>
            <Link to="/myjobs">
              <FaBriefcase /> My Jobs
            </Link>
          </li>
        </ul>
      )}

      <div className="right-section">
        {access_token && refresh_token ? (
          <>
            <span className="welcome-text">
              Welcome, <strong>{user_name}</strong>
            </span>

            {role !== "recruiter" && (
              <Button
                variant="secondary"
                title="My Profile"
                onClick={() => navigate("/myprofile")}
              >
                <FaUserTie /> Profile
              </Button>
            )}

            <Button variant="danger" onClick={logout}>
              <FaSignOutAlt /> Logout
            </Button>
          </>
        ) : (
          <div className="auth-buttons">
            <Button variant="secondary" onClick={() => navigate("/")}>
              Register
            </Button>
            <Button variant="primary" onClick={() => navigate("/login")}>
              Login
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
