/* eslint-disable @typescript-eslint/no-non-null-assertion */
import Constants from '../constants';
import { getKickData, tk } from '../srsKicks';
import type { KickOffsets } from '../srsKicks';
import type { Clear } from './Game';
import { getBlocks } from './Piece';
import type { Piece, Rotation } from './Piece';
export type { Piece } from './Piece';
const { GAME_HEIGHT, GAME_WIDTH } = Constants;

export type Coords = {
  x: number;
  y: number;
};

const serializeCoords = ({ x, y }: Coords): string => `${x},${y}`;

// Two-dimensional array
// First dimension is height. Second is width.
export type Matrix = Array<Array<Piece | 'ghost' | 'grey' | null>>;

export function buildMatrix(): Matrix {
  const matrix = new Array(GAME_HEIGHT);
  for (let y = 0; y < matrix.length; y++) {
    matrix[y] = buildGameRow();
  }
  return matrix;
}

function buildGameRow(): Array<null> {
  return new Array(GAME_WIDTH).fill(null);
}

export const addPieceToBoard = (
  matrix: Matrix,
  positionedPiece: PositionedPiece,
  isGhost = false
): Matrix => {
  const { piece, rotation, position } = positionedPiece;
  const block = getBlocks(piece)[rotation];

  if (!block) {
    throw new Error(
      `Unexpected: no rotation ${rotation} found to piece ${piece}`
    );
  }

  const filledCells = block.reduce<Array<Coords | false>>(
    (output, row, y) =>
      output.concat(
        row.map((cell, x) =>
          cell ? { x: x + position.x, y: y + position.y } : false
        )
      ),
    []
  );

  const filled: Set<string> = new Set(
    filledCells
      .map((value) => (value ? serializeCoords(value) : ''))
      .filter(Boolean)
  );

  const value = isGhost ? 'ghost' : piece;

  return matrix.map((row, y) =>
    row.map((cell, x) => {
      return filled.has(serializeCoords({ x, y })) ? value : cell;
    })
  );
};

export type PositionedPiece = {
  piece: Piece;
  rotation: Rotation;
  position: Coords;
};

export function setPiece(
  matrix: Matrix,
  positionedPiece: PositionedPiece
): [Matrix, Clear] {
  const _matrix = addPieceToBoard(matrix, positionedPiece);
    // TODO: purify
    const clear = clearFullLines(_matrix, positionedPiece.piece, positionedPiece.position);
    return [_matrix, clear];
}

function clearFullLines(matrix: Matrix, currentPiece: Piece, position: Coords): Clear {

    const isTSpin = detectTSpin(matrix, currentPiece, position);

    let lines = 0;
    for (let y = 0; y < matrix.length; y++) {
        if (every(matrix[y]!)) {
            matrix.splice(y, 1);
            matrix.unshift(buildGameRow());
            lines += 1;
        }
    }
    const isPerfectClear = matrix.every(row => row.every(cell => cell === null));
    return {
        lines,
        isPerfectClear,
        isTSpin,
    };
}

function detectTSpin(matrix: Matrix, piece: Piece, position: Coords): boolean {
    if (piece !== 'T') return false;
    const { x, y } = position;
    const corners = [
        [y, x],
        [y + 2, x ],
        [y + 2, x + 2],
        [y, x + 2],
    ];

    let occupiedCorners = 0;
    for (const [cy, cx] of corners) {
        if (matrix[cy]?.[cx] || cy < 0 || cy > 19 || cx < 0 || cx > 19) {
            occupiedCorners++;
        }
    }

    return occupiedCorners >= 3;
}
function every<T>(list: T[]): boolean {
  for (let i = 0; i < list.length; i++) {
    if (!list[i]) return false;
  }
  return true;
}

export function isEmptyPosition(
  matrix: Matrix,
  positionedPiece: PositionedPiece
): boolean {
  const { piece, rotation, position } = positionedPiece;
  const blocks = getBlocks(piece)[rotation];

  for (let x = 0; x < Constants.BLOCK_WIDTH; x++) {
    for (let y = 0; y < Constants.BLOCK_HEIGHT; y++) {
      const block = blocks![y]![x];
      const matrixX = x + position.x;
      const matrixY = y + position.y;

      // might not be filled, ya know
      if (block) {
        // make sure it's on the matrix
        if (matrixX >= 0 && matrixX < GAME_WIDTH && matrixY < GAME_HEIGHT) {
          // make sure it's available
          if (!matrix[matrixY] || matrix![matrixY]![matrixX]) {
            // that square is taken by the matrix already
            return false;
          }
        } else {
          // there's a square in the block that's off the matrix
          return false;
        }
      }
    }
  }
  return true;
}

function tryRotation(
    gameboard: Matrix,
    currentPiece: PositionedPiece,
    targetRotation: Rotation,
    kickTable: Record<string, KickOffsets>
): PositionedPiece | undefined {
    const { piece, rotation: currentRotation, position } = currentPiece;

    // O piece doesn't rotate
    if (piece === 'O') {
        return currentPiece;
    }

    const transitionKey = tk(currentRotation, targetRotation);
    const offsets = kickTable[transitionKey];

    if (!offsets) {
        console.warn(`No kick data found for piece ${piece} transition ${transitionKey}`);
        // Fallback: try rotating without kicks (or just fail)
        const rotatedPiece: PositionedPiece = { ...currentPiece, rotation: targetRotation };
        return isEmptyPosition(gameboard, rotatedPiece) ? rotatedPiece : undefined;
        // return undefined; // Or uncomment this line to strictly fail if no kicks defined
    }

    // Try each kick offset
    for (const offset of offsets) {
        const [dx, dy] = offset;
        const testPosition: Coords = {
            x: position.x + dx,
            y: position.y + dy,
        };
        const testPiece: PositionedPiece = {
            piece: piece,
            rotation: targetRotation,
            position: testPosition,
        };

        if (isEmptyPosition(gameboard, testPiece)) {
            // Found a valid position
            return testPiece;
        }
    }

    // No valid kick offset found
    return undefined;
}
function tryMove(move: (pp: PositionedPiece) => PositionedPiece) {
  return function (
    gameboard: Matrix,
    positionedPiece: PositionedPiece
  ): PositionedPiece | undefined {
    const updatedPiece = move(positionedPiece);

    if (isEmptyPosition(gameboard, updatedPiece)) {
      return updatedPiece;
    }

    return undefined;
  };
}

export const moveLeft = tryMove((positionedPiece: PositionedPiece) => {
  const newPosition = {
    ...positionedPiece.position,
    x: positionedPiece.position.x - 1
  };

  return { ...positionedPiece, position: newPosition };
});

export const moveRight = tryMove((positionedPiece: PositionedPiece) => {
  const newPosition = {
    ...positionedPiece.position,
    x: positionedPiece.position.x + 1
  };

  return { ...positionedPiece, position: newPosition };
});

export const moveDown = tryMove((positionedPiece: PositionedPiece) => {
  const newPosition = {
    ...positionedPiece.position,
    y: positionedPiece.position.y + 1
  };

  return { ...positionedPiece, position: newPosition };
});
export function rotateClockwise(
    gameboard: Matrix,
    positionedPiece: PositionedPiece
): PositionedPiece | undefined {
    if (positionedPiece.piece === 'O') return positionedPiece; // O piece doesn't rotate

    const currentRotation = positionedPiece.rotation;
    const targetRotation = ((currentRotation + 1) % Constants.ROTATION_COUNT) as Rotation;

    const kickTable = getKickData(positionedPiece.piece, 'clockwise');

    return tryRotation(gameboard, positionedPiece, targetRotation, kickTable);
}

export function rotateCounterclockwise(
    gameboard: Matrix,
    positionedPiece: PositionedPiece
): PositionedPiece | undefined {
    if (positionedPiece.piece === 'O') return positionedPiece; // O piece doesn't rotate

    const currentRotation = positionedPiece.rotation;
    let targetRotation = currentRotation - 1;
    if (targetRotation < 0) {
        targetRotation += Constants.ROTATION_COUNT;
    }

    const kickTable = getKickData(positionedPiece.piece, 'counterClockwise');

    return tryRotation(gameboard, positionedPiece, targetRotation as Rotation, kickTable);
}

export function rotate180(
    gameboard: Matrix,
    positionedPiece: PositionedPiece
): PositionedPiece | undefined {
    if (positionedPiece.piece === 'O') return positionedPiece; // O piece doesn't rotate

    const currentRotation = positionedPiece.rotation;
    const targetRotation = ((currentRotation + 2) % Constants.ROTATION_COUNT) as Rotation;

    const kickTable = getKickData(positionedPiece.piece, '180');

    return tryRotation(gameboard, positionedPiece, targetRotation, kickTable);
}

export function hardDrop(
  gameboard: Matrix,
  positionedPiece: PositionedPiece
): PositionedPiece {
  const position = { ...positionedPiece.position };

  while (isEmptyPosition(gameboard, { ...positionedPiece, position })) {
    position.y += 1;
  }
  // at this point, we just found a non-empty position, so let's step back
  position.y -= 1;
  return { ...positionedPiece, position };
}

export const moveFarLeft = (
    gameboard: Matrix,
    positionedPiece: PositionedPiece
): PositionedPiece => {
    let currentPiece = positionedPiece;
    let nextPiece = moveLeft(gameboard, currentPiece);

    while (nextPiece) {
        currentPiece = nextPiece;
        nextPiece = moveLeft(gameboard, currentPiece);
    }

    return currentPiece;
};

export const moveFarRight = (
    gameboard: Matrix,
    positionedPiece: PositionedPiece
): PositionedPiece => {
    let currentPiece = positionedPiece;
    let nextPiece = moveRight(gameboard, currentPiece);

    while (nextPiece) {
        currentPiece = nextPiece;
        nextPiece = moveRight(gameboard, currentPiece);
    }

    return currentPiece;
};
