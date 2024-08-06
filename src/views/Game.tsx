import React, { useEffect, useRef, useState } from "react";
import {
  BaseSettings,
  MultiplePlayerModeProps,
  ball,
  gamepad,
  player,
} from "../utils/types";
import { determineBoardWidth, playSound } from "../utils/board";
import {
  addGamePadListener,
  isDownPressed,
  isPressReleased,
  isUpPressed,
  removeGamePadListener,
} from "../utils/gamepad";
import { values } from "../utils/options";
import QuestionDialogCmp, {
  askedQuestionsSet,
} from "../components/QuestionDialog";

import questionSound from "../assets/questions.mp3";
import bubblePicture from "../assets/ball.png";
import BodenStaendigkeitBallImg from "../assets/b.png";
import LeistungBallImg from "../assets/l.png";
import RespektBallImg from "../assets/r.png";
import VerbundenheitBallImg from "../assets/vbh.png";
import Vertrauen from "../assets/v.png";
import hitSound from "../assets/Paddle Ball Hit Sound Effect HD.mp3";
import goalSound from "../assets/goal.mp3";
import backgroundMusic from "../assets/game.mp3";
import CountdownOverlay from "./CountdownOverlay";

const INITIAL_GAME_DEFAULTS: BaseSettings = {
  velocityXIncrement: 1.2,
  baseVelocityX: 2.5,
  baseVelocityY: 1.7,
  boardHeightDivisor: 1.7,
  maxBoardWidth: 700,
  maxLife: 2,
  maxVelocityX: 7,
  moveSpeed: 6,
  playerHeight: 60,
  playerWidth: 10,
  key2Down: "s",
  key2Up: "w",
  keyDown: "ArrowDown",
  keyUp: "ArrowUp",
  volume: 0.06,
  questionSeconds: 20,
  pushInterval: 160,
};

export let gameDefaults: BaseSettings = { ...INITIAL_GAME_DEFAULTS };

export const assignGameDefaults = (settings: BaseSettings) => {
  gameDefaults = settings;
};

let animationFrame: number | null = null;
let pauseState = true;
const GameField: React.FC<MultiplePlayerModeProps> = () => {
  const boardWidth = determineBoardWidth();
  const boardHeight = boardWidth / gameDefaults.boardHeightDivisor;
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const boardRef = useRef<HTMLCanvasElement | null>(null);
  const [gameEffect, setGameEffect] = useState<
    "shake" | "smallerPad" | "blackout" | "none" | "velocityYChange"
  >("none");

  const [currentValue, setCurrentValue] = useState<values>("Vertrauen");
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isQuestion, setIsQuestion] = useState<boolean>(false);
  const [isBackgroundMusicPlaying, setBackgroundMusicPlaying] =
    useState<boolean>(false);
  const [timer, setTimer] = useState<number>(0);
  const [life, setLife] = useState<number>(gameDefaults.maxLife);
  const timerRef = useRef<number | null>(null);
  const scoreRef = useRef<number>(0);
  const isSpawningBubbleRef = useRef<boolean>(false);
  const hasRunRef = useRef<boolean>(false);

  const backgroundAudio = new Audio(backgroundMusic);
  backgroundAudio.volume = 0.07;

  const player1: player = {
    x: 2,
    y: boardHeight / 2,
    width: gameDefaults.playerWidth,
    height: gameDefaults.playerHeight,
    velocityY: 0,
    stopPlayer: false,
  };

  const player2: player = {
    x: boardWidth - gameDefaults.playerWidth - 2,
    y: boardHeight / 2,
    width: gameDefaults.playerWidth,
    height: gameDefaults.playerHeight,
    velocityY: 0,
    stopPlayer: false,
  };

  const ball: ball = {
    x: boardWidth / 2,
    y: boardHeight / 2,
    width: 32,
    height: 32,
    velocityX: gameDefaults.baseVelocityX,
    velocityY: gameDefaults.baseVelocityY,
  };

  const bubbleRef = useRef<any>(null);

  useEffect(() => {
    if (hasRunRef.current) return;
    backgroundAudio.play().then(() => (hasRunRef.current = true));
    askedQuestionsSet.clear();

    return () => {
      if (hasRunRef.current) {
        backgroundAudio.pause();
        backgroundAudio.currentTime = 0;
      }
    };
  }, []);

  useEffect(() => {
    if (life <= 0) {
      window.location.href = `/#/enter-score?score=${scoreRef.current}`;
    }
  }, [life]);

  useEffect(() => {
    setCurrentValue(currentValue);

    switch (currentValue) {
      case "Bodenständigkeit":
        setGameEffect("shake");
        break;
      case "Leistung":
        setGameEffect("smallerPad");
        break;
      case "Respekt":
        setGameEffect("velocityYChange");
        break;
      case "Verbundenheit":
        setGameEffect("blackout");
        break;
      case "Vertrauen":
        setGameEffect("none");
        break;
    }
  }, [currentValue]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !isPaused) {
        triggerPause();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    pauseState = isPaused;

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isPaused]);

  useEffect(() => {
    boardRef.current = document.getElementById("board") as HTMLCanvasElement;
    if (boardRef.current) {
      boardRef.current.height = boardHeight;
      boardRef.current.width = boardWidth;
      contextRef.current = boardRef.current.getContext(
        "2d"
      ) as CanvasRenderingContext2D;
    }

    return () => {
      cleanupGame();
    };
  }, []);

  const initializeGame = () => {
    startTimer();
    resetScores();
    setIsPaused(false);
    isSpawningBubbleRef.current = false;
    animationFrame = requestAnimationFrame(animate);
    window.addEventListener("keydown", movePlayer);
    window.addEventListener("keyup", stopMovingPlayer);

    const gamePadHandler = createGamePadHandler();
    const padIndex = addGamePadListener(gamePadHandler);
    startBubbleTimer();

    return () => {
      removeGamePadListener(gamePadHandler, padIndex);
    };
  };

  const cleanupGame = () => {
    resetTimer();
    window.removeEventListener("keydown", movePlayer);
    window.removeEventListener("keyup", stopMovingPlayer);
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  };

  const startTimer = () => {
    timerRef.current = window.setInterval(() => {
      if (!isPaused) {
        setTimer((prevTimer) => prevTimer + 1);
      }
    }, 1000);
  };

  const resetTimer = () => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
    }
    setTimer(0);
  };

  const resetScores = () => {
    scoreRef.current = 0;
  };

  const triggerPause = () => {
    setIsPaused((prevIsPaused) => !prevIsPaused);
  };

  const movePlayer = (e: KeyboardEvent) => {
    handlePlayerMovement(e, true);
  };

  const stopMovingPlayer = (e: KeyboardEvent) => {
    handlePlayerMovement(e, false);
  };

  const handlePlayerMovement = (e: KeyboardEvent, isKeyDown: boolean) => {
    const velocity = isKeyDown ? gameDefaults.moveSpeed : 0;

    if (e.key === gameDefaults.key2Up) {
      player1.velocityY = -velocity;
      player1.stopPlayer = !isKeyDown;
    } else if (e.key === gameDefaults.key2Down) {
      player1.velocityY = velocity;
      player1.stopPlayer = !isKeyDown;
    }

    if (e.key === gameDefaults.keyUp) {
      player2.velocityY = -velocity;
      player2.stopPlayer = !isKeyDown;
    } else if (e.key === gameDefaults.keyDown) {
      player2.velocityY = velocity;
      player2.stopPlayer = !isKeyDown;
    }

    if (e.key === "p" || e.key === "Escape") {
      triggerPause();
    }
  };

  const createGamePadHandler = () => {
    return (input: gamepad) => {
      const isPlayer1 = input.gamepadIndex === 0;
      const isPlayer2 = input.gamepadIndex === 1;

      if (isPressReleased(input)) {
        if (isPlayer1) player1.stopPlayer = true;
        if (isPlayer2) player2.stopPlayer = true;
      }

      if (isDownPressed(input)) {
        if (isPlayer1) player1.velocityY = -gameDefaults.moveSpeed;
        if (isPlayer2) player2.velocityY = -gameDefaults.moveSpeed;
      }

      if (isUpPressed(input)) {
        if (isPlayer1) player1.velocityY = gameDefaults.moveSpeed;
        if (isPlayer2) player2.velocityY = gameDefaults.moveSpeed;
      }
    };
  };

  const animate = (): void => {
    animationFrame = requestAnimationFrame(animate);

    if (!pauseState && contextRef.current) {
      updateGameField();
    }
  };

  const updateGameField = () => {
    const context = contextRef.current!;
    context.clearRect(0, 0, boardWidth, boardHeight);

    drawPlayer(context, player1);
    drawPlayer(context, player2);

    ball.x += ball.velocityX;
    ball.y += ball.velocityY;
    drawBall(context);

    checkCollisions();
    updateBubblePosition();
    drawBubble();
  };

  const drawPlayer = (context: CanvasRenderingContext2D, player: player) => {
    context.fillStyle = "#fff";
    if (!outOfBound(player.y + player.velocityY)) {
      if (!player.stopPlayer) {
        player.y += player.velocityY;
      }
    }
    context.fillRect(
      player.x,
      player.y,
      player.width,
      player.height - (gameEffect === "smallerPad" ? 15 : 0)
    );
  };

  const drawBall = (context: CanvasRenderingContext2D) => {
    const ballImg = new Image();
    ballImg.src = determineBallPicture(currentValue);
    context.drawImage(ballImg, ball.x, ball.y, ball.width, ball.height);

    if (ball.y <= 0 || ball.y + ball.height >= boardHeight) {
      ball.velocityY *= ball.velocityY > 3 || ball.velocityY < -3 ? -1 : -1.05;
    }

    if (detectCollision(ball, player1)) {
      handleBallCollision(player1);
    } else if (detectCollision(ball, player2)) {
      handleBallCollision(player2);
    }

    if (ball.x < 0 || ball.x + ball.width > boardWidth) {
      handleGoal();
    }
  };

  const detectCollision = (a: any, b: any) => {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  };

  const handleBallCollision = (player: player) => {
    playSound(hitSound);

    if (player === player1 && ball.x <= player1.x + player1.width) {
      ball.velocityX *=
        ball.velocityX < -gameDefaults.maxVelocityX
          ? -1
          : -gameDefaults.velocityXIncrement;
    } else if (player === player2 && ball.x + ball.width >= player2.x) {
      ball.velocityX *=
        ball.velocityX > gameDefaults.maxVelocityX
          ? -1
          : -gameDefaults.velocityXIncrement;
    }

    if (gameEffect === "velocityYChange") {
      ball.velocityY = Math.random() * 3 + 1.5;
    }

    scoreRef.current += timer;
  };

  const handleGoal = () => {
    setLife((prevLife) => prevLife - 1);
    if (life > 0) {
      playSound(goalSound);
      resetBall();
    } else {
      setIsPaused(true);
    }
  };

  const resetBall = () => {
    ball.x = boardWidth / 2;
    ball.y = boardHeight / 2;
    ball.velocityX = gameDefaults.baseVelocityX;
    ball.velocityY = gameDefaults.baseVelocityY;
  };

  const outOfBound = (y: number) => {
    return y < 0 || y + player1.height > boardHeight;
  };

  const startBubbleTimer = () => {
    if (isSpawningBubbleRef.current) return;
    isSpawningBubbleRef.current = true;
    const spawnInterval = Math.random() * 5000 + 12000;
    setTimeout(spawnBubble, spawnInterval);
  };

  const spawnBubble = () => {
    if (bubbleRef.current) return;
    bubbleRef.current = {
      x: boardWidth / 2,
      y: (Math.random() * boardHeight) / 1.5 + 20,
      radius: 26,
      velocityX: ball.velocityX,
      velocityY: 1.2,
    };
  };

  const updateBubblePosition = () => {
    if (!bubbleRef.current) return;

    let newX = bubbleRef.current.x + bubbleRef.current.velocityX;
    let newY = bubbleRef.current.y + bubbleRef.current.velocityY;

    if (
      newX < bubbleRef.current.radius ||
      newX > boardWidth - bubbleRef.current.radius
    ) {
      bubbleRef.current.velocityX = -bubbleRef.current.velocityX;
      newX = bubbleRef.current.x + bubbleRef.current.velocityX;
    }
    if (
      newY < bubbleRef.current.radius ||
      newY > boardHeight - bubbleRef.current.radius
    ) {
      bubbleRef.current.velocityY = -bubbleRef.current.velocityY;
      newY = bubbleRef.current.y + bubbleRef.current.velocityY;
    }

    bubbleRef.current = { ...bubbleRef.current, x: newX, y: newY };
  };

  const drawBubble = () => {
    if (!bubbleRef.current) return;
    const bubbleImage = new Image();
    bubbleImage.src = bubblePicture;
    contextRef.current?.drawImage(
      bubbleImage,
      bubbleRef.current.x - bubbleRef.current.radius,
      bubbleRef.current.y - bubbleRef.current.radius,
      bubbleRef.current.radius * 2,
      bubbleRef.current.radius * 2
    );
  };

  const checkCollisions = () => {
    if (!bubbleRef.current) return;

    const checkBubbleCollision = (player: player) => {
      if (!bubbleRef.current) return;

      const dx = bubbleRef.current!.x - (player.x + player.width / 2);
      const dy = bubbleRef.current!.y - (player.y + player.height / 2);
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (
        distance <
        bubbleRef.current!.radius + Math.max(player.width, player.height) / 2
      ) {
        handleBubbleTouch();
        bubbleRef.current = null;
      }
    };

    checkBubbleCollision(player1);
    checkBubbleCollision(player2);
  };

  const handleBubbleTouch = () => {
    setIsPaused(true);
    playSound(questionSound);
    setTimeout(() => {
      setIsQuestion(true);
    });
  };

  const handleCorrectAnswer = () => {
    scoreRef.current += timer;
    setIsQuestion(false);
    nextValue();
    triggerPause();
    startBubbleTimer();
  };

  const handleWrongAnswer = () => {
    setLife((prevLife) => prevLife - 1);
    setIsQuestion(false);
    nextValue();
    triggerPause();
    startBubbleTimer();
  };

  const nextValue = () => {
    const valueQueue: values[] = [
      "Vertrauen",
      "Bodenständigkeit",
      "Leistung",
      "Verbundenheit",
      "Respekt",
    ];
    const currentIndex = valueQueue.indexOf(currentValue);
    const nextIndex = (currentIndex + 1) % valueQueue.length;
    setCurrentValue(valueQueue[nextIndex]);
  };

  const determineBallPicture = (value: values) => {
    switch (value) {
      case "Bodenständigkeit":
        return BodenStaendigkeitBallImg;
      case "Leistung":
        return LeistungBallImg;
      case "Respekt":
        return RespektBallImg;
      case "Verbundenheit":
        return VerbundenheitBallImg;
      case "Vertrauen":
        return Vertrauen;
    }
  };

  return (
    <section className="flex-1 text-center fixed w-full h-full flex justify-center align-middle items-center left-0 top-0 flex-col">
      {/* Values */}
      <div className="my-8 text-md flex gap-2 justify-center align-middle">
        <span className="opacity-75">Ihr haltet gerade gemeinsam den Wert</span>
        <div className="title-wrapper game-wrapper floating">
          <h1 className="sweet-title game-title sweet-title-mixed">
            <span data-text={currentValue}>{currentValue}</span>
          </h1>
        </div>
        <span className="opacity-75">hoch!</span>
      </div>
      {/* Game board */}
      <div
        className={`gradient-border ${
          gameEffect === "shake"
            ? "shake-effect"
            : gameEffect === "blackout"
            ? "blackout-effect"
            : ""
        }`}
      >
        <canvas
          className="bg-base-300 mt-10 m-auto shadow-lg"
          id="board"
        ></canvas>
      </div>
      {/* Score */}
      <div className="stats shadow-xl bg-base-200 p-2 mt-8">
        <div className="stat place-items-center">
          <div className="stat-title">Zeit</div>
          <div className="stat-value opacity-75">{timer}s</div>
        </div>
        <div className="stat place-items-center">
          <div className="stat-figure text-secondary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block w-8 h-8 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              ></path>
            </svg>
          </div>
          <div className="stat-title">Punkte</div>
          <div className="stat-value text-secondary glow">
            {scoreRef.current}
          </div>
        </div>
        <div className="stat place-items-center">
          <div className="stat-figure text-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block w-8 h-8 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              ></path>
            </svg>
          </div>
          <div className="stat-title">Leben</div>
          <div className="stat-value opacity-75">{life}</div>
        </div>
      </div>

      {isQuestion && (
        <QuestionDialogCmp
          correct={handleCorrectAnswer}
          wrong={handleWrongAnswer}
          value={currentValue}
        />
      )}
      <CountdownOverlay onCountdownComplete={() => initializeGame()} />
    </section>
  );
};

export default GameField;
