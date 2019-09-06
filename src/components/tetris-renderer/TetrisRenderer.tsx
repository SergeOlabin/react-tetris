import { cloneDeep } from 'lodash';
import * as React from 'react';
import { cellSize } from '../../constants/TetrisConstants';

export interface ITetrisRendererProps {
  fieldWidth: number;
  fieldHeight: number;
  gridState: any[][];
}

export default class TetrisRenderer extends React.PureComponent<ITetrisRendererProps> {
  private cachedGridState!: any[][];
  public backgroundColor = '#cccccc';
  public canvasRef: React.RefObject<any> = React.createRef();

  private drawGrid() {
    this.props.gridState.forEach((row, i: number) => {
      row.forEach((col, j: number) => this.drawSquare(j, i, col));
    });
  }

  private drawSquare(i: number, j: number, color?: string | null) {
    const ctx = this.canvasRef.current.getContext('2d', { alpha: false });

    ctx.fillStyle = color || this.backgroundColor;
    const x = i * cellSize;
    const y = j * cellSize;
    ctx.beginPath();

    ctx.rect(x, y, cellSize, cellSize);
    ctx.fillRect(x, y, cellSize, cellSize);
    ctx.stroke();
    ctx.closePath();
    this.cachedGridState[j][i] = color || null;
  }

  public componentDidUpdate() {
    // prevProps are the same as current for some reason
    this.props.gridState.forEach((row, i) => {
      row.forEach((col, j) => {
        if (col !== this.cachedGridState[i][j]) this.drawSquare(j, i, col);
      });
    });
  }

  public componentDidMount() {
    this.cachedGridState = cloneDeep(this.props.gridState);
    this.drawGrid();
  }

  public render() {
    return (
      <div>
        <canvas
          ref={this.canvasRef}
          id='tetris'
          width={`${this.props.fieldWidth * cellSize + 1}`}
          height={`${this.props.fieldHeight * cellSize + 1}`}
        ></canvas>
      </div>
    );
  }
}
