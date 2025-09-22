import { Link } from "react-router-dom";

export default function Sidebar({ isOpen, onToggle }) {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div className="sidebar-overlay" onClick={onToggle}></div>}
      
      <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
        <ul>
          {/* Real working links */}
          <li>
            <Link to="/" onClick={() => window.innerWidth <= 768 && onToggle()}>
              🏠 Home
            </Link>
          </li>
          <li>
            <Link to="/create-channel" onClick={() => window.innerWidth <= 768 && onToggle()}>
              ➕ Create Channel
            </Link>
          </li>
          <li>
            <Link to="/my-channel" onClick={() => window.innerWidth <= 768 && onToggle()}>
              👤 My Channel
            </Link>
          </li>
          
          <hr />
          
          {/* Dummy static options */}
          <li><a>🎬 Shorts</a></li>
          <li><a>📺 Subscriptions</a></li>
          <li><a>👥 You</a></li>
          <li><a>🕒 History</a></li>
          
          <hr />
          
          <li><a>🔥 Trending</a></li>
          <li><a>🛍️ Shopping</a></li>
          <li><a>🎵 Music</a></li>
          <li><a>🎥 Movies</a></li>
          <li><a>📡 Live</a></li>
          <li><a>🎮 Gaming</a></li>
          <li><a>📰 News</a></li>
        </ul>
      </div>
    </>
  );
}