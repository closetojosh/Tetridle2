import Tetris from "./react-tetris/components/Tetris";
import './App.css';
import { Action, Clear, Mission } from "./react-tetris/models/Game";
import StartingModal from "./react-tetris/components/StartingModal";
import { useState } from "react";
import CountdownOverlay from "./react-tetris/components/CountdownOverlay";
import WinnerModal from "./react-tetris/components/WinnerModal";
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
    const [scoreString, setScoreString] = useState<string>("");
    const handleGameWin = (timeTaken: number) => {
        setIsWinnerModelOpen(true);
        setScoreString(`I scored ${timeTaken} points! Can you beat me?`);
    };
    const closeModal = () => {
        setIsStartingModalOpen(false);
        setIsCountdownActive(true);
    };
    const dailyMissions = testMission.clears.map(mission => getClearString(mission));
    const [activeMission, setActiveMission] = useState<Mission>(emptyMission);
    const countdownEndCallback = () => { setActiveMission(testMission) }
    return (
        <div className="app">
            <CountdownOverlay countdownEndCallback={countdownEndCallback} isEnabled={isCountdownActive} />
            <StartingModal
                isOpen={isStartingModalOpen}
                onClose={closeModal}
                missions={dailyMissions}
            />
            <WinnerModal
                isOpen={isWinnerModelOpen}
                onClose={() => setIsWinnerModelOpen(false)}
                scoreString={scoreString}
            />
            <h1 className="title">Tetridle</h1>
            <Tetris keyboardControls={new Map<string, Action>([
                // Default values shown here. These will be used if no
                // `keyboardControls` prop is provided.
                ["ArrowDown", 'MOVE_DOWN'],
                ["ArrowLeft", 'MOVE_LEFT'],
                ["ArrowRight", 'MOVE_RIGHT'],
                [" ", 'HARD_DROP'],
                ["z", 'FLIP_COUNTERCLOCKWISE'],
                ["x", 'FLIP_CLOCKWISE'],
                ["ArrowUp", 'FLIP_CLOCKWISE'],
                ["p", 'TOGGLE_PAUSE'],
                ["c", 'HOLD'],
                ["Shift", 'FLIP_180']
            ])}
                mission={activeMission}
                handleGameWin={handleGameWin}
            >
                {({
                    HeldPiece,
                    Gameboard,
                    PieceQueue,
                    Checklist
                }) => (
                    <div className="flex-col-center">
                        <div className="flex-col-center">
                            <div className="game">
                                <HeldPiece />
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