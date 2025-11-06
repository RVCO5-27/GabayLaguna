import React from "react";
import { useTheme } from "../contexts/ThemeContext";
import { FaSun, FaMoon } from "react-icons/fa";

const ThemeToggle = ({ className = "", size = "md" }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: { width: "32px", height: "32px", fontSize: "12px" },
    md: { width: "40px", height: "40px", fontSize: "14px" },
    lg: { width: "48px", height: "48px", fontSize: "16px" },
  };

  const currentSize = sizeClasses[size];

  return (
    <button
      onClick={toggleTheme}
      className={`theme-toggle-btn ${className}`}
      style={{
        width: currentSize.width,
        height: currentSize.height,
        borderRadius: "50%",
        border: "2px solid",
        borderColor: isDarkMode ? "#667eea" : "#fbbf24",
        background: isDarkMode 
          ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
          : "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.3s ease",
        boxShadow: isDarkMode 
          ? "0 4px 15px rgba(102, 126, 234, 0.3)" 
          : "0 4px 15px rgba(251, 191, 36, 0.3)",
        cursor: "pointer",
        outline: "none",
        zIndex: 1,
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = "scale(1.1)";
        e.target.style.boxShadow = isDarkMode 
          ? "0 6px 20px rgba(102, 126, 234, 0.4)" 
          : "0 6px 20px rgba(251, 191, 36, 0.4)";
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = "scale(1)";
        e.target.style.boxShadow = isDarkMode 
          ? "0 4px 15px rgba(102, 126, 234, 0.3)" 
          : "0 4px 15px rgba(251, 191, 36, 0.3)";
      }}
      onMouseDown={(e) => {
        e.target.style.transform = "scale(0.95)";
      }}
      onMouseUp={(e) => {
        e.target.style.transform = "scale(1.1)";
      }}
      aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
      title={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
    >
      <div 
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <FaSun
          style={{
            position: "absolute",
            fontSize: currentSize.fontSize,
            transition: "all 0.3s ease",
            opacity: isDarkMode ? 0 : 1,
            transform: isDarkMode ? "rotate(180deg) scale(0)" : "rotate(0deg) scale(1)",
          }}
        />
        <FaMoon
          style={{
            position: "absolute",
            fontSize: currentSize.fontSize,
            transition: "all 0.3s ease",
            opacity: isDarkMode ? 1 : 0,
            transform: isDarkMode ? "rotate(0deg) scale(1)" : "rotate(-180deg) scale(0)",
          }}
        />
      </div>

      {/* Ripple effect */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "0",
          height: "0",
          background: "radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%)",
          borderRadius: "50%",
          transform: "translate(-50%, -50%)",
          transition: "all 0.6s ease",
          zIndex: -1,
        }}
        className="theme-ripple"
      />
    </button>
  );
};

export default ThemeToggle;
