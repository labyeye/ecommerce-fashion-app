import React from "react";

// SVGs for mountain, sunset, and beach
const svgs = [
  // Mountain
  <svg key="mountain" className="animate-spin-slow" width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 35L20 10L35 35H5Z" fill="#8B7355" stroke="#B5A084" strokeWidth="2" />
    <circle cx="20" cy="10" r="3" fill="#D4CFC7" />
  </svg>,
  // Sunset
  <svg key="sunset" className="animate-spin-slow" width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="25" r="10" fill="#FDB813" />
    <rect x="5" y="30" width="30" height="5" fill="#F7C873" />
  </svg>,
  // Beach
  <svg key="beach" className="animate-spin-slow" width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="20" cy="30" rx="15" ry="7" fill="#F7C873" />
    <path d="M10 30C12 27 28 27 30 30" stroke="#FDB813" strokeWidth="2" />
    <circle cx="30" cy="20" r="3" fill="#8B7355" />
  </svg>
];

// Pick a random SVG each render
export default function LoadingMountainSunsetBeach({ text = "Loading..." }: { text?: string }) {
  const [index, setIndex] = React.useState(0);
  const [fade, setFade] = React.useState(true);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % svgs.length);
        setFade(true);
      }, 300); // fade out duration
    }, 1300); // total duration (fade out + visible)
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div
        style={{
          transition: 'opacity 0.3s',
          opacity: fade ? 1 : 0,
        }}
      >
        {svgs[index]}
      </div>
      <span className="mt-3 text-gray-500">{text}</span>
    </div>
  );
}

// Add this to your tailwind.config.js:
// theme: { extend: { animation: { 'spin-slow': 'spin 2s linear infinite' } } }
