import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const EnterSessionId: React.FC = () => {
  const [sessionId, setSessionId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [isSessionValid, setIsSessionValid] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sessionId) {
      try {
        const response = await axios.get(
          `https://localhost:7144/Session/GetSessionById?sessionId=${sessionId}`
        );
        console.log("Response data:", response.data); // Überprüfe die Antwortdaten

        // Überprüfe, ob die Session existiert
        if (response.data) {
          setIsSessionValid(true); // Session-ID ist gültig
          setError(null);
        } else {
          setError("Invalid session ID. Please check the ID and try again.");
        }
      } catch (err) {
        console.error("API call failed:", err); // Loggt Fehler zur Analyse
        setError("Failed to fetch session data. Please try again later.");
      }
    }
  };

  const handlePlayerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName && sessionId) {
      try {
        await axios.post(
          `https://localhost:7144/api/Player/JoinRoom?sessionId=${sessionId}`,
          { playername: playerName }
        );
        navigate(`/game/${sessionId}`);
      } catch (err) {
        setError("Failed to join the game. Please try again.");
      }
    }
  };

  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content text-center">
        <div className="">
          <div className="title-wrapper mb-12 floating">
            <h1 className="sweet-title">
              <span data-text="Join Game">Join Game</span>
            </h1>
          </div>

          <form onSubmit={handleSessionSubmit}>
            <label className="block mb-4">
              <input
                type="text"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                placeholder="SPIEL ID"
                className={`input-kave-btn ${error ? "border-red-500" : ""}`}
                required
              />
            </label>
            <button
              type="submit"
              className={`kave-btn ${sessionId ? "" : "empty"}`}
            >
              <span className="kave-line"></span>
              Bestätigen
            </button>
            {error && <p className="mt-4 text-red-500">{error}</p>}
          </form>

          {isSessionValid && (
            <form onSubmit={handlePlayerSubmit} className="mt-6">
              <label className="block mb-4">
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="DEIN NAME"
                  className={`input-kave-btn `}
                  required
                />
              </label>
              <button
                type="submit"
                className={`kave-btn ${playerName ? "" : "empty"}`}
              >
                <span className="kave-line"></span>
                Join Game
              </button>
              {error && <p className="mt-4 text-red-500">{error}</p>}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnterSessionId;
