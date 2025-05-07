import React from 'react';
import { Game } from './models/Game';
import { buildMatrix } from './models/Matrix';
import Constants from './constants'; 
const defaultValue = {
    state: 'PLAYING',
    points: 0,
    lines: 0,
    matrix: buildMatrix(),
    piece: {
        position: {
            x: Constants.GAME_WIDTH / 2 - Constants.BLOCK_WIDTH / 2,
            y: 0
        },
        piece: 'T',
        rotation: 0
    },
    heldPiece: undefined,
    queue: {},
    dasTimers: { left: -1, right: -1 },
    bottomOutTicks: 0,
    mission: {},
    isMissionCompleted: [] as boolean[]
} as Game;
export const Context = React.createContext<Game>(defaultValue);
