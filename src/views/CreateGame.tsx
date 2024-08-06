import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import buttonClickSound from "../assets/button-click-sound.mp3";
import backgroundMusic from "../assets/game.mp3";
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
  const [showInviteMessage, setShowInviteMessage] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await playSound(buttonClickSound);

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
        setShowInviteMessage(true);
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
          `https://localhost:7144/Session/GetSessionById/${sessionId}`
        );
        console.log("API Response:", response.data);

        const players = response.data.players || [];
        console.log("Number of players:", players.length);

        if (players.length > 1) {
          clearInterval(intervalId);
          setLoading(false);
          setLoadingText(null);
          alert("Ein neuer Spieler ist dem Spiel beigetreten!");
        }
      } catch (err) {
        console.error("Error while polling for players:", err);
      }
    }, 2000);
  };

  const copyToClipboard = async () => {
    await playSound(buttonClickSound);
    if (link) {
      navigator.clipboard
        .writeText(link)
        .then(() => alert("Link copied to clipboard"))
        .catch((err) => console.error("Failed to copy: ", err));
    }
  };

  const startGame = async () => {
    await playSound(buttonClickSound);
    if (sessionId) {
      try {
        await axios.post(`https://localhost:7144/Session/Startgame`, {
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
        <div className="hero-content text-center flex flex-col items-center">
          <div className="mb-12 floating">
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
                setEmptyError(null);
              }}
              placeholder="DEIN NAME"
              className="input-kave-btn"
              required
            />
            <button type="submit" className={`kave-btn ${name ? "" : "empty"}`}>
              <span className="kave-line"></span>
              Bestätigen
            </button>
            {emptyError && <p className="mt-4 text-red-500">{emptyError}</p>}
            {error && <p className="mt-4 text-red-500">{error}</p>}
            {link && (
              <button
                type="button"
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

          {showInviteMessage && (
            <div className="hero-content text-left flex-col bg-base-300 p-4 rounded-lg min-w-96 absolute bottom-10 left-10">
              <p>Lade deine Freunde über Teams ein 😊</p>
            </div>
          )}
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
