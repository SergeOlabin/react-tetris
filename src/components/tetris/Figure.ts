import { reverse, zip } from 'lodash';

type TShape = any[][];
type TColor = string | null;
interface TPosition {
  x: number;
  y: number;
}

export interface IFigure {
  position: TPosition;
  color: TColor;
  shape: TShape;
}

export class Figure {
  public position!: TPosition;
  public color!: TColor;
  public shape!: TShape;

  constructor(value: IFigure) {
    const { position, color, shape } = value;
    this.position = position;
    this.color = color;
    this.shape = shape;
  }

  public getX() {
    return [this.position.x, this.position.x + this.shape[0].length];
  }

  public getY() {
    return [this.position.y, this.position.y + this.shape.length];
  }

  public getLowestLine() {
    return zip(...this.shape)
      .map(col => col.lastIndexOf(true))
      .map(val => val + this.position.y + 1);
  }

  public getRightContour() {
    return this.shape
      .map(row => row.lastIndexOf(true))
      .map(val => val + this.position.x);
  }

  public getLeftContour() {
    return this.shape
      .map(row => row.indexOf(true))
      .map(val => val + this.position.x);
  }

  public moveFigureLeft() {
    this.position.x -= 1;

    return this;
  }

  public moveFigureRight() {
    this.position.x += 1;

    return this;
  }

  public moveFigureDown() {
    this.position.y += 1;

    return this;
  }

  public rotate() {
    const newShape = zip(...reverse(this.shape));
    this.shape = newShape;

    return this;
  }
}
