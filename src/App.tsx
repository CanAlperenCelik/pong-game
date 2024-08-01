import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import GameField from './views/Game';
import Home from './views/Home';
import Highscore from './views/EnterScore';
import ShowScores from './views/ShowScores';
import Settings from './views/Settings';
import CreateGame from './views/CreateGame';
import JoinGame from './views/JoinGame';
import EnterSessionId from './views/EnterSessionId';

const App = () => {
    const [settings, setSettings] = useState({
        speedOption: 'fast',
        pointOption: 10
    });

    const handleCreateGameSubmit = (name: string, sessionId: string) => {
        console.log("Game created with name:", name, "and sessionId:", sessionId);
        // Weitere Logik hier
    };

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/game/:sessionId" element={<GameField settings={settings} />} />
                <Route path="/enter-score" element={<Highscore />} />
                <Route path="/scores" element={<ShowScores />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/create-game" element={<CreateGame onSubmit={handleCreateGameSubmit} />} /> {/* Stelle sicher, dass onSubmit übergeben wird */}
                <Route path="/join/:sessionId" element={<JoinGame />} />
                <Route path="/enter-session" element={<EnterSessionId />} />
            </Routes>
        </Router>
    );
};

export default App;
