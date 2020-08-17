import * as math from 'mathjs';

export type ActivationFunction = (x: math.Number) => math.Number;

export const RELU = (x: math.Number): math.Number => {
  if (x < 0) {
    x = 0;
  }
  return x;
};

export const SIGMOID = (x: math.Number): math.Number => {
  return math.divide(1, math.add(1, math.exp(-x)));
};

export const TANH = (x: math.Number): math.Number => {
  return math.tanh(x);
};
