import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import API_CONFIG from "../config/api";
import {
  FaUsers,
  FaShieldAlt,
  FaGlobe,
  FaArrowRight,
  FaStar,
} from "react-icons/fa";

const API_URL = `${API_CONFIG.BASE_URL}/api`;

const Hero = () => {
  const location = useLocation();
  const [statistics, setStatistics] = useState({
    verifiedGuides: 0,
    activeDestinations: 0,
  });

  useEffect(() => {
    if (location.hash === "#features") {
      const featureSection = document.getElementById("features");
      if (featureSection) {
        featureSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);

  useEffect(() => {
    // Fetch statistics from API
    const fetchStatistics = async () => {
      try {
        const response = await axios.get(`${API_URL}/statistics`);
        setStatistics({
          verifiedGuides: response.data.verified_guides || 0,
          activeDestinations: response.data.active_destinations || 0,
        });
      } catch (error) {
        console.error("Error fetching statistics:", error);
        // Use fallback values if API fails
        setStatistics({
          verifiedGuides: 0,
          activeDestinations: 0,
        });
      }
    };

    fetchStatistics();
  }, []);

  return (
    <section
      className="hero-section position-relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #5B3FE3 0%, #7A63F6 100%)", // Template: Laguna Sunrise Gradient
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        paddingTop: "100px", // Template: Large top padding (accounting for fixed navbar)
        paddingBottom: "80px", // Template: Bottom margin
        position: "relative",
        marginTop: "0", // Ensure no margin at top
      }}
    >
      {/* Background Pattern */}
      <div
        className="position-absolute w-100 h-100"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.3,
        }}
      ></div>

      <div className="container position-relative">
        {/* Logo - Centered across full width */}
        <div className="text-center mb-5">
          <img
            src="/assets/logo.png"
            alt="Gabay Laguna Logo"
            style={{
              width: "180px",
              height: "auto",
              filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.3))",
            }}
          />
        </div>

        <div className="row align-items-center">
          {/* Left Content */}
          <div className="col-lg-6 col-md-7 mb-5 mb-lg-0">
            <div className="hero-content text-white">
              {/* Main Heading */}
              <h1 
                className="display-4 fw-bold mb-4"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: "800",
                  lineHeight: "1.2",
                  textShadow: "0 4px 20px rgba(0,0,0,0.2)",
                  letterSpacing: "-0.02em",
                }}
              >
                Discover Laguna's Hidden Gems with Expert Guides
              </h1>

              {/* Subtitle */}
              <p
                className="lead mb-5"
                style={{
                  fontSize: "1.3rem",
                  opacity: 0.95,
                  lineHeight: 1.8,
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: "400",
                  color: "rgba(255,255,255,0.95)",
                }}
              >
                Connect with licensed local tour guides, explore breathtaking
                destinations, and create unforgettable memories in the heart of
                the Philippines.
              </p>

              {/* Features List */}
              <div className="mb-5">
                <div className="d-flex align-items-center mb-3">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{ 
                      width: "32px", 
                      height: "32px",
                      background: "rgba(255,255,255,0.2)",
                    }}
                  >
                    <FaStar size={14} style={{ color: "#FFFFFF" }} />
                  </div>
                  <span style={{ fontSize: "1.05rem", fontWeight: "500" }}>
                    Licensed & Verified Tour Guides
                  </span>
                </div>
                <div className="d-flex align-items-center mb-3">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{ 
                      width: "32px", 
                      height: "32px",
                      background: "rgba(255,255,255,0.2)",
                    }}
                  >
                    <FaShieldAlt size={14} style={{ color: "#FFFFFF" }} />
                  </div>
                  <span style={{ fontSize: "1.05rem", fontWeight: "500" }}>
                    Secure Booking & Payment System
                  </span>
                </div>
                <div className="d-flex align-items-center">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{ 
                      width: "32px", 
                      height: "32px",
                      background: "rgba(255,255,255,0.2)",
                    }}
                  >
                    <FaGlobe size={14} style={{ color: "#FFFFFF" }} />
                  </div>
                  <span style={{ fontSize: "1.05rem", fontWeight: "500" }}>
                    Explore Laguna's Best Destinations
                  </span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="d-flex flex-wrap gap-3 mb-4">
                <Link
                  to="/signup/tourist"
                  className="btn btn-lg px-5 py-3 fw-semibold d-flex align-items-center"
                  style={{
                    borderRadius: "50px", // Template: 50px pill
                    boxShadow: "0 8px 25px rgba(0,0,0,0.25)",
                    transition: "all 0.3s ease",
                    fontSize: "1.1rem",
                    background: "#5B3FE3", // Template: Pure Purple
                    color: "#FFFFFF", // White text
                    border: "none",
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: "600", // Template: Medium-bold
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-3px) scale(1.02)";
                    e.target.style.boxShadow = "0 12px 30px rgba(91, 63, 227, 0.4)";
                    e.target.style.background = "#7A63F6"; // Template: Slightly lighter purple
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0) scale(1)";
                    e.target.style.boxShadow = "0 8px 25px rgba(0,0,0,0.25)";
                    e.target.style.background = "#5B3FE3";
                  }}
                >
                  <FaUsers className="me-2" />
                  Start Exploring
                  <FaArrowRight className="ms-2" />
                </Link>
              </div>

              {/* Additional Links */}
              <div className="d-flex flex-wrap gap-3">
                <Link
                  to="/signup/guide"
                  className="btn btn-sm px-4 py-2 fw-semibold"
                  style={{
                    borderRadius: "25px",
                    borderWidth: "2px",
                    borderColor: "#FFD24D", // Template: Accent Gold
                    color: "#FFD24D",
                    background: "transparent",
                    fontFamily: "'Poppins', sans-serif",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "#FFD24D";
                    e.target.style.color = "#2C2C2C";
                    e.target.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "transparent";
                    e.target.style.color = "#FFD24D";
                    e.target.style.transform = "translateY(0)";
                  }}
                >
                  🧭 Become a Guide
                </Link>
                {/* Admin Access button hidden for security */}
                {/* <Link 
                  to="/admin/login" 
                  className="btn btn-outline-secondary btn-sm px-3 py-2"
                  style={{ 
                    borderRadius: '25px',
                    borderWidth: '2px'
                  }}
                >
                  👨‍💼 Admin Access
                </Link> */}
              </div>
            </div>
          </div>

          {/* Right Content - Stats & Visual Elements */}
          <div className="col-lg-6 col-md-5">
            <div className="hero-stats text-center text-white">
              {/* Stats Cards */}
              <div className="row g-3 mb-4">
                <div className="col-6">
                  <div 
                    className="bg-white bg-opacity-15 rounded-4 p-4 border border-white border-opacity-30 shadow-lg"
                    style={{
                      backdropFilter: "blur(10px)",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "translateY(-5px)";
                      e.target.style.background = "rgba(255,255,255,0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.background = "rgba(255,255,255,0.15)";
                    }}
                  >
                    <div className="h3 fw-bold mb-1" style={{ fontSize: "2rem" }}>
                      {statistics.verifiedGuides > 0 ? `${statistics.verifiedGuides}+` : "0"}
                    </div>
                    <div className="small" style={{ fontSize: "0.9rem", fontWeight: "500" }}>Tour Guides</div>
                  </div>
                </div>
                <div className="col-6">
                  <div 
                    className="bg-white bg-opacity-15 rounded-4 p-4 border border-white border-opacity-30 shadow-lg"
                    style={{
                      backdropFilter: "blur(10px)",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "translateY(-5px)";
                      e.target.style.background = "rgba(255,255,255,0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.background = "rgba(255,255,255,0.15)";
                    }}
                  >
                    <div className="h3 fw-bold mb-1" style={{ fontSize: "2rem" }}>
                      {statistics.activeDestinations > 0 ? `${statistics.activeDestinations}+` : "0"}
                    </div>
                    <div className="small" style={{ fontSize: "0.9rem", fontWeight: "500" }}>Destinations</div>
                  </div>
                </div>
              </div>

              {/* City Images Grid */}
              <div className="city-grid mb-4">
                <div className="row g-2">
                  <div className="col-6">
                    <img
                      src="/assets/CalambaCity.jpg"
                      alt="Calamba City"
                      className="img-fluid rounded-3 shadow"
                      style={{
                        height: "120px",
                        width: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                  <div className="col-6">
                    <img
                      src="/assets/SanPabloCity.svg.png"
                      alt="San Pablo City"
                      className="img-fluid rounded-3 shadow"
                      style={{
                        height: "120px",
                        width: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                  <div className="col-6">
                    <img
                      src="/assets/StaRosaCity.jpg"
                      alt="Sta Rosa City"
                      className="img-fluid rounded-3 shadow"
                      style={{
                        height: "120px",
                        width: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                  <div className="col-6">
                    <img
                      src="/assets/BinanCity.jpg"
                      alt="Binan City"
                      className="img-fluid rounded-3 shadow"
                      style={{
                        height: "120px",
                        width: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="trust-indicators">
                <div className="d-flex align-items-center justify-content-center mb-2">
                  <div className="d-flex me-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        className="text-warning me-1"
                        size={16}
                      />
                    ))}
                  </div>
                  <span className="text-white-75 small">4.9/5 Rating</span>
                </div>
                <p className="text-white-50 small mb-0">
                  Trusted by thousands of tourists worldwide
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="position-absolute bottom-0 start-50 translate-middle-x mb-4">
        <div className="text-center text-white-50">
          <div className="mb-2">Scroll to explore</div>
          <div className="scroll-indicator">
            <div className="scroll-dot"></div>
            <div className="scroll-dot"></div>
            <div className="scroll-dot"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
