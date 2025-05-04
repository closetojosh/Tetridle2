import Tetris from "./react-tetris/components/Tetris";
import './App.css';
const App = () => (
    <div className="app">
        <h1 className="title">Tetridle</h1>
        <Tetris keyboardControls={{
                // Default values shown here. These will be used if no
                // `keyboardControls` prop is provided.
                ArrowDown: 'MOVE_DOWN',
                ArrowLeft: 'MOVE_LEFT',
                ArrowRight: 'MOVE_RIGHT',
                " ": 'HARD_DROP',
                z: 'FLIP_COUNTERCLOCKWISE',
                x: 'FLIP_CLOCKWISE',
                ArrowUp: 'FLIP_CLOCKWISE',
                p: 'TOGGLE_PAUSE',
                c: 'HOLD',
                Shift: 'FLIP_180'
            }}
        >
            {({
                HeldPiece,
                Gameboard,
                PieceQueue,
                state,
                controller
            }) => (
                <div className="game">
                    <HeldPiece />
                    <Gameboard />
                    <PieceQueue />
                    {state === 'LOST' && (
                        <div>
                            <h2>Game Over</h2>
                            <button onClick={controller.restart}>New game</button>
                        </div>
                    )}
                </div>
            )}
        </Tetris>
    </div>
);
export default App;