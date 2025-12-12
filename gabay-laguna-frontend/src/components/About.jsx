import React from 'react';

const About = () => (
  <section 
    className="py-5"
    style={{
      background: '#FFFFFF',
      paddingTop: "80px",
      paddingBottom: "80px"
    }}
  >
    <div className="container">
      <h2 
        className="text-center fw-bold mb-4"
        style={{
          fontFamily: "'Poppins', sans-serif",
          fontWeight: "700",
          color: "#2C2C2C",
          fontSize: "2.5rem"
        }}
      >
        About Gabay Laguna
      </h2>
      <p 
        className="text-center mx-auto" 
        style={{ 
          maxWidth: '800px', 
          lineHeight: '1.8',
          color: '#6F6F6F',
          fontSize: "1.15rem"
        }}
      >
        Gabay Laguna is your go-to web platform for connecting with certified local tour guides in Laguna. 
        Our system provides secure transactions, real-time availability tracking, and verified reviews—ensuring an 
        optimized and trustworthy travel experience for every tourist and local alike.
      </p>
    </div>
  </section>
);

export default About;
