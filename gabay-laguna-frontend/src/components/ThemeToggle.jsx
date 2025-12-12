import React from "react";
import { useTheme } from "../contexts/ThemeContext";
import { FaSun, FaMoon } from "react-icons/fa";

const ThemeToggle = ({ className = "", size = "md" }) => {
  const { isDarkMode, toggleTheme } = useTheme();

  const sizeMap = {
    sm: { width: "32px", height: "32px", iconSize: 14 },
    md: { width: "42px", height: "42px", iconSize: 18 },
    lg: { width: "52px", height: "52px", iconSize: 22 },
  };

  const dimensions = sizeMap[size] || sizeMap.md;

  return (
    <button
      onClick={toggleTheme}
      className={`theme-toggle-btn ${className}`}
      style={{
        width: dimensions.width,
        height: dimensions.height,
        borderRadius: "50%",
        border: "2px solid",
        borderColor: isDarkMode 
          ? "rgba(255, 255, 255, 0.3)" 
          : "rgba(255, 255, 255, 0.4)",
        background: isDarkMode
          ? "linear-gradient(135deg, #5B3FE3 0%, #7A63F6 100%)"
          : "linear-gradient(135deg, #FFD24D 0%, #FFB84D 100%)",
        color: "#FFFFFF",
        boxShadow: isDarkMode
          ? "0 4px 15px rgba(91, 63, 227, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)"
          : "0 4px 15px rgba(255, 210, 77, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "pointer",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        outline: "none",
        padding: 0,
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = "scale(1.1)";
        e.target.style.boxShadow = isDarkMode
          ? "0 6px 20px rgba(91, 63, 227, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3)"
          : "0 6px 20px rgba(255, 210, 77, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3)";
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = "scale(1)";
        e.target.style.boxShadow = isDarkMode
          ? "0 4px 15px rgba(91, 63, 227, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)"
          : "0 4px 15px rgba(255, 210, 77, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)";
      }}
      onMouseDown={(e) => {
        e.target.style.transform = "scale(0.95)";
      }}
      onMouseUp={(e) => {
        e.target.style.transform = "scale(1)";
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
            opacity: isDarkMode ? 0 : 1,
            transform: isDarkMode
              ? "rotate(180deg) scale(0)"
              : "rotate(0deg) scale(1)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            fontSize: `${dimensions.iconSize}px`,
          }}
        />
        <FaMoon
          style={{
            position: "absolute",
            opacity: isDarkMode ? 1 : 0,
            transform: isDarkMode
              ? "rotate(0deg) scale(1)"
              : "rotate(-180deg) scale(0)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            fontSize: `${dimensions.iconSize}px`,
          }}
        />
      </div>

      {/* Ripple effect overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: isDarkMode
            ? "linear-gradient(135deg, rgba(91, 63, 227, 0.3) 0%, rgba(122, 99, 246, 0.3) 100%)"
            : "linear-gradient(135deg, rgba(255, 210, 77, 0.3) 0%, rgba(255, 184, 77, 0.3) 100%)",
          opacity: 0,
          transition: "opacity 0.3s ease",
          pointerEvents: "none",
        }}
      />
    </button>
  );
};

export default ThemeToggle;
