import React from "react";
import { Link } from "react-router-dom";
import "./aboutPage.scss";
import Navbar from "../../components/navbar/Navbar";

const About = () => {
  return (
    <div className="about-container">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>About RentEase</h1>
          <p>
            We're dedicated to making the rental process seamless, transparent, and stress-free for
            everyone.
          </p>
          <div className="hero-buttons">
            <Link to="/contact" className="btn primary-btn">
              Contact Us
            </Link>
            <Link to="/" className="btn secondary-btn">
              View Listings
            </Link>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="story-section">
        <div className="story-content">
          <div className="story-text">
            <h2>Making Real Estate Simple Since 2018</h2>
            <p>
              RentEase was founded to transform the rental process into a seamless experience...
            </p>
            <ul>
              <li>✔ 12,000+ Listings</li>
              <li>✔ Verified Properties</li>
              <li>✔ 24/7 Support</li>
              <li>✔ Secure Transactions</li>
            </ul>
          </div>
          <img
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa"
            alt="Modern Apartment"
          />
        </div>
      </section>

      {/* Our Mission */}
      <section className="mission-section">
        <h2>Why We Do What We Do</h2>
        <p>Our mission is to make finding your next home a joyful journey...</p>
        <div className="mission-cards">
          <div className="mission-card">
            <h3>For Everyone</h3>
            <p>Designed to meet your unique housing needs.</p>
          </div>
          <div className="mission-card">
            <h3>Save Time</h3>
            <p>Find your ideal property faster.</p>
          </div>
          <div className="mission-card">
            <h3>Trust & Security</h3>
            <p>Every listing is verified for accuracy.</p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <h2>Get In Touch</h2>
        <div className="contact-info">
          <div>
            <h3>📍 Address</h3>
            <p>1234 Property Lane, Realtown</p>
          </div>
          <div>
            <h3>📞 Phone</h3>
            <p>(555) 123-4567</p>
          </div>
          <div>
            <h3>📧 Email</h3>
            <p>hello@rentease.com</p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <h2>Ready to Find Your Perfect Rental?</h2>
        <Link to="/" className="btn primary-btn">
          Browse Properties
        </Link>
      </section>
    </div>
  );
};

export default About;
