import React from 'react';
import PieceView from './PieceView';
import { Context } from '../context';

export default function PieceQueue(): React.JSX.Element {
    const { queue } = React.useContext(Context);
  //max length is 6 so this will always be enough
  const paddedQueue = [...queue, 'E', 'E', 'E', 'E', 'E', 'E'] as const
  return (
    <div>
      {paddedQueue.slice(0, 6).map((piece, i) => (
        <PieceView piece={piece} key={i} />
      ))}
    </div>
  );
}
