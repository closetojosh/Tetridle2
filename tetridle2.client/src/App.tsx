import Tetris from "./react-tetris/components/Tetris";
import './App.css';
import { Action, Clear, Mission } from "./react-tetris/models/Game";
import StartingModal from "./react-tetris/components/StartingModal";
import { useState } from "react";
import CountdownOverlay from "./react-tetris/components/CountdownOverlay";
import { Checklist } from "./react-tetris/components/Checklist";
const getClearString = (clear: Clear) => {
    const clearNames = ['Single', 'Double', 'Triple', 'Quad'];
    return `Clear a ${clear.isTSpin ? "T-Spin " : ""} ${clearNames[clear.lines - 1]} ${clear.isPerfectClear ? "with a Perfect Clear" : ""}`
}
const emptyMission: Mission = {
    // 20 x 10 2d array of nulls
    startingPosition: Array.from({ length: 20 }, () => Array(10).fill(null)),
    clears: [],
    pieces: []
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
        [null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, 'O' , 'O' , null, null, null, null],
        [null, null, null, null, 'O' , 'O' , null, null, null, null]
    ],
    pieces: ['I', 'J', 'L', 'O', 'S', 'T'],
    clears: [
        { lines: 1, isPerfectClear: true, isTSpin: true }, 
        { lines: 1, isPerfectClear: false, isTSpin: false }
    ]
}
const App = () => {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(true);
    const [isCountdownActive, setIsCountdownActive] = useState<boolean>(false);
    const closeModal = () => {
        setIsModalOpen(false);
        setIsCountdownActive(true);
    };
    const dailyMissions = testMission.clears.map(mission => getClearString(mission));
    const [activeMission, setActiveMission] = useState<Mission>(emptyMission);
    const countdownEndCallback = () => { setActiveMission(testMission) }
    return (
        <div className="app">
            <CountdownOverlay countdownEndCallback={countdownEndCallback} isEnabled={isCountdownActive} />
            <StartingModal
                isOpen={isModalOpen}
                onClose={closeModal}
                missions={dailyMissions}
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
            >
                {({
                    HeldPiece,
                    Gameboard,
                    PieceQueue,
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