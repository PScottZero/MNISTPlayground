import * as math from 'mathjs';

export type ActivationFunction = (x: math.Number, mode: FunctionMode, allX?: math.Number[]) => math.Number;

export enum FunctionMode {
  NORMAL,
  DERIV
}

export const RELU = (x: math.Number, mode: FunctionMode): math.Number => {
  if (mode === FunctionMode.NORMAL) {
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

export const SIGMOID = (x: math.Number, mode: FunctionMode): math.Number => {
  if (mode === FunctionMode.NORMAL) {
    return math.divide(1, math.add(1, math.exp(-x)));
  } else {
    return math.multiply(SIGMOID(x, FunctionMode.NORMAL),
      math.subtract(1, SIGMOID(x, FunctionMode.NORMAL)));
  }
};

export const SOFTMAX = (x: math.Number, mode: FunctionMode, allX: math.Number[]): math.Number => {
  if (mode === FunctionMode.NORMAL) {
    return math.number(math.divide(math.exp(math.bignumber(x)), math.sum(math.exp(math.bignumber(allX)))));
  } else {
    return math.multiply(SOFTMAX(x, FunctionMode.NORMAL, allX),
      math.subtract(1, SOFTMAX(x, FunctionMode.NORMAL, allX)));
  }
};

export const TANH = (x: math.Number, mode: FunctionMode): math.Number => {
  if (mode === FunctionMode.NORMAL) {
    return math.tanh(x);
  } else {
    return math.subtract(1, math.pow(math.tanh(x), 2));
  }
};
