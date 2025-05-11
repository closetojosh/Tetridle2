import Tetris from "./react-tetris/components/Tetris";
import './App.css';
import { DEFAULT_KEYBOARD_CONTROLS_ENTRIES, type Action, type Clear, type Mission } from "./react-tetris/models/Game";
import StartingModal from "./react-tetris/components/StartingModal";
import { useRef, useState } from "react";
import CountdownOverlay from "./react-tetris/components/CountdownOverlay";
import WinnerModal from "./react-tetris/components/WinnerModal";
import confetti from 'canvas-confetti';
import React from "react";
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
const testMission: Mission = {
    startingPosition: [
        [null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, 'grey', 'grey', 'grey', 'grey', 'grey', 'grey'],
        [null, null, null, null, 'grey', 'grey', 'grey', 'grey', 'grey', 'grey'],
        [null, null, null, null, 'grey', 'grey', 'grey', 'grey', 'grey', 'grey'],
        [null, null, null, 'L' , 'grey', 'grey', 'grey', 'grey', 'grey', 'grey'],
        [null, null, null, 'L' , 'grey', 'grey', 'grey', 'grey', 'grey', 'grey'],
        [null, null, 'L', 'L'  , 'grey', 'grey', 'grey', 'grey', 'grey', 'grey'],
    ],
    pieces: ['L', 'J', 'L', 'J', 'T', 'T'],
    clears: [
        { lines: 2, isPerfectClear: false, isTSpin: true }, 
        { lines: 2, isPerfectClear: false, isTSpin: true }
    ]
}
const App = () => {
    const [isStartingModalOpen, setIsStartingModalOpen] = useState<boolean>(true);
    const [isWinnerModelOpen, setIsWinnerModelOpen] = useState<boolean>(false);
    const [isCountdownActive, setIsCountdownActive] = useState<boolean>(false);
    const keyboardControls = useRef<Map<string, Action>>(new Map<string, Action>(
        DEFAULT_KEYBOARD_CONTROLS_ENTRIES
    ));
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
    const dailyMissions = testMission.clears.map(mission => getClearString(mission));
    const [activeMission, setActiveMission] = useState<Mission>(emptyMission);
    const countdownEndCallback = () => { setActiveMission(testMission) }
    React.useEffect(() => {
        const raw = localStorage.getItem('controls');
        if (raw && Object.entries(JSON.parse(raw)).length > 0) keyboardControls.current = new Map<string, Action>(Object.entries(JSON.parse(raw)));
        const currentDate = new Date();
        const dateString = currentDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
        const storedScore = localStorage.getItem(`score-${dateString}`);
        if (storedScore) {
            handleGameWin(parseInt(storedScore));
            setIsStartingModalOpen(false);
        }
    }, []);
    return (
        <div className="app">
            <CountdownOverlay countdownEndCallback={countdownEndCallback} isEnabled={isCountdownActive} />
            <StartingModal
                isOpen={isStartingModalOpen}
                onClose={closeModal}
                missions={dailyMissions}
                setControls={(controls: Map<string, Action>) => { keyboardControls.current = controls; console.log(controls) }}
                keyboardControls={keyboardControls}
            />
            <WinnerModal
                isOpen={isWinnerModelOpen}
                onClose={() => setIsWinnerModelOpen(false)}
                score={score}
            />
            <h1 className="title">Tetridle</h1>
            <Tetris keyboardControls={keyboardControls.current}
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