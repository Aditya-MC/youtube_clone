import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export default function Header({ onSearch, onToggleSidebar, isSidebarOpen, onHomeClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchText, setSearchText] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchText);
  };

  // Hide header in login/register pages
  if (location.pathname === "/login" || location.pathname === "/register") {
    return null;
  }

  const handleLogoClick = () => {
    if (onHomeClick) onHomeClick(); // Clear search query
    navigate("/"); // Go to home page
  };

  return (
    <header className="header">
      {/* Hamburger button */}
      <button 
        className={`menu-btn ${isSidebarOpen ? "active" : ""}`} 
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
      >
        ☰
      </button>

      <div className="logo" onClick={handleLogoClick} style={{ cursor: "pointer" }}>
        YouTube Clone
      </div>

      <form className="search-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Search"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      <nav className="nav">
        {user ? (
          <>
            <span className="username">Hello, {user.username}</span>
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="btn-login">
            Login
          </Link>
        )}
      </nav>
    </header>
  );
}
