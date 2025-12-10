import React, { useState, useEffect } from "react";

// 👉 Import images like your logo import
import img1 from "../../assets/Home_img.svg";
// import img2 from "../../assets/Home_img2.svg";
// import img3 from "../../assets/Home_img3.svg";
// import img4 from "../../assets/Home_img4.svg";

import "./newhome.css";

export default function Hero() {
  const images = [img1, img2, img3, img4];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const slide = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(slide);
  }, []);

  return (
    <section className="hero">

      <div className="hero-text">
        <h4>Access essential training resources</h4>

        <h1>
          Welcome to INEC <br />
          <span>Learning Management System</span>
        </h1>

        <p>
          Join a community dedicated to ensuring credible and transparent
          elections.
        </p>

        <button className="btn">View All Courses</button>
      </div>

      <div className="hero-img">
        <img src={images[index]} alt="inec img" />
      </div>

    </section>
  );
}

