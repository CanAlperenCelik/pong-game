import React, { useEffect, useState } from "react";

interface CountdownOverlayProps {
  onCountdownComplete: () => void;
}

const CountdownOverlay: React.FC<CountdownOverlayProps> = ({
  onCountdownComplete,
}) => {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      const startTimer = setTimeout(() => {
        setCountdown(-1); // Set countdown to -1 to indicate countdown is over
        onCountdownComplete();
      }, 1000); // Delay to show "Start!" before completing
      return () => clearTimeout(startTimer);
    }
  }, [countdown, onCountdownComplete]);

  return (
    countdown !== -1 && (
      <div className="countdown-bg">
        <div className="hero-content text-center flex flex-col items-center">
          <div className="mb-12 floating">
            <h1 className="sweet-title">
              <span data-text={countdown > 0 ? countdown : "Start!"}>
                {countdown > 0 ? countdown : "Start!"}
              </span>
            </h1>
          </div>
        </div>
      </div>
    )
  );
};

export default CountdownOverlay;
