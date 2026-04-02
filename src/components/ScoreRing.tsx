import { useEffect, useState } from "react";
import type { LetterGrade } from "@/lib/scoring/types";

interface ScoreRingProps {
  score: number;
  grade: LetterGrade;
  size?: number;
}

function gradeColor(grade: LetterGrade) {
  switch (grade) {
    case "A": return "hsl(142, 71%, 45%)";
    case "B": return "hsl(142, 50%, 55%)";
    case "C": return "hsl(48, 96%, 53%)";
    case "D": return "hsl(25, 95%, 53%)";
    case "F": return "hsl(0, 84%, 60%)";
  }
}

export default function ScoreRing({ score, grade, size = 180 }: ScoreRingProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (animatedScore / 100) * circumference;
  const color = gradeColor(grade);

  useEffect(() => {
    let frame: number;
    const duration = 1200;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setAnimatedScore(Math.round(eased * score));
      if (t < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          className="transition-all duration-100"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-bold text-foreground">{animatedScore}</span>
        <span className="text-lg font-semibold" style={{ color }}>
          {grade}
        </span>
      </div>
    </div>
  );
}
