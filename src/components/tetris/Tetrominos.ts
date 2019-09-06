import { ITetromino } from './Types';

export const S_TETR = {
  shape: [[null, true, true], [true, true, null]],
  color: 'green',
  position: { x: 0, y: 0 },
  code: 0,
} as ITetromino;

export const I_TETR = {
  shape: [[true, true, true, true]],
  color: '#00FFFF',
  position: { x: 4, y: 0 },
  code: 1,
} as ITetromino;

export const J_TETR = {
  shape: [[true, null, null], [true, true, true]],
  color: 'blue',
  position: { x: 0, y: 0 },
  code: 2,
} as ITetromino;

export const L_TETR = {
  shape: [[null, null, true], [true, true, true]],
  color: 'orange',
  position: { x: 0, y: 0 },
  code: 3,
} as ITetromino;

export const O_TETR = {
  shape: [[true, true], [true, true]],
  color: 'yellow',
  position: { x: 4, y: 0 },
  code: 4,
} as ITetromino;

export const Z_TETR = {
  shape: [[true, true, null], [null, true, true]],
  color: 'red',
  position: { x: 0, y: 0 },
  code: 5,
} as ITetromino;

export const T_TETR = {
  shape: [[null, true, null], [true, true, true]],
  color: '#800080',
  position: { x: 0, y: 0 },
  code: 6,
} as ITetromino;

export const TETROMINOS = {
  S_TETR,
  I_TETR,
  J_TETR,
  L_TETR,
  Z_TETR,
  T_TETR,
  O_TETR,
};
