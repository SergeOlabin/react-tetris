export interface ITetromino {
  shape: any[][];
  color: string;
  position: {
    x: number;
    y: number;
  };
  code: number;
}
