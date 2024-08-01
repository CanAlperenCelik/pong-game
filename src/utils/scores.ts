import { Score } from "./types";
import Cookies from 'js-cookie';

const getScores = () => {
    const scores = Cookies.get('highscores');
    if (scores) {
        return JSON.parse(scores);
    }
    return [];
}

const saveScore = (score: number, name: string) => {
    const scores = getScores();
    scores.push({ name, score });
    scores.sort((a: Score, b: Score) => b.score - a.score);
    Cookies.set('highscores', JSON.stringify(scores.slice(0, 10)), { expires: 1365 });
}

export { getScores, saveScore };
