import * as math from 'mathjs';

export class NeuronDeriv {
  weightDeriv: math.Number[];
  biasDeriv: math.Number;
  activationDeriv: math.Number[];

  constructor() {
    this.weightDeriv = [];
    this.activationDeriv = [];
    this.biasDeriv = 0;
  }
}
