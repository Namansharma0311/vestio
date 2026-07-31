import React, { useState, useEffect } from "react";

const IMAGES = [
  "/backgrounds/signin-1.jpg",
  "/backgrounds/signin-2.jpg",
  "/backgrounds/signin-3.jpg",
  "/backgrounds/signin-4.jpg",
];

const SLIDE_INTERVAL = 5000;

export default function ImageSlideshowBg() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % IMAGES.length);
    }, SLIDE_INTERVAL);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full">
      {IMAGES.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
          style={{ opacity: i === index ? 1 : 0 }}
        />
      ))}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0, 0, 0, 0.35)" }}
      />
    </div>
  );
}
