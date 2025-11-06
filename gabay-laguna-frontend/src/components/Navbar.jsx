import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import ThemeToggle from "./ThemeToggle";
import { Dropdown } from "react-bootstrap";
import {
  FaSignOutAlt,
  FaUserCircle,
  FaHome,
} from "react-icons/fa";
import API_CONFIG from "../config/api";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  const pathname = location.pathname;

  // Validate authentication on mount and when pathname changes
  useEffect(() => {
    const validateAuth = async () => {
      try {
        const userData = localStorage.getItem("user");
        const token = localStorage.getItem("token");
        
        // Only consider logged in if both user data AND token exist
        if (userData && token) {
          try {
            const parsedUser = JSON.parse(userData);
            
            // Optionally validate token with backend (non-blocking)
            // This runs in the background and clears if invalid
            fetch(`${API_CONFIG.BASE_URL}/api/user`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
              },
            }).then(response => {
              if (!response.ok) {
                // Token is invalid, clear auth
                localStorage.removeItem("user");
                localStorage.removeItem("token");
                setUser(null);
                setRole(null);
                setIsLoggedIn(false);
              }
            }).catch(() => {
              // Network error - don't clear, might be offline
              // Keep user logged in for offline capability
            });
            
            // Set user immediately (optimistic)
            setUser(parsedUser);
            setRole(parsedUser?.user_type || parsedUser?.role || null);
            setIsLoggedIn(true);
          } catch (parseError) {
            console.error("Error parsing user data:", parseError);
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            setUser(null);
            setRole(null);
            setIsLoggedIn(false);
          }
        } else {
          // Clear invalid data
          if (userData && !token) {
            localStorage.removeItem("user");
          }
          if (token && !userData) {
            localStorage.removeItem("token");
          }
          setUser(null);
          setRole(null);
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error("Error validating auth:", error);
        // Clear corrupted data
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
        setRole(null);
        setIsLoggedIn(false);
      }
    };

    validateAuth();
  }, [pathname]);

  const isPublicPage = [
    "/",
    "/login",
    "/signup",
    "/signup/tourist",
    "/signup/tourguide",
    "/signup/admin",
  ].some((path) => pathname === path || pathname.startsWith(path));

  // Dropdown links removed as only Logout remains in the menu

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setRole(null);
    setIsLoggedIn(false);
    alert("You have been logged out.");
    navigate("/login");
  };

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark px-4 py-3"
      style={{
        background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        backdropFilter: "blur(10px)",
        position: "relative",
        zIndex: 1000,
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <div className="container">
        {/* Brand */}
        <Link
          className="navbar-brand d-flex align-items-center gap-3"
          to="/"
          style={{ textDecoration: "none" }}
        >
          <div className="position-relative">
            <img
              src="/assets/logo.png"
              alt="Gabay Laguna Logo"
              className="rounded-circle shadow-sm"
              style={{
                width: "45px",
                height: "45px",
                objectFit: "cover",
                border: "2px solid rgba(255,255,255,0.2)",
              }}
            />
          </div>
          <div className="d-flex flex-column">
            <span className="fw-bold fs-5 text-white">Gabay Laguna</span>
            <small className="text-white-50" style={{ fontSize: "0.75rem" }}>
              Explore • Discover • Experience
            </small>
          </div>
        </Link>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
          style={{ border: "none", boxShadow: "none" }}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigation Items */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <div className="ms-auto d-flex gap-3 align-items-center">

            {/* Enhanced Theme Toggle */}
            <div className="d-none d-md-block">
              <ThemeToggle />
            </div>

            {/* Logged In User */}
            {isLoggedIn && (
              <div className="position-relative" style={{ zIndex: 1001 }}>
                <Dropdown align="end">
                  <Dropdown.Toggle
                    variant="light"
                    id="dropdown-user"
                    className="d-flex align-items-center gap-2 px-3 py-2"
                    style={{
                      borderRadius: "25px",
                      border: "none",
                      background: "rgba(255,255,255,0.9)",
                      color: "#667eea",
                      fontWeight: "600",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                      transition: "all 0.3s ease",
                      userSelect: "none",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "rgba(255,255,255,1)";
                      e.target.style.transform = "translateY(-1px)";
                      e.target.style.boxShadow = "0 4px 15px rgba(0,0,0,0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "rgba(255,255,255,0.9)";
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
                    }}
                  >
                    <FaUserCircle size={18} />
                    <span className="d-none d-sm-inline" style={{ userSelect: "none" }}>
                      {user?.name ||
                        user?.fullName ||
                        (role
                          ? role.charAt(0).toUpperCase() + role.slice(1)
                          : "User")}
                    </span>
                  </Dropdown.Toggle>
                  <Dropdown.Menu
                    className="shadow-lg border-0"
                    style={{
                      borderRadius: "16px",
                      marginTop: "8px",
                      minWidth: "220px",
                      zIndex: 1002,
                      background: "var(--color-bg-secondary)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid var(--color-border)",
                      animation: "dropdownFadeIn 0.3s ease-out",
                    }}
                  >
                    {/* Only keep Logout in the menu */}

                    <Dropdown.Item
                      onClick={handleLogout}
                      className="d-flex align-items-center gap-2 py-3 px-3"
                      style={{
                        transition: "all 0.2s ease",
                        border: "none",
                        background: "transparent",
                        color: "var(--color-danger)",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "rgba(239, 68, 68, 0.1)";
                        e.target.style.transform = "translateX(4px)";
                        e.target.style.color = "var(--color-danger)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "transparent";
                        e.target.style.transform = "translateX(0)";
                        e.target.style.color = "var(--color-danger)";
                      }}
                    >
                      <FaSignOutAlt size={14} />
                      <span style={{ fontWeight: "500" }}>Logout</span>
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            )}

            {/* Public Navigation */}
            {!isLoggedIn && isPublicPage && (
              <div className="d-flex gap-2">
                <Link
                  to="/login"
                  className="btn btn-outline-light px-3 py-2 d-flex align-items-center gap-2"
                  style={{
                    borderRadius: "25px",
                    borderWidth: "2px",
                    borderColor: "rgba(255, 255, 255, 0.4)",
                    fontWeight: "600",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    background: "rgba(255, 255, 255, 0.05)",
                    color: "white",
                    position: "relative",
                    overflow: "hidden",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.7)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(255, 255, 255, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.4)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.25)";
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.15)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.8)";
                    e.currentTarget.style.outline = "2px solid rgba(255, 255, 255, 0.5)";
                    e.currentTarget.style.outlineOffset = "2px";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.4)";
                    e.currentTarget.style.outline = "none";
                  }}
                >
                  <span style={{ fontSize: "16px", transition: "transform 0.3s ease" }}>🔑</span>
                  <span>Login</span>
                </Link>
                <Link
                  to="/signup/tourist"
                  className="btn btn-light px-3 py-2 d-flex align-items-center gap-2"
                  style={{
                    borderRadius: "25px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    fontWeight: "600",
                    background: "white",
                    color: "#4f46e5",
                    border: "none",
                    position: "relative",
                    overflow: "hidden",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(79, 70, 229, 0.3)";
                    e.currentTarget.style.background = "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                    e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.15)";
                    e.currentTarget.style.background = "white";
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = "translateY(0) scale(0.98)";
                    e.currentTarget.style.boxShadow = "0 1px 5px rgba(0,0,0,0.2)";
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(79, 70, 229, 0.3)";
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(79, 70, 229, 0.3)";
                    e.currentTarget.style.outline = "2px solid rgba(79, 70, 229, 0.5)";
                    e.currentTarget.style.outlineOffset = "2px";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                    e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.15)";
                    e.currentTarget.style.outline = "none";
                  }}
                >
                  <span style={{ fontSize: "16px", transition: "transform 0.3s ease" }}>📝</span>
                  <span>Sign Up</span>
                </Link>
              </div>
            )}

            {/* Home Link for Non-Public Pages */}
            {!isPublicPage && (
              <Link
                to="/"
                className="btn btn-outline-light btn-sm px-3 py-2"
                style={{
                  borderRadius: "20px",
                  borderWidth: "2px",
                }}
              >
                <FaHome className="me-1" />
                Home
              </Link>
            )}

            {/* Mobile Theme Toggle */}
            <div className="d-md-none d-flex align-items-center">
              <ThemeToggle size="sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Add custom CSS for dropdown animation */}
      <style jsx>{`
        @keyframes dropdownFadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .dropdown-menu {
          z-index: 1002 !important;
          background: var(--color-bg-secondary) !important;
          border: 1px solid var(--color-border) !important;
        }

        .dropdown-item {
          color: var(--color-text) !important;
          background: transparent !important;
        }

        .dropdown-item:hover {
          background-color: rgba(102, 126, 234, 0.1) !important;
          color: var(--color-text) !important;
        }

        .dropdown-item:active {
          background-color: rgba(102, 126, 234, 0.2) !important;
          color: var(--color-text) !important;
        }

        .dropdown-item span {
          color: inherit !important;
        }

        .dropdown-header {
          color: var(--color-text-muted) !important;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
