import * as math from 'mathjs';

export type ActivationFunction = (x: math.Number, deriv: FunctionMode) => math.Number;

export enum FunctionMode {
  NORMAL,
  DERIV
}

export const RELU = (x: math.Number, deriv: FunctionMode): math.Number => {
  if (deriv === FunctionMode.NORMAL) {
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

export const SIGMOID = (x: math.Number, deriv: FunctionMode): math.Number => {
  if (deriv === FunctionMode.NORMAL) {
    return math.divide(1, math.add(1, math.exp(-x)));
  } else {
    return math.multiply(SIGMOID(x, FunctionMode.NORMAL), math.subtract(1, SIGMOID(x, FunctionMode.NORMAL)));
  }
};

export const TANH = (x: math.Number, deriv: FunctionMode): math.Number => {
  if (deriv === FunctionMode.NORMAL) {
    return math.tanh(x);
  } else {
    return math.subtract(1, math.pow(math.tanh(x), 2));
  }
};
