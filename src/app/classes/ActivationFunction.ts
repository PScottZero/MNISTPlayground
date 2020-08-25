import * as math from 'mathjs';

export type ActivationFunction = (x: math.Number, deriv: boolean) => math.Number;

export const RELU = (x: math.Number, deriv: boolean): math.Number => {
  if (!deriv) {
    if (x < 0) {
      return 0;
    }
    return x;
  } else {
    if (x < 0) {
      return 0;
    }
    return 1;
  }
};

export const SIGMOID = (x: math.Number, deriv: boolean): math.Number => {
  if (!deriv) {
    return math.divide(1, math.add(1, math.exp(-x)));
  } else {
    return math.multiply(SIGMOID(x, false), math.subtract(1, SIGMOID(x, false)));
  }
};

export const TANH = (x: math.Number, deriv: boolean): math.Number => {
  if (!deriv) {
    return math.tanh(x);
  } else {
    return math.subtract(1, math.pow(math.tanh(x), 2));
  }
};
