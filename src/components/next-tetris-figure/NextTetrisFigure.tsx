import { cloneDeep, find } from 'lodash';
import * as React from 'react';
import TetrisRenderer from '../tetris-renderer/TetrisRenderer';
import { TETROMINOS } from '../tetris/Tetrominos';
import { ITetromino } from '../tetris/Types';

interface INextTetrisFigureProps {
  figureCode: number | null;
}

export default class NextTetrisFigure extends React.PureComponent<
  INextTetrisFigureProps
> {
  public fieldWidth = 4;
  public fieldHeight = 4;
  public emptyGrid = Array(this.fieldHeight)
    .fill(null)
    .map(() => Array(this.fieldWidth).fill(null));

  constructor(props: INextTetrisFigureProps) {
    super(props);
  }

  get grid() {
    const figureCode = this.props.figureCode;
    const tetr = find(
      TETROMINOS,
      value => value.code === figureCode,
    ) as ITetromino;

    if (!tetr) return this.emptyGrid;
    const { shape, color } = cloneDeep(tetr);
    const grid = cloneDeep(this.emptyGrid);

    shape.forEach((row, i: number) => {
      row.forEach((val, j: number) => {
        const x = j;
        const y = i;
        if (val) grid[y][x] = color;
      });
    });

    return grid;
  }

  public render() {
    return (
      <div>
        <TetrisRenderer
          fieldWidth={this.fieldWidth}
          fieldHeight={this.fieldHeight}
          gridState={this.grid}
        ></TetrisRenderer>
      </div>
    );
  }
}
