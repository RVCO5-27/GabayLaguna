import React from 'react';
import { FaSearch, FaClock, FaLock, FaMapMarkedAlt, FaUsers, FaShieldAlt } from 'react-icons/fa'; 

const features = [
  {
    title: 'Real-Time Availability',
    desc: 'Instantly check which tour guides are available with live updates to avoid scheduling conflicts and overbooking.',
    icon: <FaClock size={40} />,
    color: '#667eea',
    bgColor: 'rgba(102, 126, 234, 0.1)'
  },
  {
    title: 'Smart Search & Filters',
    desc: 'Quickly find guides based on your location, language, budget, schedule, and interests.',
    icon: <FaSearch size={40} />,
    color: '#11998e',
    bgColor: 'rgba(17, 153, 142, 0.1)'
  },
  {
    title: 'Secure Payments',
    desc: 'Pay safely through PayPal and PayMongo with verified encryption. Get digital receipts and instant confirmation.',
    icon: <FaLock size={40} />,
    color: '#764ba2',
    bgColor: 'rgba(118, 75, 162, 0.1)'
  },
  {
    title: 'Interactive Maps',
    desc: 'Explore destinations with our interactive maps showing points of interest, guide locations, and route planning.',
    icon: <FaMapMarkedAlt size={40} />,
    color: '#f093fb',
    bgColor: 'rgba(240, 147, 251, 0.1)'
  },
  {
    title: 'Verified Guides',
    desc: 'All tour guides are licensed, verified, and rated by previous tourists for quality assurance.',
    icon: <FaUsers size={40} />,
    color: '#4facfe',
    bgColor: 'rgba(79, 172, 254, 0.1)'
  },
  {
    title: '24/7 Support',
    desc: 'Get help anytime with our round-the-clock customer support and emergency assistance.',
    icon: <FaShieldAlt size={40} />,
    color: '#43e97b',
    bgColor: 'rgba(67, 233, 123, 0.1)'
  }
];

const Features = () => (
  <section className="py-5" id="features" style={{
    background: 'linear-gradient(135deg, #F7F9FF 0%, #F3F6FF 100%)',
    paddingTop: "80px",
    paddingBottom: "80px"
  }}>
    <div className="container">
      {/* Header */}
      <div className="text-center mb-5">
        <h2 
          className="display-5 fw-bold mb-3" 
          style={{ 
            color: '#2C2C2C',
            fontFamily: "'Poppins', sans-serif",
            fontWeight: "700",
            fontSize: "2.5rem"
          }}
        >
          Why Choose Gabay Laguna?
        </h2>
        <p 
          className="lead mx-auto" 
          style={{ 
            maxWidth: '700px',
            color: '#6F6F6F',
            fontSize: "1.15rem",
            lineHeight: "1.7"
          }}
        >
          Experience the perfect blend of technology and local expertise for unforgettable adventures
        </p>
      </div>

      {/* Features Grid */}
      <div className="row g-4">
        {features.map((feature, index) => (
          <div className="col-lg-4 col-md-6" key={index}>
            <div 
              className="card h-100 border-0"
              style={{ 
                borderRadius: '24px',
                background: '#FFFFFF',
                boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                overflow: 'hidden',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-12px) scale(1.02)';
                e.target.style.boxShadow = '0 20px 50px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 10px 30px rgba(0,0,0,0.08)';
              }}
            >
              <div className="card-body p-4 p-md-5 text-center" style={{ padding: '40px 30px' }}>
                {/* Icon Container */}
                <div 
                  className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4"
                  style={{
                    width: '90px',
                    height: '90px',
                    backgroundColor: feature.bgColor,
                    color: feature.color,
                    boxShadow: `0 8px 20px ${feature.bgColor}`,
                    transition: 'all 0.3s ease'
                  }}
                >
                  {feature.icon}
                </div>

                {/* Content */}
                <h5 
                  className="card-title fw-bold mb-3" 
                  style={{ 
                    color: '#2C2C2C',
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: "1.4rem",
                    fontWeight: "700"
                  }}
                >
                  {feature.title}
                </h5>
                <p 
                  className="card-text lh-base" 
                  style={{ 
                    color: '#6F6F6F',
                    fontSize: "1rem",
                    lineHeight: "1.7"
                  }}
                >
                  {feature.desc}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="text-center mt-5 pt-4">
        <div 
          className="rounded-4 p-4 p-md-5 d-inline-block"
          style={{
            borderRadius: "28px",
            background: "transparent",
          }}
        >
          <h4 
            className="fw-bold mb-3" 
            style={{ 
              color: '#5B3FE3',
              fontFamily: "'Poppins', sans-serif",
              fontSize: "1.8rem",
              fontWeight: "700"
            }}
          >
            Ready to Start Your Adventure?
          </h4>
          <p 
            className="mb-4" 
            style={{ 
              color: '#6F6F6F',
              fontSize: "1.05rem"
            }}
          >
            Join thousands of tourists who have already discovered the magic of Laguna
          </p>
          <div className="d-flex flex-wrap justify-content-center gap-3">
            <a 
              href="/signup/tourist" 
              className="btn btn-lg px-5 py-3 fw-semibold"
              style={{
                background: 'linear-gradient(135deg, #5B3FE3 0%, #7A63F6 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '50px',
                boxShadow: '0 8px 25px rgba(91, 63, 227, 0.35)',
                fontFamily: "'Poppins', sans-serif",
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 12px 35px rgba(91, 63, 227, 0.45)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 25px rgba(91, 63, 227, 0.35)';
              }}
            >
              🧳 Start Exploring
            </a>
            <a 
              href="/signup/guide" 
              className="btn btn-lg px-5 py-3 fw-semibold"
              style={{
                background: 'transparent',
                borderWidth: '2px',
                borderRadius: '50px',
                color: '#FFD24D',
                borderColor: '#FFD24D',
                fontFamily: "'Poppins', sans-serif",
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#FFD24D';
                e.target.style.color = '#2C2C2C';
                e.target.style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#FFD24D';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              🧭 Become a Guide
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default Features;
