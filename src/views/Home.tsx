import buttonClickSound from "../assets/button-click-sound.mp3";
import { HomeProps, gamepad } from "../utils/types";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import backgroundMusic from "../assets/game.mp3";
import valuehero from "../assets/valuehero.png";
import valuehero2 from "../assets/valuehero2.png";
import AudioComponent from "../components/Audio";
import {
  addGamePadListener,
  isDownPressed,
  isLeftPressed,
  isRightPressed,
  isUpPressed,
  removeGamePadListener,
} from "../utils/gamepad";
import { playSound } from "../utils/board";

const state: any = {
  activeIndex: 0,
  gameMode: 0,
};
const Home: React.FC<HomeProps> = ({}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [gameMode, setGameMode] = useState(
    localStorage.getItem("gameMode")
      ? parseInt(localStorage.getItem("gameMode") || "0")
      : 0
  );
  const navigate = useNavigate();

  const goToGame = async () => {
    await playSound(buttonClickSound);
    navigate("/create-game");
  };
  const joinGame = async () => {
    await playSound(buttonClickSound);
    navigate("/enter-session");
  };

  const goToHighscore = async () => {
    await playSound(buttonClickSound);
    navigate("/scores");
  };

  const handlePress = () => {
    switch (state.activeIndex) {
      case 0:
        goToGame();
        break;
      case 1:
        goToHighscore();
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    state.activeIndex = activeIndex;
    state.gameMode = gameMode;

    localStorage.setItem("gameMode", gameMode.toString());
  }, [activeIndex, gameMode]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();

      switch (event.key) {
        case "ArrowUp":
          const newIndex = state.activeIndex > 0 ? state.activeIndex - 1 : 0;
          setActiveIndex(newIndex);
          break;
        case "ArrowDown":
          const newIndexD = state.activeIndex < 1 ? state.activeIndex + 1 : 1;
          setActiveIndex(newIndexD);
          break;
        case "ArrowRight":
          const newIndexR = state.gameMode == 0 ? state.gameMode + 1 : 0;
          setGameMode(newIndexR);
          break;
        case " ":
          handlePress();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    const handleGamepad = (input: gamepad) => {
      if (input.type === "button" && input.pressed) {
        handlePress();
        return;
      }

      if (isDownPressed(input)) {
        const newIndex = state.activeIndex > 0 ? state.activeIndex - 1 : 0;
        setActiveIndex(newIndex);
      }

      if (isUpPressed(input)) {
        const newIndexD = state.activeIndex < 1 ? state.activeIndex + 1 : 1;
        setActiveIndex(newIndexD);
      }

      if (isRightPressed(input)) {
        const newIndexR = state.gameMode == 0 ? state.gameMode + 1 : 0;
        setGameMode(newIndexR);
      }

      if (isLeftPressed(input)) {
        const newIndexR = state.gameMode == 1 ? state.gameMode - 1 : 0;
        setGameMode(newIndexR);
      }
    };

    const padIndex = addGamePadListener(handleGamepad);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
      removeGamePadListener(handleGamepad, padIndex);
    };
  }, []);

  return (
    <>
      <div className="hero min-h-screen bg-base-200">
        <div className="hero-content text-center">
          <div className="">
            <div className="title-wrapper mb-12 floating">
              <div className="fixed w-full hero-img mb-20">
                <img
                  className="w-2/4 max-w-72 opacity-75"
                  src={gameMode == 0 ? valuehero2 : valuehero}
                />
              </div>
              <h1
                className={
                  (gameMode == 0 ? "sweet-title-purple" : "sweet-title-mixed") +
                  " sweet-title "
                }
              >
                <span data-text="#ValueHero">#ValueHero</span>
              </h1>
            </div>

            <div className="flex flex-col gap-4">
              <button
                className={(activeIndex === 0 ? "active" : "") + " kave-btn"}
                onClick={goToGame}
              >
                <span className="kave-line"></span>
                SPIEL ERSTELLEN!
              </button>
              {/* <button
                className={(activeIndex === 1 ? 'active' : '') + ' kave-btn'}
                onClick={joinGame}
              >
                <span className="kave-line"></span>
                SPIEL BEITRTEN!
              </button> */}
              <button
                className={(activeIndex === 1 ? "active" : "") + " kave-btn"}
                onClick={goToHighscore}
              >
                <span className="kave-line"></span>
                Bestenliste
              </button>
            </div>
          </div>
        </div>
        <AudioComponent
          onAudioEnd={() => {}}
          path={backgroundMusic}
          volume={0.005}
        />
      </div>
    </>
  );
};

export default Home;
