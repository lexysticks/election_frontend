import React from "react";
import "./Footer.css";
import { FaFacebook, FaInstagram, FaWhatsapp, FaVoteYea } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export default function Footer() {
  return (
    <footer className="election-footer">

      <div className="footer-wrapper">
        
        <div className="footer-section">
          <h2><FaVoteYea /> NATIONAL ELECTION PORTAL</h2>
          <p>
            Our mission is to promote fair electoral processes, 
            protect citizens’ choices and uphold transparency.
          </p>
        </div>

        <div className="footer-section">
          <h3>Quick Navigation</h3>
          <ul>
            <li><a href="/dashboard">Dashboard</a></li>
            <li><a href="/candidates">Candidates</a></li>
            <li><a href="/results">Results</a></li>
            <li><a href="/register">Register</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Important Links</h3>
          <ul>
            <li><a href="#">About Elections</a></li>
            <li><a href="#">Rules & Guidelines</a></li>
            <li><a href="#">Voter Rights</a></li>
            <li><a href="#">Data Privacy</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Contact Support</h3>
          <p>Email: support@election.gov.ng</p>
          <p>Phone: +234 000 111 222</p>
          <p>Mon – Fri | 9AM – 5PM</p>
        </div>

        <div className="footer-section">
          <h3>Newsletter</h3>
          <input type="text" placeholder="Enter your email" />
          <button>Subscribe</button>

          <div className="social-icons">
            <a><FaFacebook /></a>
            <a><FaInstagram /></a>
            <a><FaXTwitter /></a>
            <a><FaWhatsapp /></a>
          </div>
        </div>

      </div>

      <div className="bottom-line">
        © 2025 National Election System — Powered by Digital Democracy
      </div>
    </footer>
  );
}
