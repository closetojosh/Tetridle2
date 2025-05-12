import {
    buildMatrix,
    addPieceToBoard,
    isEmptyPosition,
    rotateClockwise,
    rotateCounterclockwise,
    moveDown,
    moveLeft,
    moveRight,
    setPiece,
    hardDrop,
    rotate180
} from './Matrix';
import type {
    Matrix,
    PositionedPiece,
    Piece
} from './Matrix';
import Constants from '../constants';
import * as PieceQueue from '../modules/piece-queue';
import Settings from '../settings';
export type State = 'PAUSED' | 'PLAYING' | 'LOST';

type HeldPiece = { available: boolean; piece: Piece };
export type Clear = {
    lines: number;
    isTSpin: boolean;
    isPerfectClear: boolean;
}
export type Mission = {
    startingPosition: Matrix;
    clears: Clear[];
    pieces: Piece[];
}
export type EditorMission = {
    editorStartingPosition: string[][];
    clears: Clear[];
    pieces: Piece[];
}
export type Game = {
    state: State;
    matrix: Matrix;
    piece: PositionedPiece;
    heldPiece: HeldPiece | undefined;
    queue: PieceQueue.PieceQueue;
    points: number;
    lines: number;
    dasTimers: { left: number; right: number };
    bottomOutTicks: number;
    mission: Mission;
    isMissionCompleted: boolean[];
    ticks: number;
    handleGameWin?: (timeTaken: number) => void
};


export const getLevel = (game: Game): number => Math.floor(game.lines / 10) + 1;

export type Action =
    | 'PAUSE'
    | 'RESUME'
    | 'TOGGLE_PAUSE'
    | 'TICK'
    | 'HOLD'
    | 'HARD_DROP'
    | 'MOVE_DOWN'
    | 'MOVE_LEFT'
    | 'MOVE_RIGHT'
    | 'FLIP_CLOCKWISE'
    | 'FLIP_COUNTERCLOCKWISE'
    | 'FLIP_180'
    | 'RESTART'
    | Game;

export const DEFAULT_KEYBOARD_CONTROLS_ENTRIES = [
    ["ArrowDown", 'MOVE_DOWN'],
    ["ArrowLeft", 'MOVE_LEFT'],
    ["ArrowRight", 'MOVE_RIGHT'],
    [" ", 'HARD_DROP'],
    ["z", 'FLIP_COUNTERCLOCKWISE'],
    ["ArrowUp", 'FLIP_CLOCKWISE'],
    ["p", 'TOGGLE_PAUSE'],
    ["c", 'HOLD'],
    ["Shift", 'FLIP_180']
] as const
export const ALL_ACTIONS_ORDERED = [
    "MOVE_DOWN", "MOVE_LEFT", "MOVE_RIGHT", "HARD_DROP", "FLIP_CLOCKWISE", "FLIP_COUNTERCLOCKWISE", "FLIP_180", "HOLD"
] as Action[]
export const init = (mission: Mission, handleGameWin?: (timeTaken: number) => void): Game => {
    //Make API call to get the mission
    const queue = PieceQueue.create(mission);
    const next = PieceQueue.getNext(queue);
    return {
        state: 'PLAYING',
        points: 0,
        lines: 0,
        matrix: mission.startingPosition ?? buildMatrix(),
        piece: initializePiece(next.piece),
        heldPiece: undefined,
        queue: next.queue,
        dasTimers: { left: -1, right: -1 },
        bottomOutTicks: 0,
        mission: mission,
        ticks: 0,
        isMissionCompleted: mission.clears.map(() => false),
        handleGameWin: handleGameWin
    };
};

export const update = (game: Game, action: Action): Game => {

    switch (action) {
        case 'RESTART': {
            return init(game.mission);
        }
        case 'PAUSE': {
            return game.state === 'PLAYING' ? { ...game, state: 'PAUSED' } : game;
        }
        case 'RESUME': {
            return game.state === 'PAUSED' ? { ...game, state: 'PLAYING' } : game;
        }
        case 'TOGGLE_PAUSE': {
            if (game.state === 'PLAYING') return { ...game, state: 'PAUSED' };
            if (game.state === 'PAUSED') return { ...game, state: 'PLAYING' };
            return game;
        }
        case 'HARD_DROP': {
            if (game.state !== 'PLAYING') return game;
            const piece = hardDrop(game.matrix, game.piece);
            return lockInPiece({ ...game, piece });
        }
        case 'TICK':
        {
            const tickUpdatedGame = {...game, ticks: game.ticks + 1};
            if (game.state !== 'PLAYING') return tickUpdatedGame;
            const updated = applyMove(moveDown, tickUpdatedGame);
            if (game.piece === updated.piece) {
                return incrementLockInTicks(tickUpdatedGame, 10000);
            } else {
                return updated;
            }
        }
        case 'MOVE_DOWN': {
            if (game.state !== 'PLAYING') return game;
            const updated = applyMove(moveDown, game);
            if (game.piece === updated.piece) {
                return incrementLockInTicks(game, 10000 / (1000 / Settings.SOFTDROP_DELAY));
            } else {
                return updated;
            }
        }
        case 'MOVE_LEFT': {
            return applyMove(moveLeft, game);
        }
        case 'MOVE_RIGHT': {
            return applyMove(moveRight, game);
        }
        case 'FLIP_CLOCKWISE': {
            return applyMove(rotateClockwise, game);
        }
        case 'FLIP_COUNTERCLOCKWISE': {
            return applyMove(rotateCounterclockwise, game);
        }
        case 'FLIP_180': {
            return applyMove(rotate180, game);
        }
        case 'HOLD': {
            if (game.state !== 'PLAYING') return game;
            if (game.heldPiece && !game.heldPiece.available || PieceQueue.getNext(game.queue).piece == 'E' && !game.heldPiece?.available) return game;

            // Ensure the held piece will fit on the matrix
            if (
                game.heldPiece &&
                !isEmptyPosition(game.matrix, {
                    ...game.piece,
                    piece: game.heldPiece.piece
                })
            ) {
                return game;
            }

            const next = PieceQueue.getNext(game.queue);
            const newPiece = game.heldPiece?.piece ?? next.piece;

            return {
                ...game,
                heldPiece: { piece: game.piece.piece, available: false }, // hmm
                piece: initializePiece(newPiece),
                queue: newPiece === next.piece ? next.queue : game.queue
            };
        }
        default: {
            //Passed Game in
            return action;
        }
    }
};
const incrementLockInTicks = (game: Game, increment: number): Game => {
if (game.state !== 'PLAYING') return game;
    const ticks = game.bottomOutTicks + increment;
    const newGame = { ...game, bottomOutTicks: ticks };
    if (ticks > Settings.BOTTOMOUT_TIME) {
        return lockInPiece(newGame);
    }
    return newGame;
}
const lockInPiece = (game: Game): Game => {
    const [matrix, clear] = setPiece(game.matrix, game.piece);
    const next = PieceQueue.getNext(game.queue);
    const piece = initializePiece(next.piece);
    const newMissionClear = game.mission.clears.findIndex((missionClear, index) => ifClearFits(clear, missionClear) && !game.isMissionCompleted[index]);
    const newMissionClears = newMissionClear === -1 ? new Array(game.mission.clears.length).fill(false) : game.mission.clears.map((_, i) => i == newMissionClear);
    const finalMissionClears = newMissionClears.map((missionClear, i) => missionClear || game.isMissionCompleted[i]);
    const isWon = finalMissionClears.every((missionClear) => missionClear);
    if (isWon) {
        game.handleGameWin?.(game.ticks)
    } 
    const isQueueEmpty = next.piece == 'E';
    const isLost = !isWon && ((isQueueEmpty && !game.heldPiece) || (!isQueueEmpty && !isEmptyPosition(matrix, piece)));
    if (isLost) {
        return init(game.mission);
    }
    return {
        ...game,
        matrix,
        piece: isQueueEmpty && !isWon ? initializePiece(game.heldPiece?.piece!) : piece,
        heldPiece: game.heldPiece && !isQueueEmpty
            ? { ...game.heldPiece, available: true }
            : undefined,
        queue: isQueueEmpty ? game.queue : next.queue,
        lines: game.lines + clear.lines,
        points: game.points + addScore(clear.lines),
        bottomOutTicks: 0,
        isMissionCompleted: finalMissionClears,
        state: isWon ? 'PAUSED' : game.state,
    };
};
const ifClearFits = (clear: Clear, missionClear: Clear) => {
    if (missionClear.isPerfectClear && !clear.isPerfectClear) return false;
    if (missionClear.isTSpin && !clear.isTSpin) return false;
    if (missionClear.lines !== clear.lines) return false;
    return true;
}
const pointsPerLine = 100;
const addScore = (additionalLines: number) => {
    // what's this called?
    if (additionalLines === 4) {
        return pointsPerLine * 10;
    } else {
        return additionalLines * pointsPerLine;
    }
};

const initialPosition = {
    x: Constants.GAME_WIDTH / 2 - Constants.BLOCK_WIDTH / 2,
    y: 0
};

const initializePiece = (piece: Piece): PositionedPiece => {
    return {
        position: initialPosition,
        piece,
        rotation: 0
    };
};
const applyMove = (
    move: (matrix: Matrix, piece: PositionedPiece) => PositionedPiece | undefined,
    game: Game
): Game => {
    if (game.state !== 'PLAYING') return game;
    const afterFlip = move(game.matrix, game.piece);
    return afterFlip ? { ...game, piece: afterFlip } : game;
};
export function viewMatrix(game: Game): Matrix {
    let gameboard = game.matrix;
    if (game.piece.piece == 'E') return gameboard;
    // set the preview
    gameboard = addPieceToBoard(gameboard, hardDrop(gameboard, game.piece), true);

    // set the actual piece
    return addPieceToBoard(gameboard, game.piece);
}
