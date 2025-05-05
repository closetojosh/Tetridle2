// srsKicks.ts

import { Rotation, Piece } from './models/Piece'; // Assuming Piece.ts is in the same directory

// Type definition for kick offsets [dx, dy]
export type KickOffset = [number, number];
export type KickOffsets = KickOffset[];

// Helper function to generate transition keys (e.g., "0->1")
const tk = (r1: Rotation, r2: Rotation): string => `${r1}->${r2}`;

// --- Standard J, L, S, T, Z Kick Data ---
// Source: https://tetris.fandom.com/wiki/SRS
// Offsets are relative to the initial rotation state.
// Y-coordinates are INVERTED from the wiki page to match +Y = down.
const kicksJLSTZ: Record<string, KickOffsets> = {
    // 0->1 (Clockwise from 0)
    [tk(0, 1)]: [[0, 0], [-1, 0], [-1, -1], [0, +2], [-1, +2]],
    // 1->0 (Counter-clockwise from 1)
    [tk(1, 0)]: [[0, 0], [+1, 0], [+1, +1], [0, -2], [+1, -2]],
    // 1->2 (Clockwise from 1)
    [tk(1, 2)]: [[0, 0], [+1, 0], [+1, +1], [0, -2], [+1, -2]],
    // 2->1 (Counter-clockwise from 2)
    [tk(2, 1)]: [[0, 0], [-1, 0], [-1, -1], [0, +2], [-1, +2]],
    // 2->3 (Clockwise from 2)
    [tk(2, 3)]: [[0, 0], [+1, 0], [+1, -1], [0, +2], [+1, +2]],
    // 3->2 (Counter-clockwise from 3)
    [tk(3, 2)]: [[0, 0], [-1, 0], [-1, +1], [0, -2], [-1, -2]],
    // 3->0 (Clockwise from 3)
    [tk(3, 0)]: [[0, 0], [-1, 0], [-1, +1], [0, -2], [-1, -2]],
    // 0->3 (Counter-clockwise from 0)
    [tk(0, 3)]: [[0, 0], [+1, 0], [+1, -1], [0, +2], [+1, +2]],
};

// --- Standard I Kick Data ---
// Source: https://tetris.fandom.com/wiki/SRS
// Y-coordinates are INVERTED from the wiki page to match +Y = down.
const kicksI: Record<string, KickOffsets> = {
    // 0->1 (Clockwise from 0)
    [tk(0, 1)]: [[0, 0], [-2, 0], [+1, 0], [-2, +1], [+1, -2]],
    // 1->0 (Counter-clockwise from 1)
    [tk(1, 0)]: [[0, 0], [+2, 0], [-1, 0], [+2, -1], [-1, +2]],
    // 1->2 (Clockwise from 1)
    [tk(1, 2)]: [[0, 0], [-1, 0], [+2, 0], [-1, -2], [+2, +1]],
    // 2->1 (Counter-clockwise from 2)
    [tk(2, 1)]: [[0, 0], [+1, 0], [-2, 0], [+1, +2], [-2, -1]],
    // 2->3 (Clockwise from 2)
    [tk(2, 3)]: [[0, 0], [+2, 0], [-1, 0], [+2, -1], [-1, +2]],
    // 3->2 (Counter-clockwise from 3)
    [tk(3, 2)]: [[0, 0], [-2, 0], [+1, 0], [-2, +1], [+1, -2]],
    // 3->0 (Clockwise from 3)
    [tk(3, 0)]: [[0, 0], [+1, 0], [-2, 0], [+1, +2], [-2, -1]],
    // 0->3 (Counter-clockwise from 0)
    [tk(0, 3)]: [[0, 0], [-1, 0], [+2, 0], [-1, -2], [+2, +1]],
};

// --- Nullpomino 180 Kick Data ---
// Source: https://tetris.fandom.com/wiki/SRS#180.C2.B0_Rotation
// Y-coordinates are INVERTED from the wiki page to match +Y = down.
// Note: Nullpomino seems to use slightly different indexing/naming (state 1 = spawn),
// but the transitions 0->2 and 1->3 match the common SRS states.
const kicks180_JLSTZ: Record<string, KickOffsets> = {
    // 0->2
    [tk(0, 2)]: [[0, 0], [0, +1], [+1, +1], [-1, +1], [+1, 0], [-1, 0]],
    // 1->3
    [tk(1, 3)]: [[0, 0], [+1, 0], [+1, +2], [+1, +1], [0, +2], [0, +1]],
    // 2->0
    [tk(2, 0)]: [[0, 0], [0, -1], [-1, -1], [+1, -1], [-1, 0], [+1, 0]],
    // 3->1
    [tk(3, 1)]: [[0, 0], [-1, 0], [-1, +2], [-1, +1], [0, +2], [0, +1]],
};

// --- Nullpomino 180 Kick Data for I piece ---
// Source: https://tetris.fandom.com/wiki/SRS#180.C2.B0_Rotation
// Y-coordinates are INVERTED from the wiki page to match +Y = down.
const kicks180_I: Record<string, KickOffsets> = {
    // 0->2
    [tk(0, 2)]: [[0, 0], [0, +1], [0, -1], [0, +2], [0, -2], [-1, +1]],
    // 1->3
    [tk(1, 3)]: [[0, 0], [-1, 0], [-2, 0], [-1, -1], [-2, -1], [+1, 0]],
    // 2->0
    [tk(2, 0)]: [[0, 0], [0, -1], [0, +1], [0, -2], [0, +2], [+1, -1]],
    // 3->1
    [tk(3, 1)]: [[0, 0], [+1, 0], [+2, 0], [+1, +1], [+2, +1], [-1, 0]],
};


// Function to get the appropriate kick data table
export function getKickData(
    piece: Piece,
    rotationDirection: 'clockwise' | 'counterClockwise' | '180'
): Record<string, KickOffsets> {
    if (piece === 'O') {
        return {}; // O piece doesn't kick
    }
    if (rotationDirection === '180') {
        return piece === 'I' ? kicks180_I : kicks180_JLSTZ;
    } else {
        return piece === 'I' ? kicksI : kicksJLSTZ;
    }
}

// Export the transition key helper if needed elsewhere
export { tk };