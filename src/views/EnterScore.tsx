import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getScores, saveScore } from "../utils/scores";
import { addGamePadListener, isDownPressed, isLeftPressed, isRightPressed, isUpPressed, removeGamePadListener } from "../utils/gamepad";
import { gamepad } from "../utils/types";

const state = {
    currentLetter: 'a',
    activeIndex: 0,
    teamname: '',
    score: 0,
};

const EnterScore: React.FC = () => {
    const [teamName, setTeamName] = useState('');
    const [currentLetter, setCurrentLetter] = useState('a');
    const [activeIndex, setActiveIndex] = useState(0); // 0: Letter, 1: Remove, 2: Confirm
    const [score, setScore] = useState<number>(0);
    const [isError, setIsError] = useState(false);

    const scoreAtTopTen = () => {
        const currentScores = getScores();
        const query = new URLSearchParams(location.search);
        const scoreParam = query.get('score');
        const scorePkt = parseInt(scoreParam || '0', 10);
        return currentScores.length < 10 || currentScores[currentScores.length - 1].score < scorePkt;
    }

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        state.currentLetter = currentLetter;
        state.activeIndex = activeIndex;
        state.teamname = teamName;
        state.score = score;
    }, [activeIndex, currentLetter, teamName, score]);

    useEffect(() => {

        const query = new URLSearchParams(location.search);
        const scoreParam = query.get('score');
        const scorePkt = parseInt(scoreParam || '0', 10);

        const handleKeyPress = (event: KeyboardEvent) => {
            if (!scoreAtTopTen()) {
                handleSpace();
                return
            };

            switch (event.key) {
                case 'ArrowLeft':
                    if (state.activeIndex === 0) updateCurrentLetter(-1);
                    break;
                case 'ArrowRight':
                    if (state.activeIndex === 0) updateCurrentLetter(1);
                    break;
                case 'ArrowUp':
                    const newIndex = state.activeIndex === 0 ? 2 : state.activeIndex - 1;
                    setActiveIndex(newIndex);
                    break;
                case 'ArrowDown':
                    const newIndexD = state.activeIndex === 2 ? 0 : state.activeIndex + 1;
                    setActiveIndex(newIndexD);
                    break;
                case ' ':
                    handleSpace();
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);

        const gamePadhandler = (input: gamepad) => {
            if (input.type === 'button' && input.pressed) {
                handleSpace();
                return;
            }

            if (!scoreAtTopTen()) {
                return
            };

            if (isDownPressed(input)) {
                const newIndex = state.activeIndex === 0 ? 2 : state.activeIndex - 1;
                setActiveIndex(newIndex);
            }

            if (isUpPressed(input)) {
                const newIndex = state.activeIndex === 2 ? 0 : state.activeIndex + 1;
                setActiveIndex(newIndex);
            }

            if (isLeftPressed(input)) {
                if (state.activeIndex === 0) updateCurrentLetter(-1);
            }

            if (isRightPressed(input)) {
                if (state.activeIndex === 0) updateCurrentLetter(1);
            }

        };

        const padIndex = addGamePadListener(gamePadhandler);

        if (scoreParam) {
            setScore(scorePkt);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyPress);
            removeGamePadListener(gamePadhandler, padIndex);
        };
    }, []);

    const updateCurrentLetter = (direction: number) => {
        let currentCharCode = state.currentLetter.charCodeAt(0);
        if (direction === 1 && currentCharCode === 90) {
            currentCharCode = 65;
        } else if (direction === -1 && currentCharCode === 65) {
            currentCharCode = 90;
        } else {
            currentCharCode += direction;
        }
        setCurrentLetter(String.fromCharCode(currentCharCode).toLowerCase());
    };

    const handleSpace = () => {
        if (!scoreAtTopTen()) {
            setTimeout(() => {
                navigate('/scores');
            }, 200);
            return;
        };

        if (state.activeIndex === 0) {
            addLetter();
        } else if (state.activeIndex === 1) {
            removeLastLetter();
        } else if (state.activeIndex === 2) {
            confirmName();
        }
    };

    const addLetter = () => {
        const newName = state.teamname + state.currentLetter;
        setTeamName(newName);
    };

    const removeLastLetter = () => {
        const newName = state.teamname.slice(0, -1);
        setTeamName(newName);
    };

    const confirmName = () => {
        if (state.teamname.length === 0) {
            setIsError(true);
            return;
        };

        saveScore(state.score, state.teamname);
        setTimeout(() => {
            navigate('/scores');
        }, 200)
    };

    return (
        <>
            {!scoreAtTopTen() && <div className="hero min-h-screen bg-base-200">
                <div className="hero-content text-center flex-col gap-4">
                    <div className="text-4xl">Punkte: {score}</div>
                    <div className="text-2xl">Leider habt ihr es nicht auf die Bestenliste geschafft</div>
                    <div className="text-3xl">...</div>
                    <div className={(activeIndex === 0 ? "bg-primary" : "") + " kbd mt-2"} onClick={confirmName}>
                        Auf ein Neues!
                    </div>
                </div>
            </div>}

            {scoreAtTopTen() && <div className="hero min-h-screen bg-base-200">
                <div className="hero-content text-left flex-col">
                    <div className="text-5xl ">Punkte: {score}</div>
                    <div className="text-center">
                        <div className="flex gap-2 justify-center text-2xl ">
                            <span>Euer Team Name: </span>
                            <div>{teamName}<span className="blink-ani">{currentLetter}</span></div>

                        </div>
                        <div>
                            <div className={"p-4 text-center flex gap-2 justify-center"}>
                                <kbd className="p-2">◀︎</kbd>
                                <span className={(activeIndex === 0 ? "bg-primary" : "") + " kbd text-2xl"}>{currentLetter}</span>
                                <kbd className="p-2">▶︎</kbd>
                            </div>
                            <div className="flex gap-4 p-4 justify-center text-2xl">
                                <div className={"p-2 kbd " + (activeIndex === 1 ? "bg-primary" : "")} onClick={removeLastLetter}>
                                    ←
                                </div>
                                <div className={(activeIndex === 2 ? "bg-primary" : "") + " kbd"} onClick={confirmName}>
                                    Bestätigen
                                </div>
                            </div>
                            <div className="text-center">
                                {isError && <div className="text-red-500">Bitte gib einen Namen ein</div>}

                            </div>
                        </div>
                    </div>
                </div>
            </div>}
        </>
    );
};

export default EnterScore;
