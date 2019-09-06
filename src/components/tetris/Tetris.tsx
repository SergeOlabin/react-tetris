import kh from 'keypress-handler';
import { cloneDeep, every, find, flatten, isNil, random, some, zip } from 'lodash';
import * as React from 'react';
import NextTetrisFigure from '../next-tetris-figure/NextTetrisFigure';
import { TetrisInfo } from '../tetris-info/TetrisInfo';
import TetrisRenderer from '../tetris-renderer/TetrisRenderer';
import { Figure, IFigure } from './Figure';
import './tetris.scss';
import { TETROMINOS } from './Tetrominos';
import { ITetromino } from './Types';

export interface ITetrisState {
  gridState: any[][];
  nextFigureCode: number | null;
  points: number;
  level: number;
  linesBurnedPerLevel: number;
}

export default class Tetris extends React.PureComponent<{}, ITetrisState> {
  // RULES
  private timer = 1068; // 0.0156G start see https://tetris.fandom.com/wiki/Drop
  private levelLinesGoal = 5; // !!!!

  private interval!: NodeJS.Timer;
  private activeFigure!: Figure | null;
  public fieldWidth = 10;
  public fieldHeight = 20;

  public backgroundColor = '#cccccc';
  public canvasRef: React.RefObject<any> = React.createRef();

  constructor(props: {}) {
    super(props);

    this.state = {
      gridState: Array(this.fieldHeight)
        .fill(null)
        .map(() => Array(this.fieldWidth).fill(null)),
      nextFigureCode: null,
      points: 0,
      level: 1,
      linesBurnedPerLevel: 0,
    };

    kh.run(75);
  }

  private drawFigure({ shape, color, position }: IFigure) {
    const newGridState = [...this.state.gridState];

    shape.forEach((row, i: number) => {
      row.forEach((val, j: number) => {
        const x = j + position.x;
        const y = i + position.y;
        if (val) newGridState[y][x] = color;
      });
    });
    this.setState({ gridState: newGridState });
  }

  private reRenderActiveFigureWith(handler: () => void) {
    if (!this.activeFigure) return;
    this.drawFigure({
      ...this.activeFigure,
      color: null,
    });

    handler();
    this.drawFigure(this.activeFigure);
  }

  private addFigure(figureCode?: number) {
    this.activeFigure = null;
    const generedCode =
      figureCode || !isNil(this.state.nextFigureCode)
        ? this.state.nextFigureCode
        : random(6);

    this.setNextFigureCode();

    const tetr = find(TETROMINOS, value => value.code === generedCode) as ITetromino;
    const { shape, color, position } = cloneDeep(tetr);

    this.activeFigure = new Figure({ shape, color, position });
    if (!this.canDrawNewFigure(this.activeFigure)) this.gameOver();
    else this.drawFigure(this.activeFigure);
  }

  private canDrawNewFigure({ shape, position }: IFigure) {
    // TODO: change the implementation
    let possibilityToDraw = true;

    shape.forEach((row, i: number) => {
      row.forEach((val, j: number) => {
        const x = j + position.x;
        const y = i + position.y;

        if (this.state.gridState[y][x]) {
          possibilityToDraw = false;
          return;
        }
      });
    });

    return possibilityToDraw;
  }

  private gameOver() {
    this.deregisterHandlers();

    alert(`Game Over! \nYour points: ${this.state.points}`);
  }

  private startTimer() {
    if (this.interval) clearInterval(this.interval);

    this.interval = setInterval(() => {
      if (this.activeFigure) this.moveFigureDown(this.activeFigure);
    }, this.timer);
  }

  private setNextFigureCode() {
    this.setState({ nextFigureCode: random(6) });
  }

  private addPointsPerBurnedLines(linesBurned: number) {
    const pointsToAddMap = [40, 100, 300, 1200];
    const pointsToAdd = pointsToAddMap[linesBurned - 1];

    this.setState(state => ({ points: state.points + pointsToAdd }));
  }

  private recalculateLevel(linesBurned: number) {
    const linesBurnedTotalPerLevel = this.state.linesBurnedPerLevel + linesBurned;

    const diff = linesBurnedTotalPerLevel - this.levelLinesGoal;
    if (diff < 0) {
      this.setState({ linesBurnedPerLevel: linesBurnedTotalPerLevel });
      return;
    }

    this.levelUp();
    this.setState({ linesBurnedPerLevel: diff });
  }

  private levelUp() {
    this.setState(state => ({ level: state.level + 1 }));
    this.timer = this.timer / 1.5;
  }

  public moveFigureLeft(figure: Figure) {
    const leftReached = figure.position.x === 0;
    if (leftReached) return;

    const leftContour = figure.getLeftContour();
    const figureRows = this.state.gridState.slice(...figure.getY());
    const leftCells = leftContour.map((val, i) => figureRows[i][val - 1]);
    const leftTaken = some(leftCells);

    if (leftTaken) return;

    this.reRenderActiveFigureWith(() => figure.moveFigureLeft());
  }

  public moveFigureRight(figure: Figure) {
    const rightReached = figure.getX()[1] === this.fieldWidth;
    if (rightReached) return;

    const rightContour = figure.getRightContour();
    const figureRows = this.state.gridState.slice(...figure.getY());
    const rightCells = rightContour.map((val, i) => figureRows[i][val + 1]);
    const rightTaken = some(rightCells);

    if (rightTaken) return;

    this.reRenderActiveFigureWith(() => figure.moveFigureRight());
  }

  public moveFigureDown(figure: Figure) {
    this.startTimer();
    const bottomReached = figure.getY()[1] === this.fieldHeight;
    if (bottomReached) {
      this.checkAndBurnLines(figure.getY());
      this.addFigure();
      return;
    }

    const lowestLine = figure.getLowestLine();
    const verticalProjection = zip(
      ...this.state.gridState.map(row => row.slice(...figure.getX())),
    );
    const lowerCells = lowestLine.map((val, i) => verticalProjection[i][val]);
    const bottomTaken = some(lowerCells);

    if (bottomTaken) {
      this.checkAndBurnLines(figure.getY());
      this.addFigure();
      return;
    }
    this.reRenderActiveFigureWith(() => figure.moveFigureDown());
  }

  public rotateFigure(figure: Figure) {
    const rotatedFigure = cloneDeep(figure).rotate();
    if (rotatedFigure.getX()[1] > this.fieldWidth) return;

    const gridStateWithoutActiveFigure = cloneDeep(this.state.gridState);
    figure.shape.forEach((row, i) =>
      row.forEach((col, j) => {
        gridStateWithoutActiveFigure[i + figure.position.y][j + figure.position.x] = null;
      }),
    );

    const rotatedFigureGridSlice = gridStateWithoutActiveFigure
      .slice(...rotatedFigure.getY())
      .map(row => row.slice(...rotatedFigure.getX()));

    if (some(flatten(rotatedFigureGridSlice))) return;
    this.reRenderActiveFigureWith(() => figure.rotate());
  }

  public checkAndBurnLines(range?: number[]) {
    const newGridState = [...this.state.gridState];
    const rangeToCheck = range || [0, this.fieldHeight];
    const gridOfRange = newGridState.slice(...rangeToCheck);
    const filled = gridOfRange.filter(row => every(row));

    if (!filled.length) return;

    const indexes = filled
      .map(row => newGridState.findIndex(value => value === row))
      .reverse();

    indexes.forEach(index => newGridState.splice(index, 1));
    const addition = Array(indexes.length)
      .fill(null)
      .map(() => Array(this.fieldWidth).fill(null));
    newGridState.unshift(...addition);

    this.addPointsPerBurnedLines(filled.length);
    this.recalculateLevel(filled.length);

    this.setState({ gridState: newGridState });
  }

  public startGame() {
    if (!this.activeFigure) this.addFigure();
    this.registerHandlers();
    this.startTimer();
  }

  public componentWillUnmount() {
    this.deregisterHandlers();
  }

  public deregisterHandlers() {
    clearInterval(this.interval);
    kh.stop();
  }

  public registerHandlers() {
    clearInterval(this.interval);

    const moveFunc = (handler: Function) => {
      return () => {
        if (!this.activeFigure) return;
        handler.call(this, this.activeFigure);
      };
    };

    kh.onKey(37, moveFunc(this.moveFigureLeft), { hold: true });
    kh.onKey(39, moveFunc(this.moveFigureRight), { hold: true });
    kh.onKey(40, moveFunc(this.moveFigureDown), { hold: true });
    kh.onKey(38, moveFunc(this.rotateFigure));
  }

  public render() {
    return (
      <div className='tetris-root'>
        <span className='title'>TETRIS</span>

        <div className='tetris-container'>
          <div className='tetris'>
            <TetrisRenderer
              fieldWidth={this.fieldWidth}
              fieldHeight={this.fieldHeight}
              gridState={this.state.gridState}
            ></TetrisRenderer>
          </div>

          <div className='tetris-info-container'>
            <TetrisInfo points={this.state.points} level={this.state.level}></TetrisInfo>
            <div className='next-figure-container'>
              <span className='next-figure-title'>Next Figure: </span>
              <NextTetrisFigure figureCode={this.state.nextFigureCode}></NextTetrisFigure>
            </div>
            <div className='control-buttons'>
              <button onClick={this.startGame.bind(this)}>Start</button>
              <button onClick={() => clearInterval(this.interval)}>Stop</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
