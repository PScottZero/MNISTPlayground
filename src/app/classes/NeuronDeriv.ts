import * as math from 'mathjs';

export class NeuronDeriv {
  weightDeriv: math.Number[];
  biasDeriv: math.Number;

  constructor() {
    this.weightDeriv = [];
    this.biasDeriv = 0;
  }
}
