import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

import { AuthProvider } from "./context/AuthContext";

import Header from "./components/Header";
import Sidebar from "./components/Sidebar";

import Home from "./pages/Home";
import VideoPage from "./pages/VideoPage";
import ChannelPage from "./pages/ChannelPage";
import Login from "./components/Login";
import Register from "./components/Register";
import PrivateRoute from "./components/PrivateRoute";
import CreateChannel from "./pages/CreateChannel";

function AppContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  
  // Initialize sidebar state based on screen size and localStorage
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const savedState = localStorage.getItem('sidebarOpen');
    if (savedState !== null) {
      return JSON.parse(savedState);
    }
    return window.innerWidth >= 1024;
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebarOpen', JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  // Hide sidebar in auth pages
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

  // Reset search query when clicking logo/home
  const handleHomeClick = () => {
    setSearchQuery(""); // Clear search
  };

  return (
    <>
      <Header 
        onSearch={setSearchQuery} 
        onToggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
        onHomeClick={handleHomeClick} // <-- Pass handler
      />

      {!isAuthPage && (
        <>
          {isSidebarOpen && window.innerWidth < 1024 && (
            <div className="overlay" onClick={() => setIsSidebarOpen(false)}></div>
          )}
          <Sidebar 
            isOpen={isSidebarOpen} 
            onToggle={toggleSidebar}
          />
        </>
      )}

      <main className={!isAuthPage && isSidebarOpen && window.innerWidth >= 1024 ? 'with-sidebar' : ''}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Home 
                  searchQuery={searchQuery} 
                  isSidebarOpen={isSidebarOpen}
                  onToggleSidebar={toggleSidebar}
                />
              </PrivateRoute>
            }
          />
          <Route
            path="/video/:id"
            element={
              <PrivateRoute>
                <VideoPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/channel/:id"
            element={
              <PrivateRoute>
                <ChannelPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/create-channel"
            element={
              <PrivateRoute>
                <CreateChannel />
              </PrivateRoute>
            }
          />
          <Route
            path="/my-channel"
            element={
              <PrivateRoute>
                <ChannelPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </main>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
