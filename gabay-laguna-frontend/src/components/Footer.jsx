import React from 'react';

const Footer = () => (
  <>
    {/* Separator div for clean transition */}
    <div style={{
      height: "2px",
      background: "linear-gradient(90deg, transparent, rgba(79, 70, 229, 0.3), transparent)",
      marginTop: "0"
    }} />
    <footer 
      style={{
        background: "var(--navbar-bg, linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%))",
        color: "white",
        textAlign: "center",
        padding: "1rem 0",
        marginTop: "0",
        width: "100%",
        position: "relative",
        zIndex: 1
      }}
    >
      <div className="container">
        <p style={{ margin: 0, fontSize: "0.9rem" }}>
          &copy; {new Date().getFullYear()} Gabay Laguna. All Rights Reserved.
        </p>
      </div>
    </footer>
  </>
);

export default Footer;
