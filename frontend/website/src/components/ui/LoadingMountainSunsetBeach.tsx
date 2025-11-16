import React from "react";
import p1 from "../../assets/images/hat.webp";
import p2 from "../../assets/images/luggage.webp";
import p3 from "../../assets/images/resort.webp";
import p4 from "../../assets/images/slippers.webp";
import p5 from "../../assets/images/sunglasses.webp";
const svgs = [
  <img
    src={p1}
    alt="hat"
    className="w-16 h-16 md:w-24 md:h-24 object-contain"
  />,
  <img
    src={p2}
    alt="luggage"
    className="w-16 h-16 md:w-24 md:h-24 object-contain"
  />,
  <img
    src={p3}
    alt="resort"
    className="w-16 h-16 md:w-24 md:h-24 object-contain"
  />,
  <img
    src={p4}
    alt="slippers"
    className="w-16 h-16 md:w-24 md:h-24 object-contain"
  />,
  <img
    src={p5}
    alt="sunglasses"
    className="w-16 h-16 md:w-24 md:h-24 object-contain"
  />,
];

type Props = {
  text?: string;
  loop?: boolean;
  onComplete?: () => void;
};

export default function LoadingMountainSunsetBeach({
  text = "Loading...",
  loop = true,
  onComplete,
}: Props) {
  const [index, setIndex] = React.useState(0);
  const [fade, setFade] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    const visibleDuration = 200;
    const fadeDuration = 300;
    const total = visibleDuration + fadeDuration;

    if (loop) {
      const interval = setInterval(() => {
        setFade(false);
        setTimeout(() => {
          setIndex((prev) => (prev + 1) % svgs.length);
          setFade(true);
        }, fadeDuration);
      }, total);
      return () => clearInterval(interval);
    }
    let i = 0;
    const run = () => {
      if (!mounted) return;
      setFade(true);
      setIndex(i);
      setTimeout(() => {
        setFade(false);
        setTimeout(() => {
          i += 1;
          if (i < svgs.length) {
            run();
          } else {
            if (onComplete) onComplete();
          }
        }, fadeDuration);
      }, visibleDuration);
    };
    run();
    return () => {
      mounted = false;
    };
  }, [loop, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div
        style={{
          transition: "opacity 0.25s",
          opacity: fade ? 1 : 0,
        }}
      >
        {svgs[index]}
      </div>
      <span className="mt-3 text-gray-500">{text}</span>
    </div>
  );
}
