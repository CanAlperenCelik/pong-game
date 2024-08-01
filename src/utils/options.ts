// speedOptions.js

interface SpeedProp {
  [key: string]: { velocityX: number; velocityY: number };
}

const speedOptions: SpeedProp = {
  slow: { velocityX: 1.5, velocityY: 1.2 },
  moderate: { velocityX: 1.5, velocityY: 1.75 },
  fast: { velocityX: 2, velocityY: 1.5 },
  sonic: { velocityX: 3, velocityY: 2.5 }
};

const timeToSpeed = (seconds: number) => {
  if (seconds < 10) return speedOptions["slow"];
  if (seconds < 30) return speedOptions["moderate"];
  if (seconds < 40) return speedOptions["fast"];
  return speedOptions["sonic"];
}

export type values = "Verbundenheit" | "Vertrauen" | "Bodenständigkeit" | "Respekt" | "Leistung";

export { speedOptions, timeToSpeed };