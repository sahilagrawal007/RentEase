import React from "react";
import "./contactPage.scss";

const ContactPage = () => {
  return (
    <section className="contact-section">
      <div>
        <center>
          <h2>Get In Touch</h2>
        </center>
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
      </div>
    </section>
  );
};

export default ContactPage;
