import React from 'react';

const Footer = () => (
  <footer 
    style={{
      background: 'linear-gradient(135deg, #2A2F42 0%, #1a1f2e 100%)',
      color: '#F7F9FF',
      paddingTop: "40px",
      paddingBottom: "40px",
      textAlign: "center",
      borderTop: "1px solid rgba(255,255,255,0.1)"
    }}
  >
    <div className="container">
      <p 
        className="mb-0" 
        style={{ 
          color: '#F7F9FF', 
          fontSize: "1rem",
          fontWeight: "400"
        }}
      >
        &copy; {new Date().getFullYear()} Gabay Laguna. All Rights Reserved.
      </p>
    </div>
  </footer>
);

export default Footer;
