import Tetris from "./react-tetris/components/Tetris";
import './App.css';
import { DEFAULT_GAME_SETTINGS, type Action, type Clear, type Mission } from "./react-tetris/models/Game";
import StartingModal from "./react-tetris/components/StartingModal";
import { useRef, useState } from "react";
import CountdownOverlay from "./react-tetris/components/CountdownOverlay";
import WinnerModal from "./react-tetris/components/WinnerModal";
import confetti from 'canvas-confetti';
import React from "react";
import { missionList, translateMission } from "./missionList";
import { Analytics } from "@vercel/analytics/react"
export const isTest = false;
const getClearString = (clear: Clear) => {
    const clearNames = ['Single', 'Double', 'Triple', 'Quad'];
    return `Clear a ${clear.isTSpin ? "T-Spin " : ""} ${clearNames[clear.lines - 1]} ${clear.isPerfectClear ? "with a Perfect Clear" : ""}`
}
const emptyMission: Mission = {
    // 20 x 10 2d array of nulls
    startingPosition: Array.from({ length: 20 }, () => Array(10).fill(null)),
    clears: [],
    pieces: [],
}
export function daysSinceMay122025(): number {
    if (isTest) {
        return missionList.length - 1;
    }
    const MS_PER_DAY = 86_400_000;                     // 24 h × 60 m × 60 s × 1000 ms
    const anchor = new Date('2025-05-12T00:00:00-04:00'); // EDT (Toronto)
    const diffMs = Date.now() - anchor.getTime();
    return Math.max(Math.floor(diffMs / MS_PER_DAY), 0);
}
export interface GameSettings {
    keyboardControls: Map<string, Action>;
    arr: number; // Auto Repeat Rate in milliseconds
    das: number; // Delayed Auto Shift in milliseconds
    sdf: number; // Soft Drop Factor/Speed
}
const App = () => {
    //ts-ignore
    const [currentMission, _] = useState<Mission>(translateMission(missionList[daysSinceMay122025()]));
    const [isStartingModalOpen, setIsStartingModalOpen] = useState<boolean>(true);
    const [isWinnerModelOpen, setIsWinnerModelOpen] = useState<boolean>(false);
    const [isCountdownActive, setIsCountdownActive] = useState<boolean>(false);
    const settings = useRef<GameSettings>(
        DEFAULT_GAME_SETTINGS
    );
    const [score, setScore] = useState<number>(0);
    const handleGameWin = (timeTaken: number) => {
        setIsWinnerModelOpen(true);
        setScore(timeTaken);
        const currentDate = new Date();
        const dateString = currentDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
        localStorage.setItem(`score-${dateString}`, timeTaken.toString()); 
        confetti({spread: 90});
    };
    const closeModal = () => {
        setIsStartingModalOpen(false);
        setIsCountdownActive(true);
    };
    const dailyMissions = currentMission.clears.map(mission => getClearString(mission));
    const [activeMission, setActiveMission] = useState<Mission>(emptyMission);
    const countdownEndCallback = () => { setActiveMission(currentMission) }
    React.useEffect(() => {
        const raw = localStorage.getItem('controls');
        const keyMap = localStorage.getItem('keyMap');
        if (raw) settings.current = JSON.parse(raw);
        if (keyMap && Object.entries(JSON.parse(keyMap)).length > 0) settings.current.keyboardControls = new Map(Object.entries(JSON.parse(keyMap)));
        const currentDate = new Date();
        const dateString = currentDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
        const storedScore = localStorage.getItem(`score-${dateString}`);
        if (storedScore && !isTest) {
            handleGameWin(parseInt(storedScore));
            setIsStartingModalOpen(false);
        }
    }, []);
    return (
        <div className="app">
            <Analytics />
            <CountdownOverlay countdownEndCallback={countdownEndCallback} isEnabled={isCountdownActive} />
            <StartingModal
                isOpen={isStartingModalOpen}
                onClose={closeModal}
                missions={dailyMissions}
                setSettings={(newSettings: GameSettings) => { settings.current = newSettings}}
                settings={settings}
            />
            <WinnerModal
                isOpen={isWinnerModelOpen}
                onClose={() => setIsWinnerModelOpen(false)}
                score={score}
            />
            <h1 className="title">Tetridle</h1>
            <Tetris
                settings={settings.current}
                mission={activeMission}
                handleGameWin={handleGameWin}
            >
                {({
                    HeldPiece,
                    Gameboard,
                    PieceQueue,
                    Checklist,
                    Timer
                }) => (
                    <div className="flex-col-center">
                        <div className="flex-col-center">
                            <div className="game">
                                <div className="vertical-flexbox-top">
                                    <HeldPiece />
                                    <Timer />
                                </div>
                                <Gameboard />
                                <PieceQueue />
                            </div>
                            <Checklist missions={dailyMissions} className={"game-checklist"} />
                        </div>
                    </div>
                )}
            </Tetris>
        </div>
    );
}
export default App;