import PieceQueue from '../components/PieceQueue';
import type { Mission } from '../models/Game';
import type { Piece } from '../models/Piece';

export type PieceQueue = Piece[]

export function create(mission: Mission): PieceQueue {
    return mission.pieces
}



export function getNext(pieceQueue: PieceQueue): {
  piece: Piece;
  queue: PieceQueue;
} {
  if (!pieceQueue[0]) {
      return {
          piece: 'E',
          queue: []
      };
  }
  const next = pieceQueue[0];
  const queue = pieceQueue.slice(1);
  return {
    piece: next,
      queue: queue
  };
}

export default PieceQueue;
