import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import buttonClickSound from "../assets/button-click-sound.mp3";
import backgroundMusic from "../assets/game.mp3";
import valuehero from "../assets/valuehero.png";
import valuehero2 from "../assets/valuehero2.png";
import AudioComponent from "../components/Audio";
import { playSound } from "../utils/board";

const CreateGame: React.FC<{
  onSubmit: (name: string, sessionId: string) => void;
}> = ({ onSubmit }) => {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [emptyError, setEmptyError] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await playSound(buttonClickSound); // Click sound on submit

    if (!name) {
      setEmptyError("Kein Inhalt. Bitte geben Sie Ihren Namen ein.");
      return;
    }

    try {
      const response = await axios.post(
        "https://localhost:7144/Session/CreateSession",
        { name }
      );
      const sessionId = response.data.sessionId;
      if (sessionId) {
        setSessionId(sessionId);
        onSubmit(name, sessionId);
        const joinLink = `http://localhost:5173/#/join/${sessionId}`;
        setLink(joinLink);
        setLoading(true);
        setLoadingText("Warten auf weitere Spieler...");
        pollForPlayers(sessionId);
      } else {
        throw new Error("Invalid response structure: No sessionId found");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to create session. Please try again.");
    }
  };

  const pollForPlayers = async (sessionId: string) => {
    const intervalId = setInterval(async () => {
      try {
        const response = await axios.get(
          `https://localhost:7144/Session/GetSessionById?sessionId=${sessionId}`
        );
        const players = response.data.players || [];
        if (players.length > 1) {
          clearInterval(intervalId);
          setLoading(false);
          setLoadingText(null);
          alert("Ein neuer Spieler ist dem Spiel beigetreten!");
        }
      } catch (err) {
        console.error("Error while polling for players:", err);
      }
    }, 4000);
  };

  const copyToClipboard = async () => {
    await playSound(buttonClickSound); // Click sound on copy
    if (link) {
      navigator.clipboard
        .writeText(link)
        .then(() => {
          alert("Link copied to clipboard");
        })
        .catch((err) => {
          console.error("Failed to copy: ", err);
        });
    }
  };

  const startGame = async () => {
    await playSound(buttonClickSound); // Click sound on start
    if (sessionId) {
      try {
        await axios.post(`https://localhost:7144/Session/StartGame`, {
          sessionId,
        });
        navigate(`/game/${sessionId}`);
      } catch (err) {
        console.error("Failed to start game:", err);
        setError("Failed to start the game. Please try again.");
      }
    }
  };

  return (
    <>
      <div className="hero min-h-screen bg-base-200">
        <div className="hero-content text-center">
          <div className="">
            <div className="title-wrapper mb-8 floating">
              <div className="fixed w-full hero-img mb-20">
                <img className="w-2/4 max-w-72 opacity-75" src={valuehero} />
              </div>
            </div>
            <div className="title-wrapper mb-12 floating">
              <h1 className="sweet-title">
                <span data-text="Create Game">Create Game</span>
              </h1>
            </div>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col items-center gap-4"
            >
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setEmptyError(null); // Reset empty error when text is entered
                }}
                placeholder="DEIN NAME"
                className={`input-kave-btn `}
                required
              />

              <button
                type="submit"
                className={`kave-btn ${name ? "" : "empty"}`}
              >
                <span className="kave-line"></span>
                Bestätigen
              </button>
              {emptyError && <p className="mt-4 text-red-500">{emptyError}</p>}
              {error && <p className="mt-4 text-red-500">{error}</p>}
              {link && (
                <button
                  type="submit"
                  onClick={copyToClipboard}
                  className={`kave-btn ${name ? "" : "empty"}`}
                >
                  Copy Link
                </button>
              )}
            </form>

            {loading && (
              <div className="mt-4 text-white">
                <p>{loadingText}</p>
                <div className="w-full h-2 bg-gray-200 rounded">
                  <div className="w-1/2 h-full bg-blue-500 rounded animate-pulse"></div>
                </div>
              </div>
            )}

            {!loading && sessionId && (
              <button
                onClick={startGame}
                className={`kave-btn ${sessionId ? "active" : "empty"}`}
                style={{ marginTop: "17px" }}
              >
                <span className="kave-line"></span>
                Starte Spiel
              </button>
            )}
          </div>
        </div>
      </div>

      <AudioComponent
        onAudioEnd={() => {}}
        path={backgroundMusic}
        volume={0.005}
      />
    </>
  );
};

export default CreateGame;
