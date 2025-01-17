import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Score, gamepad } from "../utils/types";
import { addGamePadListener, removeGamePadListener } from "../utils/gamepad";

let canGoBack = false;
const ShowScores: React.FC = () => {
  const [highscores, setHighscores] = useState<Score[]>([]);
  const navigate = useNavigate();

  const handleKeyPress = (event: KeyboardEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (event.key === " " && canGoBack) {
      navigate("/");
    }
  };

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const response = await axios.get("https://localhost:7144/Score");
        const scores = response.data;

        // Sortieren nach Score und Filtern der Top 10
        const sortedScores = scores
          .sort((a: Score, b: Score) => b.score - a.score)
          .slice(0, 10);
        setHighscores(sortedScores);
      } catch (error) {
        console.error("Error fetching high scores:", error);
      }
    };

    fetchScores();

    canGoBack = false;
    window.addEventListener("keydown", handleKeyPress);

    const gamePadHandler = (input: gamepad) => {
      if (input.type === "button" && input.pressed && canGoBack) {
        setTimeout(() => {
          navigate("/");
        }, 200);
        return;
      }
    };
    const padIndex = addGamePadListener(gamePadHandler);

    setTimeout(() => {
      canGoBack = true;
    }, 200);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      removeGamePadListener(gamePadHandler, padIndex);
    };
  }, [navigate]);

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-left flex-col bg-base-300 p-4 rounded-lg min-w-96">
        <div className="title-wrapper mb-12 floating">
          <h1 className="sweet-title">
            <span data-text="Bestenliste">Bestenliste</span>
          </h1>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="table w-full">
            <thead>
              <tr>
                <th>#</th>
                <th>Team</th>
                <th>Punkte</th>
              </tr>
            </thead>
            <tbody className="text-xl">
              {highscores.map((score, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{score.name}</td>
                  <td>{score.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ShowScores;
