import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // add this at the top

import AOS from "aos";
import Footer from "../Footr/footeer";
import "aos/dist/aos.css";

import "./Home.css";

// 👉 HERO IMAGE
import heroImg from "../../assets/Home_img.svg";
import login from "../../assets/login.jpeg";

// 👉 COURSE IMAGES
import spoImg from "../../assets/thumb.png";
import collationImg from "../../assets/thumb2.png";
import poImg from "../../assets/thumb3.png";

export default function Home() {
  // ================= HERO SLIDER ====================
  const images = [heroImg];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  useEffect(() => {
    const slide = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(slide);
  }, [images.length]);

  // ================= COURSE DATA ====================
  const courseData = [
    { id: 1, title: "Supervisory Presiding Officer (SPO) Training", label: "Supervisory Presiding Officer", lessons: 70, students: 1414, image: spoImg },
    { id: 2, title: "Collation Officer (CO) Training", label: "Collation Officer", lessons: 70, students: 43, image: collationImg },
    { id: 3, title: "Presiding Officer and Assistant Presiding Officer (PO/APO) Training", label: "Presiding Officer and Assistant Presiding Officer", lessons: 70, students: 5197, image: poImg },
  ];

  // ================= STATS COUNTERS ====================
  const [totalVoters, setTotalVoters] = useState(0);
  const [pollingUnits, setPollingUnits] = useState(0);
  const [parties, setParties] = useState(0);

  useEffect(() => {
    const duration = 3000;
    const steps = 60;
    const voterIncrement = 93469008 / steps;
    const unitIncrement = 176846 / steps;
    const partyIncrement = 19 / steps;

    let currentStep = 0;

    const counter = setInterval(() => {
      currentStep++;
      setTotalVoters(Math.min(Math.floor(voterIncrement * currentStep), 93469008));
      setPollingUnits(Math.min(Math.floor(unitIncrement * currentStep), 176846));
      setParties(Math.min(Math.floor(partyIncrement * currentStep), 19));

      if (currentStep >= steps) clearInterval(counter);
    }, duration / steps);

    return () => clearInterval(counter);
  }, []);

  return (
    <>
      {/* ================= HERO SECTION ================= */}

      <section className="hero">
 

  <div className="hero-text" data-aos="fade-right">
    <h4>Access essential election resources</h4>
    <h1>
      Welcome to INEC <br />
      <span>Voting Management System</span>
    </h1>
    <p>
      Empowering citizens with reliable information to support free, fair, and 
      credible elections across Nigeria.
    </p>
    <p>
      <Link to="/Login" className="btn">Login</Link>
    </p>
    <p>
      <Link to="/Result" className="btn">Result</Link>
    </p>
  </div>

   <div className="hero-img" data-aos="fade-left">
    <img src={images[index]} alt="INEC illustration" />
  </div>
</section>

    

      

      {/* ================= STATS SECTION ================= */}
      <div className="app-container">
        <div className="stats-section">
          <div className="stat-card">
            <h2>{totalVoters.toLocaleString()}</h2>
            <p>Total Voters Registered</p>
          </div>

          <div className="stat-card">
            <h2>{pollingUnits.toLocaleString()}</h2>
            <p>Polling Units in Nigeria</p>
          </div>

          <div className="stat-card">
            <h2>{parties.toLocaleString()}</h2>
            <p>Registered Political Parties</p>
          </div>

          <div className="next-election-card">
            <h3>Anambra Governorship</h3>
            <p>Election – 8th Nov, 2025</p>
            <h3 style={{ marginTop: "1rem" }}>FCT Area Council Election</h3>
            <p>21st Feb, 2026</p>

            <button className="next-btn">Next Election</button>
          </div>
        </div>

        {/* ================= COUNTDOWN SECTION ================= */}
        <div className="countdown-section">
          <h3 className="countdown-title">ANAMBRA GOVERNORSHIP ELECTION</h3>

          <div className="countdown-grid">
            <div className="countdown-box">
              <h2>00</h2><p>Days</p>
            </div>
            <div className="countdown-box">
              <h2>00</h2><p>Hours</p>
            </div>
            <div className="countdown-box">
              <h2>00</h2><p>Minutes</p>
            </div>
            <div className="countdown-box">
              <h2>00</h2><p>Seconds</p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= COURSES SECTION ================= */}
      <div className="courses-page">
        <div className="breadcrumb">📘 Courses</div>
        <h1 className="heading">Explore Featured Courses</h1>

        <p className="sub-heading">
          You'll find something to spark your curiosity and enhance
        </p>

        <div className="category-wrapper">
          <button className="category-btn active">All Study Pathways</button>
          <button className="category-btn">Presiding Officer and Assistant Presiding Officer</button>
          <button className="category-btn">Collation Officer</button>
          <button className="category-btn">Supervisory Presiding Officer</button>
        </div>

        <div className="course-grid">
          {courseData.map((course, idx) => (
            <div className="course-card" key={course.id}>
              <div className="course-img">
                <img src={course.image} alt={course.title} />
              </div>

              <span className="course-label">{course.label}</span>

              <div className="course-meta">
                <span>📚 {course.lessons} Lessons</span>
                <span>👥 {course.students} Students</span>
              </div>

              <h3 className="course-title">{course.title}</h3>
            </div>
          ))}
        </div>
      </div>

      {/* ⭐ THE REAL FOOTER */}
      <Footer />
    </>
  );
}
