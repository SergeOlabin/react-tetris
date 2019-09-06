import * as React from 'react';
import './tetris-info.scss';

export interface ITetrisInfoProps {
  level: number;
  points: number;
}

export function TetrisInfo(props: ITetrisInfoProps) {
  return (
    <div className="tetris-info">
      <div className="points">Points: {props.points}</div>
      <div className="level">Level: {props.level}</div>
    </div>
  );
}
