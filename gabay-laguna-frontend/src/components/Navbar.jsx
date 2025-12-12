import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import ThemeToggle from "./ThemeToggle";
import { Dropdown } from "react-bootstrap";
import {
  FaUser,
  FaSignOutAlt,
  FaUserCircle,
  FaTachometerAlt,
  FaClipboardList,
  FaHome,
} from "react-icons/fa";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const pathname = location.pathname;
  const user = (() => {
    try {
      const userData = localStorage.getItem("user");
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  })();
  const isLoggedIn = !!user;
  const role = user?.user_type || user?.role || null;

  const isPublicPage = [
    "/",
    "/login",
    "/signup",
    "/signup/tourist",
    "/signup/tourguide",
    "/signup/admin",
  ].some((path) => pathname === path || pathname.startsWith(path));

  const dropdownLinks = {
    tourist: {
      profile: "/tourist-profile",
      dashboard: "/tourist-dashboard",
      bookings: "/my-bookings",
    },
    guide: {
      profile: "/guide-profile",
      dashboard: "/guide-dashboard",
      bookings: "/guide-bookings",
    },
    admin: {
      profile: "/admin-dashboard",
      dashboard: "/admin-dashboard",
    },
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    alert("You have been logged out.");
    navigate("/login");
  };

  // Use template design for landing page, gradient for other pages
  const isLandingPage = pathname === "/";
  
  return (
    <nav
      className={`navbar navbar-expand-lg px-4 ${isLandingPage ? "navbar-light" : "navbar-dark"}`}
      style={{
        background: isLandingPage 
          ? "linear-gradient(135deg, #E8E4FF 0%, #F3F0FF 100%)" // Light purple gradient for header
          : "linear-gradient(135deg, #5B3FE3 0%, #7A63F6 100%)",
        boxShadow: isLandingPage
          ? "0 2px 8px rgba(0,0,0,0.08)" // Template: Soft shadow
          : "0 4px 20px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.1)",
        backdropFilter: "blur(10px)",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        width: "100%",
        zIndex: 1000,
        borderBottom: isLandingPage
          ? "1px solid rgba(91, 63, 227, 0.1)"
          : "1px solid rgba(255, 255, 255, 0.15)",
        paddingTop: "12px",
        paddingBottom: "12px",
        margin: 0,
      }}
    >
      <div className="container">
        {/* Brand */}
        <Link
          className="navbar-brand d-flex align-items-center"
          to="/"
          style={{ textDecoration: "none", gap: "12px" }}
        >
          <div 
            className="rounded-circle d-flex align-items-center justify-content-center"
            style={{
              width: "50px",
              height: "50px",
              background: "linear-gradient(135deg, #5B3FE3 0%, #7A63F6 100%)",
              border: "none",
              boxShadow: "0 2px 8px rgba(91, 63, 227, 0.2)",
            }}
          >
            <img
              src="/assets/logo.png"
              alt="Gabay Laguna Logo"
              style={{
                width: "35px",
                height: "35px",
                objectFit: "contain",
              }}
            />
          </div>
          <div className="d-flex flex-column">
            <span 
              className="fw-bold" 
              style={{ 
                color: isLandingPage ? "#5B3FE3" : "#FFFFFF",
                fontSize: "1.1rem",
                lineHeight: "1.2"
              }}
            >
              Gabay Laguna
            </span>
            <small 
              style={{ 
                fontSize: "0.7rem",
                color: isLandingPage ? "#7A63F6" : "rgba(255,255,255,0.7)",
                fontWeight: "500",
                lineHeight: "1.2"
              }}
            >
              Explore • Discover
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
          style={{ 
            border: "none", 
            boxShadow: "none",
            color: isLandingPage ? "#5B3FE3" : "#FFFFFF"
          }}
        >
          <span 
            className="navbar-toggler-icon"
            style={{
              backgroundImage: isLandingPage 
                ? `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba%2891, 63, 227, 1%29' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e")`
                : `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba%28255, 255, 255, 1%29' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e")`
            }}
          ></span>
        </button>

        {/* Navigation Items */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <div className="ms-auto d-flex gap-3 align-items-center">

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
                    <span className="d-none d-sm-inline">
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
                      background: "rgba(255, 255, 255, 0.95)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      animation: "dropdownFadeIn 0.3s ease-out",
                    }}
                  >
                    <Dropdown.Header
                      className="fw-bold text-muted"
                      style={{
                        background: "transparent",
                        borderBottom: "1px solid rgba(0,0,0,0.1)",
                        padding: "12px 16px",
                      }}
                    >
                      Welcome back!
                    </Dropdown.Header>

                    <Dropdown.Item
                      as={Link}
                      to={dropdownLinks[role]?.profile || "/profile"}
                      className="d-flex align-items-center gap-2 py-3 px-3"
                      style={{
                        transition: "all 0.2s ease",
                        border: "none",
                        background: "transparent",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "rgba(102, 126, 234, 0.1)";
                        e.target.style.transform = "translateX(4px)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "transparent";
                        e.target.style.transform = "translateX(0)";
                      }}
                    >
                      <FaUser size={14} style={{ color: "#667eea" }} />
                      <span style={{ fontWeight: "500" }}>Profile</span>
                    </Dropdown.Item>

                    <Dropdown.Item
                      as={Link}
                      to={dropdownLinks[role]?.dashboard || "/dashboard"}
                      className="d-flex align-items-center gap-2 py-3 px-3"
                      style={{
                        transition: "all 0.2s ease",
                        border: "none",
                        background: "transparent",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "rgba(102, 126, 234, 0.1)";
                        e.target.style.transform = "translateX(4px)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "transparent";
                        e.target.style.transform = "translateX(0)";
                      }}
                    >
                      <FaTachometerAlt size={14} style={{ color: "#667eea" }} />
                      <span style={{ fontWeight: "500" }}>Dashboard</span>
                    </Dropdown.Item>

                    {role === "tourist" && (
                      <Dropdown.Item
                        as={Link}
                        to={dropdownLinks[role]?.bookings || "/my-bookings"}
                        className="d-flex align-items-center gap-2 py-3 px-3"
                        style={{
                          transition: "all 0.2s ease",
                          border: "none",
                          background: "transparent",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background =
                            "rgba(102, 126, 234, 0.1)";
                          e.target.style.transform = "translateX(4px)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = "transparent";
                          e.target.style.transform = "translateX(0)";
                        }}
                      >
                        <FaClipboardList
                          size={14}
                          style={{ color: "#667eea" }}
                        />
                        <span style={{ fontWeight: "500" }}>My Bookings</span>
                      </Dropdown.Item>
                    )}

                    {role === "guide" && (
                      <Dropdown.Item
                        as={Link}
                        to={dropdownLinks[role]?.bookings || "/guide-bookings"}
                        className="d-flex align-items-center gap-2 py-3 px-3"
                        style={{
                          transition: "all 0.2s ease",
                          border: "none",
                          background: "transparent",
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background =
                            "rgba(102, 126, 234, 0.1)";
                          e.target.style.transform = "translateX(4px)";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = "transparent";
                          e.target.style.transform = "translateX(0)";
                        }}
                      >
                        <FaClipboardList
                          size={14}
                          style={{ color: "#667eea" }}
                        />
                        <span style={{ fontWeight: "500" }}>
                          Manage Bookings
                        </span>
                      </Dropdown.Item>
                    )}

                    <Dropdown.Divider
                      style={{
                        margin: "8px 0",
                        borderColor: "rgba(0,0,0,0.1)",
                      }}
                    />

                    <Dropdown.Item
                      onClick={handleLogout}
                      className="d-flex align-items-center gap-2 py-3 px-3"
                      style={{
                        transition: "all 0.2s ease",
                        border: "none",
                        background: "transparent",
                        color: "#ef4444",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "rgba(239, 68, 68, 0.1)";
                        e.target.style.transform = "translateX(4px)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = "transparent";
                        e.target.style.transform = "translateX(0)";
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
              <div className="d-flex gap-3 align-items-center" style={{ gap: "12px" }}>
                {/* Theme Toggle - Yellow Sun Icon */}
                <div className="d-none d-md-block">
                  <ThemeToggle />
                </div>
                
                {/* Sign Up Text Link */}
                <Link
                  to="/signup/tourist"
                  className="text-decoration-none fw-semibold"
                  style={{
                    color: isLandingPage ? "#5B3FE3" : "#FFFFFF",
                    fontSize: "0.95rem",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = isLandingPage ? "#7A63F6" : "#F1F1FF";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = isLandingPage ? "#5B3FE3" : "#FFFFFF";
                  }}
                >
                  Sign Up
                </Link>
                
                {/* Sign Up Button */}
                <Link
                  to="/signup/tourist"
                  className="btn px-3 py-2 fw-semibold"
                  style={{
                    borderRadius: "25px",
                    background: isLandingPage ? "#FFFFFF" : "#FFFFFF",
                    color: isLandingPage ? "#5B3FE3" : "#5B3FE3",
                    border: "none",
                    boxShadow: isLandingPage ? "0 2px 8px rgba(0,0,0,0.1)" : "0 2px 10px rgba(0,0,0,0.1)",
                    transition: "all 0.3s ease",
                    fontSize: "0.9rem",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-1px)";
                    e.target.style.boxShadow = isLandingPage 
                      ? "0 4px 12px rgba(0,0,0,0.15)" 
                      : "0 4px 15px rgba(0,0,0,0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = isLandingPage 
                      ? "0 2px 8px rgba(0,0,0,0.1)" 
                      : "0 2px 10px rgba(0,0,0,0.1)";
                  }}
                >
                  Sign Up
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
            <div className="d-md-none d-flex gap-2">
              <ThemeToggle />
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
        }

        .dropdown-item:hover {
          background-color: rgba(102, 126, 234, 0.1) !important;
        }

        .dropdown-item:active {
          background-color: rgba(102, 126, 234, 0.2) !important;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
