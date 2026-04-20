import { useState, useEffect } from "react";
import "../../styles/typewriter.css";
export function Typewriter({ text, speed = 70 }) {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    let i = 0;

    const interval = setInterval(() => {
      setDisplayText(text.substring(0, i + 1));
      i++;

      if (i === text.length) clearInterval(interval);
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return <span className="typewriter">{displayText}</span>;
}