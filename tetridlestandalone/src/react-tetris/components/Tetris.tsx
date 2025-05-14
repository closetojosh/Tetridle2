import React, { useEffect } from 'react';
import Gameboard from './Gameboard';
import * as Game from '../models/Game';
import HeldPiece from './HeldPiece';
import PieceQueue from './PieceQueue';
import { Context } from '../context';
import { useKeyboardControls } from '../hooks/useKeyboardControls';
import type { Mission } from '../models/Game';
import { Checklist } from './Checklist';
import Timer from './Timer';
import type { GameSettings } from '../../App';

export type RenderFn = (params: {
    HeldPiece: React.ComponentType;
    Gameboard: React.ComponentType;
    PieceQueue: React.ComponentType;
    Timer: React.ComponentType;
    Checklist: React.ComponentType<{ missions: string[], className?: string }>;
    points: number;
    linesCleared: number;
    level: number;
    state: Game.State;
    controller: Controller;
    isMissionCompleted: boolean[];
}) => React.ReactElement;

export type Controller = {
    pause: () => void;
    resume: () => void;
    hold: () => void;
    hardDrop: () => void;
    moveDown: () => void;
    moveLeft: () => void;
    moveRight: () => void;
    flipClockwise: () => void;
    flipCounterclockwise: () => void;
    restart: () => void;
};

type Props = {
    settings?: GameSettings;
    children: RenderFn;
    mission: Mission;
    handleGameWin: (score: number) => void;
};

//const defaultKeyboardMap: KeyboardMap = {
//    down: 'MOVE_DOWN',
//    left: 'MOVE_LEFT',
//    right: 'MOVE_RIGHT',
//    left_done: 'MOVE_LEFT_DONE',
//    right_done: 'MOVE_RIGHT_DONE',
//    space: 'HARD_DROP',
//    z: 'FLIP_COUNTERCLOCKWISE',
//    x: 'FLIP_CLOCKWISE',
//    up: 'FLIP_CLOCKWISE',
//    p: 'TOGGLE_PAUSE',
//    c: 'HOLD',
//    shift: 'HOLD'
//};

// https://harddrop.com/wiki/Tetris_Worlds#Gravity
export default function Tetris(props: Props): React.JSX.Element {
    const [game, dispatch] = React.useReducer(Game.update, { ...Game.init(props.mission, props.handleGameWin, 0, props.settings), state: 'PAUSED' });
    useEffect(() => {
        if (props.mission.clears.length === 0) return;
        dispatch(Game.init(props.mission, props.handleGameWin, 0, props.settings));
    }
        , [props.mission]);
    const isWon = game.isMissionCompleted.every(mission => mission) && game.isMissionCompleted.length !== 0;
    React.useEffect(() => {
        if (isWon) props.handleGameWin(game.ticks)
    }, [isWon])
    const gameSettings = props.settings!;
    useKeyboardControls(gameSettings, dispatch);
    const level = Game.getLevel(game);

    React.useEffect(() => {
        let interval: number | undefined;
        if (game.state === 'PLAYING') {
            interval = window.setInterval(
                () => {
                    dispatch('TICK');
                },
                1 * 1000
            );
        }
        return () => {
            window.clearInterval(interval);
        };
    }, [game.state, level]);

    const controller = React.useMemo(
        () => ({
            pause: () => dispatch('PAUSE'),
            resume: () => dispatch('RESUME'),
            hold: () => dispatch('HOLD'),
            hardDrop: () => dispatch('HARD_DROP'),
            moveDown: () => dispatch('MOVE_DOWN'),
            moveLeft: () => dispatch('MOVE_LEFT'),
            moveRight: () => dispatch('MOVE_RIGHT'),
            flipClockwise: () => dispatch('FLIP_CLOCKWISE'),
            flipCounterclockwise: () => dispatch('FLIP_COUNTERCLOCKWISE'),
            restart: () => dispatch('RESTART')
        }),
        [dispatch]
    );

    return (
        props.mission ? 
        <Context.Provider value={game}>
            {props.children({
                HeldPiece,
                Gameboard,
                PieceQueue,
                Checklist,
                Timer,
                points: game.points,
                linesCleared: game.lines,
                state: game.state,
                level,
                controller,
                isMissionCompleted: game.isMissionCompleted
            })}
        </Context.Provider>
        :
        <></>
    );
}
